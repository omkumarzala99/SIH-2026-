"""
Main entry point for the PS-26009 MOIL Mining Intelligence Platform Backend.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.api.router import api_router
from database.connection import init_db
from database.seed_data import seed_database

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI/ML and Space Technology Decision Support System for Manganese Reserve Identification & Production Shortfall Mitigation for MOIL Limited.",
    openapi_url=f"{settings.API_PREFIX}/openapi.json",
    docs_url=f"{settings.API_PREFIX}/docs",
    redoc_url=f"{settings.API_PREFIX}/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    """Initializes database and seeds demo baseline data on launch."""
    print("Starting MOIL AI/ML Mining Intelligence API...")
    init_db()
    seed_database()
    print("MOIL Mining Intelligence Platform Backend is ready!")


# Mount consolidated router
app.include_router(api_router, prefix=settings.API_PREFIX)


@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": f"{settings.API_PREFIX}/docs",
        "health_url": f"{settings.API_PREFIX}/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
