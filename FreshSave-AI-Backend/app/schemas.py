from datetime import datetime
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field


class ProductCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    category: str = Field(min_length=2, max_length=60)
    unit: str = Field(default="1 unit", max_length=40)
    unit_cost: float = Field(default=0.0, ge=0)
    base_price: float = Field(gt=0)
    shelf_life_days: int = Field(default=7, gt=0, le=3650)
    average_daily_demand: float = Field(default=0.0, ge=0)
    price_sensitivity: float = Field(default=1.0, ge=0, le=10)
    description: str | None = Field(default=None, max_length=1000)
    image_url: str | None = Field(default=None, max_length=2000)
    active: bool = True
    initial_stock: int = Field(default=0, ge=0)


class CustomerProductResponse(BaseModel):
    id: str
    name: str
    category: str
    unit: str = "1 unit"
    base_price: float
    discount_percent: int = 0
    discount_price: float
    shelf_life_days: int | None = None
    stock: int = 0
    is_deal: bool = False
    deal_reason: str | None = None
    deal_valid_until: str | None = None
    rating: float | None = None
    reviews_count: int | None = None
    description: str | None = None
    image_url: str | None = None
    active: bool = True
    created_at: str | None = None
    updated_at: str | None = None

    model_config = ConfigDict(from_attributes=True)


class AnalyticsResponse(BaseModel):
    revenue: float
    cost_of_goods_sold: float
    gross_profit: float
    gross_margin_percent: float
    units_sold: int
    available_inventory_units: int
    near_expiry_inventory_units: int
    expired_or_wasted_units: int
    order_counts: int
    active_deals_count: int
    products_count: int
    generated_at: str


class MessageResponse(BaseModel):
    message: str


class RoleInfo(BaseModel):
    role: Literal["retailer", "customer"]
    note: str

