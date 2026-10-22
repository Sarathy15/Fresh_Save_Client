from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from pymongo.errors import PyMongoError

from app.database import get_database
from app.schemas import AnalyticsResponse

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("", response_model=AnalyticsResponse)
async def get_analytics():
    """
    Calculate authoritative store business metrics directly from MongoDB records.
    Never uses hardcoded arrays or synthetic simulation results as real business data.
    If no sales exist, truthful zero states are returned.
    """
    db = get_database()
    now = datetime.now(timezone.utc)

    try:
        # 1. Sales & Revenue metrics from sales collection
        sales = []
        if hasattr(db, "sales"):
            sales = await db.sales.find({}).to_list(length=2000)

        revenue = 0.0
        cogs = 0.0
        gross_profit = 0.0
        units_sold = 0

        for s in sales:
            rev = float(s.get("revenue", 0.0))
            cost = float(s.get("unit_cost", 0.0))
            qty = int(s.get("units_sold", 0))
            profit = float(s.get("gross_profit", rev - (cost * qty)))

            revenue += rev
            cogs += cost * qty
            gross_profit += profit
            units_sold += qty

        # If sales records are empty, fallback to orders collection if orders were placed
        if len(sales) == 0 and hasattr(db, "orders"):
            orders = await db.orders.find({}).to_list(length=2000)
            for o in orders:
                revenue += float(o.get("final_total", 0.0))
                units_sold += int(o.get("item_count", 0))
            gross_profit = revenue  # cost unknown if not logged

        revenue = round(revenue, 2)
        cogs = round(cogs, 2)
        gross_profit = round(gross_profit, 2)
        gross_margin_pct = round((gross_profit / revenue * 100.0), 2) if revenue > 0 else 0.0

        # 2. Inventory Batch metrics from inventory_batches collection
        batches = []
        if hasattr(db, "inventory_batches"):
            batches = await db.inventory_batches.find({}).to_list(length=2000)

        available_units = 0
        near_expiry_units = 0
        expired_units = 0

        for b in batches:
            qty = int(b.get("quantity_remaining", 0))
            status_val = b.get("status", "active")
            if status_val == "expired":
                expired_units += qty
            else:
                available_units += qty
                if status_val == "high_risk":
                    near_expiry_units += qty

        # 3. Counts
        order_count = 0
        if hasattr(db, "orders"):
            order_count = await db.orders.count_documents({})

        active_deals = 0
        if hasattr(db, "deals"):
            active_deals = await db.deals.count_documents({
                "status": "active",
                "published_to_customer": True,
            })

        products_count = 0
        if hasattr(db, "products"):
            products_count = await db.products.count_documents({"active": True})

        return AnalyticsResponse(
            revenue=revenue,
            cost_of_goods_sold=cogs,
            gross_profit=gross_profit,
            gross_margin_percent=gross_margin_pct,
            units_sold=units_sold,
            available_inventory_units=available_units,
            near_expiry_inventory_units=near_expiry_units,
            expired_or_wasted_units=expired_units,
            order_counts=order_count,
            active_deals_count=active_deals,
            products_count=products_count,
            generated_at=now.isoformat(),
        )
    except PyMongoError as exc:
        raise HTTPException(
            status_code=500, detail="Could not calculate analytics from database records."
        ) from exc
