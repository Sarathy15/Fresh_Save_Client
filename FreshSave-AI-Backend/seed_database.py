"""
seed_database.py - Safe database seeding utility for FreshSave AI.

Usage:
    python seed_database.py

Requires:
    MONGODB_URI set in environment or in .env
"""

import os
import sys
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME", "freshsave_ai")

if not MONGODB_URI:
    print("[ERROR] MONGODB_URI is not set. Please set MONGODB_URI in your environment or .env file.")
    sys.exit(1)

client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)

try:
    client.admin.command("ping")
    print(f"[OK] Connected to MongoDB database '{DATABASE_NAME}'.")
except Exception as exc:
    print(f"[ERROR] Could not connect to MongoDB Atlas: {exc}")
    sys.exit(1)

db = client[DATABASE_NAME]

# Check existing products
existing_count = db.products.count_documents({})
if existing_count > 0:
    print(f"[INFO] Collection 'products' already contains {existing_count} items. Skipping initial seeding to protect live data.")
    print("If you wish to re-seed, manually remove the documents or specify an empty database.")
    sys.exit(0)

INITIAL_PRODUCTS = [
    {
        "name": "Organic Alphonso Mangoes",
        "category": "Produce",
        "unit": "1 kg (approx. 4-5 pcs)",
        "unit_cost": 75.0,
        "base_price": 120.0,
        "discount_percent": 15,
        "discount_price": 102.0,
        "shelf_life_days": 3,
        "average_daily_demand": 20,
        "price_sensitivity": 1.1,
        "stock": 45,
        "is_deal": True,
        "deal_reason": "Optimal ripeness peak surplus markdown",
        "image_url": "https://images.unsplash.com/photo-1553279768-865429fa0078?w=500&auto=format&fit=crop&q=80",
        "description": "Naturally tree-ripened organic Ratnagiri Alphonso mangoes. Rich golden pulp with intense sweet aroma, inspected for zero chemical carbide treatment.",
        "active": True,
        "rating": 4.8,
        "reviews_count": 42,
    },
    {
        "name": "Farm Fresh A2 Whole Milk",
        "category": "Dairy & Eggs",
        "unit": "1 Litre Pouch",
        "unit_cost": 48.0,
        "base_price": 68.0,
        "discount_percent": 0,
        "discount_price": 68.0,
        "shelf_life_days": 2,
        "average_daily_demand": 50,
        "price_sensitivity": 0.8,
        "stock": 80,
        "is_deal": False,
        "deal_reason": None,
        "image_url": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80",
        "description": "Pasteurized non-homogenized pure A2 cow milk sourced directly from verified local dairy cooperatives. Delivered within 6 hours of morning milking.",
        "active": True,
        "rating": 4.9,
        "reviews_count": 89,
    },
    {
        "name": "Artisanal Sourdough Boule",
        "category": "Bakery",
        "unit": "450g Loaf",
        "unit_cost": 80.0,
        "base_price": 140.0,
        "discount_percent": 20,
        "discount_price": 112.0,
        "shelf_life_days": 2,
        "average_daily_demand": 15,
        "price_sensitivity": 1.2,
        "stock": 18,
        "is_deal": True,
        "deal_reason": "Baked this morning - day-end freshness markdown",
        "image_url": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80",
        "description": "Slow-fermented 36-hour wild sourdough loaf made with unbleached stoneground flour and natural wild starter. Crispy crust with open airy crumb.",
        "active": True,
        "rating": 4.7,
        "reviews_count": 31,
    },
    {
        "name": "Hydroponic English Spinach",
        "category": "Produce",
        "unit": "250g Bunch",
        "unit_cost": 22.0,
        "base_price": 38.0,
        "discount_percent": 0,
        "discount_price": 38.0,
        "shelf_life_days": 4,
        "average_daily_demand": 30,
        "price_sensitivity": 0.9,
        "stock": 35,
        "is_deal": False,
        "deal_reason": None,
        "image_url": "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop&q=80",
        "description": "Pesticide-free hydroponically grown tender baby spinach leaves, pre-washed in ozonated water and air-packed to preserve moisture.",
        "active": True,
        "rating": 4.6,
        "reviews_count": 19,
    },
    {
        "name": "Premium Aged Basmati Rice",
        "category": "Rice, Dal & Grains",
        "unit": "5 kg Bag",
        "unit_cost": 360.0,
        "base_price": 490.0,
        "discount_percent": 10,
        "discount_price": 441.0,
        "shelf_life_days": 180,
        "average_daily_demand": 10,
        "price_sensitivity": 0.7,
        "stock": 25,
        "is_deal": False,
        "deal_reason": None,
        "image_url": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80",
        "description": "Extra long grain traditional Himalayan basmati rice aged for 24 months. Fluffy texture with delicate royal fragrance upon cooking.",
        "active": True,
        "rating": 4.9,
        "reviews_count": 104,
    }
]

result = db.products.insert_many(INITIAL_PRODUCTS)
print(f"[SUCCESS] Successfully seeded {len(result.inserted_ids)} initial products into MongoDB collection 'products'.")
