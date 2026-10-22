import asyncio
import os
from dotenv import load_dotenv
from pymongo import AsyncMongoClient

load_dotenv()

async def main():
    client = AsyncMongoClient(os.getenv("MONGODB_URI"))
    db = client[os.getenv("DATABASE_NAME", "freshsave_ai")]
    cursor = db.products.find({})
    prods = await cursor.to_list(100)
    for p in prods:
        print(f"ID: {p.get('_id')} | Name: '{p.get('name')}' | Category: '{p.get('category')}' | BasePrice: {p.get('base_price')} | DiscountPrice: {p.get('discount_price')} | BulkPrice: {p.get('bulk_price')} | BulkMinQty: {p.get('bulk_min_qty')}")
    await client.close()

if __name__ == "__main__":
    asyncio.run(main())
