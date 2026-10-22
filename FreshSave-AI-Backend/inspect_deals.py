"""Quick script to inspect raw deals from MongoDB to understand bulk/bundle structure."""
import asyncio
import os
from dotenv import load_dotenv
from pymongo import AsyncMongoClient

load_dotenv()
MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME", "freshsave_ai")

async def main():
    client = AsyncMongoClient(MONGODB_URI)
    db = client[DATABASE_NAME]
    
    print("=== ALL DEALS (raw) ===")
    cursor = db.deals.find({})
    docs = await cursor.to_list(length=20)
    for d in docs:
        d["_id"] = str(d["_id"])
        if "product_id" in d:
            d["product_id"] = str(d["product_id"])
        print(d)
    
    print(f"\nTotal deals: {len(docs)}")
    print("\n=== COLLECTIONS in DB ===")
    collections = await db.list_collection_names()
    print(collections)
    
    await client.close()

asyncio.run(main())
