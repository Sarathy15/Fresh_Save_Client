import random
import string
from datetime import datetime, timezone, timedelta
from bson import ObjectId
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from pymongo.errors import PyMongoError

from app.database import get_database

router = APIRouter(prefix="/api/orders", tags=["Orders"])


class OrderItemRequest(BaseModel):
    product_id: str
    quantity: int = Field(gt=0, le=50)


class OrderCreateRequest(BaseModel):
    customer_name: str = Field(min_length=2, max_length=100)
    customer_email: str | None = Field(default=None, max_length=120)
    customer_phone: str = Field(min_length=10, max_length=15)
    delivery_address: str = Field(min_length=5, max_length=300)
    delivery_city: str = Field(min_length=2, max_length=50, default="Bengaluru")
    delivery_pincode: str = Field(min_length=6, max_length=10, default="560001")
    delivery_slot: str = Field(default="Today in 60-90 Mins")
    payment_method: str = Field(default="Simulated UPI")
    items: list[OrderItemRequest] = Field(min_length=1)


def generate_order_id() -> str:
    chars = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"FS-{chars}"


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_order(payload: OrderCreateRequest):
    """
    Safe order creation with authoritative server-side price calculation, FEFO batch stock decrement,
    and sales recording. Never trusts client-side prices or totals.
    """
    db = get_database()
    validated_items = []
    authoritative_subtotal = 0.0
    original_subtotal = 0.0
    deal_units_diverted = 0
    now = datetime.now(timezone.utc)
    order_id = generate_order_id()

    # 1. Authoritative price & stock validation
    for item_req in payload.items:
        prod_id_str = item_req.product_id
        doc = None
        if ObjectId.is_valid(prod_id_str):
            doc = await db.products.find_one({"_id": ObjectId(prod_id_str)})
        if not doc:
            doc = await db.products.find_one({"id": prod_id_str})
        if not doc:
            raise HTTPException(
                status_code=400,
                detail=f"Product with ID '{prod_id_str}' not found in store catalogue.",
            )

        if not doc.get("active", True):
            raise HTTPException(
                status_code=400,
                detail=f"Product '{doc.get('name')}' is currently inactive and cannot be ordered.",
            )

        prod_oid = doc["_id"]

        # Check stock from inventory batches if present
        batches = []
        if hasattr(db, "inventory_batches"):
            try:
                batches = await db.inventory_batches.find(
                    {"product_id": prod_oid, "status": {"$ne": "expired"}, "quantity_remaining": {"$gt": 0}}
                ).sort("expiry_date", 1).to_list(length=100)
            except Exception:
                batches = []

        total_available_stock = sum(int(b.get("quantity_remaining", 0)) for b in batches) if batches else int(doc.get("stock", 0))

        if total_available_stock < item_req.quantity:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Insufficient stock for '{doc.get('name')}'. "
                    f"Requested: {item_req.quantity}, Available: {total_available_stock}."
                ),
            )

        # Determine authoritative unit price & discount
        base_price = float(doc.get("base_price", 0.0))
        unit_price = base_price
        is_deal_item = False

        # Check active deals collection first
        if hasattr(db, "deals"):
            try:
                active_deal = await db.deals.find_one({
                    "product_id": prod_oid,
                    "status": "active",
                    "published_to_customer": True,
                })
                if active_deal:
                    unit_price = float(active_deal.get("deal_price", base_price))
                    is_deal_item = True
            except Exception:
                pass

        # Fallback to product-level discount if no deal doc
        if not is_deal_item:
            discount_pct = float(doc.get("discount_percent", 0.0))
            if discount_pct > 0:
                unit_price = round(base_price * (1 - discount_pct / 100.0), 2)
                is_deal_item = True
            elif doc.get("discount_price") and float(doc.get("discount_price")) < base_price:
                unit_price = float(doc.get("discount_price"))
                is_deal_item = True

        if is_deal_item:
            deal_units_diverted += item_req.quantity

        item_total = round(unit_price * item_req.quantity, 2)
        item_original_total = round(base_price * item_req.quantity, 2)

        authoritative_subtotal += item_total
        original_subtotal += item_original_total

        validated_items.append({
            "product_id": str(prod_oid),
            "name": doc.get("name"),
            "unit": doc.get("unit", "1 unit"),
            "unit_price": unit_price,
            "base_price": base_price,
            "quantity": item_req.quantity,
            "total_price": item_total,
            "image_url": doc.get("image_url"),
        })

        # Decrement stock in FEFO (First Expired First Out) order across batches
        remaining_to_deduct = item_req.quantity
        for batch in batches:
            if remaining_to_deduct <= 0:
                break
            batch_qty = int(batch.get("quantity_remaining", 0))
            deduct_from_batch = min(batch_qty, remaining_to_deduct)
            new_batch_qty = batch_qty - deduct_from_batch
            new_status = "depleted" if new_batch_qty == 0 else batch.get("status", "active")

            await db.inventory_batches.update_one(
                {"_id": batch["_id"]},
                {"$set": {"quantity_remaining": new_batch_qty, "status": new_status, "updated_at": now}},
            )

            # Record in sales collection
            if hasattr(db, "sales"):
                unit_cost = float(batch.get("unit_cost", doc.get("unit_cost", 0.0)))
                sale_rev = round(unit_price * deduct_from_batch, 2)
                sale_profit = round((unit_price - unit_cost) * deduct_from_batch, 2)
                sale_record = {
                    "order_id": order_id,
                    "product_id": prod_oid,
                    "batch_id": batch["_id"],
                    "units_sold": deduct_from_batch,
                    "unit_cost": unit_cost,
                    "selling_price": unit_price,
                    "revenue": sale_rev,
                    "gross_profit": sale_profit,
                    "is_deal": is_deal_item,
                    "sale_timestamp": now,
                    "date": now.strftime("%Y-%m-%d %H:%M"),
                    "product_name": doc.get("name"),
                    "category": doc.get("category", "General"),
                    "batch_number": batch.get("batch_number", "UNKNOWN"),
                    "created_at": now,
                }
                await db.sales.insert_one(sale_record)

            remaining_to_deduct -= deduct_from_batch

        # Also update product-level stock
        new_prod_stock = max(0, total_available_stock - item_req.quantity)
        await db.products.update_one(
            {"_id": prod_oid},
            {"$set": {"stock": new_prod_stock, "updated_at": now}},
        )

    # 2. Server-side authoritative fee, savings, and total calculation
    authoritative_subtotal = round(authoritative_subtotal, 2)
    original_subtotal = round(original_subtotal, 2)
    savings = max(0.0, round(original_subtotal - authoritative_subtotal, 2))

    delivery_fee = 0.0 if authoritative_subtotal >= 499.0 else 40.0
    final_total = round(authoritative_subtotal + delivery_fee, 2)
    waste_diverted_kg = round(deal_units_diverted * 0.45 + (len(validated_items) * 0.15), 2)
    estimated_delivery = now + timedelta(hours=2)

    order_doc = {
        "order_id": order_id,
        "customer_name": payload.customer_name,
        "customer_email": payload.customer_email,
        "customer_phone": payload.customer_phone,
        "delivery_address": payload.delivery_address,
        "delivery_city": payload.delivery_city,
        "delivery_pincode": payload.delivery_pincode,
        "delivery_slot": payload.delivery_slot,
        "payment_method": payload.payment_method,
        "payment_status": "Confirmed" if payload.payment_method != "COD" else "Pending (Cash on Delivery)",
        "order_status": "Confirmed",
        "items": validated_items,
        "item_count": sum(it["quantity"] for it in validated_items),
        "subtotal": authoritative_subtotal,
        "original_subtotal": original_subtotal,
        "savings": savings,
        "delivery_fee": delivery_fee,
        "final_total": final_total,
        "food_waste_diverted_kg": waste_diverted_kg,
        "created_at": now.isoformat(),
        "estimated_delivery": estimated_delivery.isoformat(),
    }

    try:
        await db.orders.insert_one(order_doc)
        order_doc.pop("_id", None)
        return order_doc
    except PyMongoError as exc:
        raise HTTPException(status_code=500, detail="Could not record order in database.") from exc


@router.get("")
async def list_orders(limit: int = 50):
    """List customer orders authoritatively persisted in MongoDB."""
    db = get_database()
    try:
        cursor = db.orders.find({}).sort("created_at", -1).limit(limit)
        docs = await cursor.to_list(length=limit)
        for doc in docs:
            doc.pop("_id", None)
        return {"orders": docs}
    except PyMongoError as exc:
        raise HTTPException(status_code=500, detail="Could not retrieve orders from database.") from exc


@router.get("/{order_id}")
async def get_order_by_id(order_id: str):
    """Retrieve details for a specific order by order_id."""
    db = get_database()
    doc = await db.orders.find_one({"order_id": order_id})
    if not doc:
        raise HTTPException(status_code=404, detail=f"Order '{order_id}' not found.")
    doc.pop("_id", None)
    return doc

