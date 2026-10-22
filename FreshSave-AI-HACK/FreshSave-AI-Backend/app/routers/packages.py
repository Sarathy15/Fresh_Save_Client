from fastapi import APIRouter, HTTPException
from pymongo.errors import PyMongoError

from app.database import get_database

router = APIRouter(prefix="/api/packages", tags=["Grocery Packages"])


@router.get("")
async def list_packages():
    """
    List curated weekly and monthly grocery packages with bundled savings.
    Authoritatively queries MongoDB packages collection.
    Returns an empty list when no packages exist in the database.
    """
    db = get_database()
    try:
        if hasattr(db, "packages"):
            cursor = db.packages.find({})
            items = await cursor.to_list(length=50)
            for it in items:
                it["id"] = str(it.get("_id", it.get("id", "")))
                it.pop("_id", None)
            return {"packages": items}
        return {"packages": []}
    except PyMongoError as exc:
        raise HTTPException(
            status_code=500, detail="Could not retrieve packages from database."
        ) from exc

