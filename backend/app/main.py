"""
Main entry point for the PS-26009 MOIL Mining Intelligence Platform Backend.
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from backend.app.config import settings
from backend.app.api.router import api_router
from backend.app.api.dependencies import get_db
from backend.app.api.routes.health import health_check
from database.connection import init_db
from database.seed_data import seed_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initializes database and seeds demo baseline data on launch."""
    print("Starting MOIL AI/ML Mining Intelligence API...")
    init_db()
    seed_database()
    print("MOIL Mining Intelligence Platform Backend is ready!")
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI/ML and Space Technology Decision Support System for Manganese Reserve Identification & Production Shortfall Mitigation for MOIL Limited.",
    openapi_url=f"{settings.API_PREFIX}/openapi.json",
    docs_url=f"{settings.API_PREFIX}/docs",
    redoc_url=f"{settings.API_PREFIX}/redoc",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount consolidated router
app.include_router(api_router, prefix=settings.API_PREFIX)


@app.get("/health", tags=["Health"])
def root_health_check(db: Session = Depends(get_db)):
    """Direct root /health check endpoint for Render, Railway, AWS ALB, and Docker."""
    return health_check(db)


@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "docs_url": f"{settings.API_PREFIX}/docs",
        "health_url": f"{settings.API_PREFIX}/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=settings.PORT, reload=settings.DEBUG)
