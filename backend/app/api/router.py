"""
Master API Router: Consolidates all feature routes for the MOIL Mining Platform.
"""
from fastapi import APIRouter
from backend.app.api.routes import (
    health, dashboard, reserves, production, risk, recommendations, gis, simulation, data_quality, demo, models_meta
)

api_router = APIRouter()

api_router.include_router(health.router)
api_router.include_router(dashboard.router)
api_router.include_router(reserves.router)
api_router.include_router(production.router)
api_router.include_router(risk.router)
api_router.include_router(recommendations.router)
api_router.include_router(gis.router)
api_router.include_router(simulation.router)
api_router.include_router(data_quality.router)
api_router.include_router(demo.router)
api_router.include_router(models_meta.router)
