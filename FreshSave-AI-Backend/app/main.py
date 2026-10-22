from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.database import close_mongo_connection, connect_to_mongo, ping_database
from app.routers import products, deals, orders, packages, analytics


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    try:
        yield
    finally:
        await close_mongo_connection()


app = FastAPI(
    title="FreshSave AI API",
    description=(
        "Authoritative Customer & Retailer API for FreshSave AI grocery platform. "
        "Provides product catalog, verified smart deals, curated packages, order persistence, and live store analytics from MongoDB."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# Local development origins for Vite and React apps
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router)
app.include_router(deals.router)
app.include_router(orders.router)
app.include_router(packages.router)
app.include_router(analytics.router)


@app.get("/", tags=["General"])
async def root():
    return {
        "project": "FreshSave AI",
        "tagline": "Fresh Groceries. Smarter Savings.",
        "message": "Backend is running with live MongoDB data integration",
        "docs": "/docs",
        "endpoints": {
            "products": "/api/products",
            "categories": "/api/products/categories",
            "deals": "/api/deals",
            "packages": "/api/packages",
            "orders": "/api/orders",
            "analytics": "/api/analytics",
            "health": "/health",
        },
    }


@app.get("/health", tags=["General"])
async def health():
    try:
        status_info = await ping_database()
        return status_info
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail="Database connection unavailable. MongoDB Atlas is unreachable.",
        ) from exc

