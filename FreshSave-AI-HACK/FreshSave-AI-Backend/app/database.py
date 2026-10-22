import logging
from pymongo import AsyncMongoClient
from pymongo.errors import PyMongoError
from fastapi import HTTPException

from app.config import settings

logger = logging.getLogger(__name__)

client: AsyncMongoClient | None = None
database = None
db_mode = "uninitialized"


async def connect_to_mongo() -> None:
    """Create the MongoDB client and verify the connection at startup."""
    global client, database, db_mode
    try:
        candidate_client = AsyncMongoClient(
            settings.mongodb_uri,
            serverSelectionTimeoutMS=5000,
        )
        await candidate_client.admin.command("ping")
        client = candidate_client
        database = client[settings.database_name]
        db_mode = "connected"
        logger.info(
            "Successfully connected to MongoDB Atlas database '%s'.",
            settings.database_name,
        )
    except Exception as exc:
        logger.error(
            "MongoDB Atlas connection failed: %s. "
            "Please check your network and ensure your IP is whitelisted in Atlas Network Access.",
            exc,
        )
        client = None
        database = None
        db_mode = "disconnected"


async def close_mongo_connection() -> None:
    global client, database, db_mode
    if client is not None:
        await client.close()
    client = None
    database = None
    db_mode = "closed"


async def ping_database() -> dict:
    global client, database, db_mode
    if db_mode == "connected" and client is not None and database is not None:
        await client.admin.command("ping")
        return {
            "status": "healthy",
            "database": "connected",
            "database_name": settings.database_name,
        }
    raise RuntimeError(
        "Database is unavailable. Please ensure MongoDB Atlas is reachable and IP is whitelisted."
    )


def get_database():
    if database is None:
        raise HTTPException(
            status_code=503,
            detail=(
                "Database connection unavailable. MongoDB Atlas could not be reached. "
                "Please verify that your current IP address is whitelisted in MongoDB Atlas Network Access."
            ),
        )
    return database

