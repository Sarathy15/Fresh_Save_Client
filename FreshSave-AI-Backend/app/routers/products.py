import math
from datetime import datetime, timezone, timedelta
from bson import ObjectId
from fastapi import APIRouter, HTTPException, Query, status
from pymongo.errors import PyMongoError

from app.database import get_database
from app.schemas import ProductCreate

router = APIRouter(prefix="/api/products", tags=["Products"])


async def resolve_product_stock_and_deal(doc: dict, db) -> dict:
    """
    Authoritatively resolve stock and active deals from MongoDB collections.
    Calculates stock from inventory_batches if present.
    Resolves active smart deals from deals collection if present.
    Ensures internal unit costs and sensitive algorithms are never leaked to customers.
    """
    prod_id = doc.get("_id")
    base_price = float(doc.get("base_price", 0.0))

    # 1. Authoritative Stock Calculation
    # First check live inventory batches in MongoDB
    stock = 0
    if prod_id and hasattr(db, "inventory_batches"):
        try:
            batches = await db.inventory_batches.find(
                {"product_id": prod_id, "status": {"$ne": "expired"}}
            ).to_list(length=100)
            if batches:
                stock = sum(int(b.get("quantity_remaining", 0)) for b in batches)
            else:
                stock = int(doc.get("stock", 0))
        except Exception:
            stock = int(doc.get("stock", 0))
    else:
        stock = int(doc.get("stock", 0))

    # 2. Authoritative Deal Resolution
    is_deal = False
    deal_price = base_price
    discount_pct = 0
    deal_reason = None
    deal_valid_until = None

    if prod_id and hasattr(db, "deals"):
        try:
            deal_doc = await db.deals.find_one({
                "product_id": prod_id,
                "status": "active",
                "published_to_customer": True,
            })
            if deal_doc:
                is_deal = True
                deal_price = float(deal_doc.get("deal_price", base_price))
                discount_pct = int(round(deal_doc.get("discount_percentage", 0)))
                deal_reason = deal_doc.get("reason", "Retailer-Approved Dynamic Markdown")
                deal_valid_until = deal_doc.get("end_date")
        except Exception:
            pass

    # Fallback to product-level deal fields if explicitly configured
    if not is_deal and doc.get("is_deal"):
        is_deal = True
        discount_pct = int(doc.get("discount_percent", 0))
        if discount_pct > 0:
            deal_price = round(base_price * (1 - discount_pct / 100.0), 2)
        else:
            deal_price = float(doc.get("discount_price", base_price))
        deal_reason = doc.get("deal_reason")
        deal_valid_until = doc.get("deal_valid_until")

    # Serialize timestamps
    created_at = doc.get("created_at")
    if isinstance(created_at, datetime):
        created_at = created_at.isoformat()
    elif created_at is not None:
        created_at = str(created_at)

    updated_at = doc.get("updated_at")
    if isinstance(updated_at, datetime):
        updated_at = updated_at.isoformat()
    elif updated_at is not None:
        updated_at = str(updated_at)

    # Truthful rating - omit or None if not recorded
    rating = doc.get("rating")
    rating_val = float(rating) if rating is not None else None
    reviews_count = doc.get("reviews_count")
    reviews_val = int(reviews_count) if reviews_count is not None else None

    return {
        "id": str(prod_id),
        "name": doc.get("name", ""),
        "category": doc.get("category", "General"),
        "unit": doc.get("unit", "1 unit"),
        "base_price": base_price,
        "discount_percent": discount_pct,
        "discount_price": deal_price,
        "shelf_life_days": doc.get("shelf_life_days"),
        "stock": stock,
        "is_deal": is_deal,
        "deal_reason": deal_reason,
        "deal_valid_until": deal_valid_until,
        "rating": rating_val,
        "reviews_count": reviews_val,
        "description": doc.get("description"),
        "image_url": doc.get("image_url"),
        "active": doc.get("active", True),
        "created_at": created_at,
        "updated_at": updated_at,
    }


@router.get("/categories")
async def list_categories():
    """Retrieve all distinct product categories present in MongoDB."""
    db = get_database()
    try:
        categories = await db.products.distinct("category")
        return {"categories": sorted(categories) if categories else []}
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Could not retrieve categories.") from exc


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_product(payload: ProductCreate):
    """
    Authorized retailer product creation endpoint.
    Inserts product into MongoDB products collection and creates an initial inventory batch.
    """
    db = get_database()
    now = datetime.now(timezone.utc)
    document = payload.model_dump()
    initial_stock = document.pop("initial_stock", 0)
    document.update({
        "created_at": now,
        "updated_at": now,
        "stock": initial_stock,
    })

    try:
        result = await db.products.insert_one(document)
        product_id = result.inserted_id

        # If initial stock was provided, create an active batch in inventory_batches
        if initial_stock > 0 and hasattr(db, "inventory_batches"):
            shelf_days = payload.shelf_life_days or 7
            expiry_date = (now + timedelta(days=shelf_days)).strftime("%Y-%m-%d")
            batch_doc = {
                "product_id": product_id,
                "batch_number": f"BATCH-{product_id.binary[-4:].hex().upper()}",
                "original_quantity": initial_stock,
                "quantity_remaining": initial_stock,
                "unit_cost": payload.unit_cost,
                "selling_price": payload.base_price,
                "received_date": now.strftime("%Y-%m-%d"),
                "expiry_date": expiry_date,
                "supplier": "Store Direct Receiving",
                "status": "active",
                "created_at": now,
                "updated_at": now,
            }
            await db.inventory_batches.insert_one(batch_doc)

        created = await db.products.find_one({"_id": product_id})
        return await resolve_product_stock_and_deal(created, db)
    except PyMongoError as exc:
        raise HTTPException(status_code=500, detail="Could not save product.") from exc


@router.get("")
async def list_products(
    category: str | None = None,
    search: str | None = None,
    active: bool | None = True,
    deal_only: bool | None = None,
    limit: int = Query(default=50, ge=1, le=200),
    skip: int = Query(default=0, ge=0),
):
    """List products with optional category, search, active and deal filters."""
    db = get_database()
    filters: dict = {}
    if category and category.lower() != "all":
        filters["category"] = category
    if active is not None:
        filters["active"] = active

    try:
        cursor = db.products.find(filters).sort("created_at", -1).skip(skip).limit(limit)
        docs = await cursor.to_list(length=limit)

        serialized = [await resolve_product_stock_and_deal(doc, db) for doc in docs]

        if deal_only:
            serialized = [item for item in serialized if item["is_deal"]]

        if search and search.strip():
            query_lower = search.strip().lower()
            serialized = [
                item for item in serialized
                if query_lower in item["name"].lower()
                or (item["description"] and query_lower in item["description"].lower())
                or query_lower in item["category"].lower()
            ]

        return {"items": serialized, "total": len(serialized), "limit": limit, "skip": skip}
    except PyMongoError as exc:
        raise HTTPException(status_code=500, detail="Could not retrieve products from database.") from exc


@router.get("/{product_id}")
async def get_product(product_id: str):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid product ID.")
    db = get_database()
    doc = await db.products.find_one({"_id": ObjectId(product_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Product not found.")
    return await resolve_product_stock_and_deal(doc, db)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deactivate_product(product_id: str):
    """Soft-delete a product; keep historical records intact."""
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid product ID.")
    db = get_database()
    result = await db.products.update_one(
        {"_id": ObjectId(product_id)},
        {"$set": {"active": False, "updated_at": datetime.now(timezone.utc)}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found.")
    return None

