from datetime import datetime, timezone
from bson import ObjectId
from fastapi import APIRouter, HTTPException
from pymongo.errors import PyMongoError

from app.database import get_database
from app.routers.products import resolve_product_stock_and_deal

router = APIRouter(prefix="/api/deals", tags=["Smart Deals"])


@router.get("")
async def list_active_deals():
    """
    Fetch confirmed retailer-approved food-waste reduction smart deals.
    Authoritatively combines published active deals from `deals` collection
    and products marked with `is_deal: True` in MongoDB.
    """
    db = get_database()
    items = []
    seen_ids = set()

    try:
        # 1. Fetch from deals collection
        if hasattr(db, "deals"):
            deals_cursor = db.deals.find({
                "status": "active",
                "published_to_customer": True,
            })
            deals_docs = await deals_cursor.to_list(length=50)

            for d in deals_docs:
                pid = d.get("product_id")
                if pid:
                    prod = await db.products.find_one({"_id": pid})
                    if prod and prod.get("active", True) and str(prod["_id"]) not in seen_ids:
                        serialized = await resolve_product_stock_and_deal(prod, db)
                        items.append(serialized)
                        seen_ids.add(str(prod["_id"]))

        # 2. Fetch any products directly flagged as deals in products collection
        prod_cursor = db.products.find({"active": True, "is_deal": True})
        prod_docs = await prod_cursor.to_list(length=50)
        for p in prod_docs:
            if str(p["_id"]) not in seen_ids:
                serialized = await resolve_product_stock_and_deal(p, db)
                items.append(serialized)
                seen_ids.add(str(p["_id"]))

        return {
            "items": items,
            "total": len(items),
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "policy": "Retailer-Approved Dynamic Markdown & Food-Waste Reduction Deals",
        }
    except PyMongoError as exc:
        raise HTTPException(
            status_code=500, detail="Could not retrieve smart deals from database."
        ) from exc

