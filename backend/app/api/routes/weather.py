"""
Real-Time Weather and Meteorological Telemetry Endpoints.
Integrates Weatherstack API with seamless local database fallback.
"""
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from backend.app.api.dependencies import get_db
from backend.app.services.weather_service import (
    WeatherResponse,
    get_weather_for_mine,
    clear_weather_cache,
)
from database.models import Mine

router = APIRouter(prefix="/weather", tags=["Meteorological Telemetry"])

# Known MOIL Concessions
KNOWN_MINE_IDS = {
    "MINE_BALAGHAT_01",
    "MINE_GUMGAON_02",
    "MINE_TIRODI_03",
    "MINE_DONGRI_04",
    "MINE_KANDRI_05",
    "MINE_MANSAR_06",
    "MINE_CHIKLA_07",
    "MINE_UKWA_08",
}


def _verify_mine_exists(mine_id: str, db: Session) -> bool:
    """Checks if mine exists in database or known MOIL registry."""
    if mine_id in KNOWN_MINE_IDS:
        return True
    m = db.query(Mine).filter(Mine.id == mine_id).first()
    return m is not None


@router.get("", response_model=WeatherResponse)
@router.get("/", response_model=WeatherResponse)
def get_current_weather(
    mine_id: Optional[str] = Query(None, description="MOIL Concession Mine ID (defaults to Balaghat)"),
    force_refresh: bool = Query(False, description="Bypass in-memory cache if true"),
    db: Session = Depends(get_db),
):
    """
    Retrieves current meteorological telemetry for a mine.
    Uses Weatherstack API when live key is available, falling back seamlessly
    to local SQLite database records on network failure or rate limit.
    """
    target_mine_id = mine_id or "MINE_BALAGHAT_01"
    if not _verify_mine_exists(target_mine_id, db):
        raise HTTPException(status_code=404, detail=f"Mine '{target_mine_id}' not found")

    return get_weather_for_mine(target_mine_id, db=db, force_refresh=force_refresh)


@router.get("/{mine_id}", response_model=WeatherResponse)
def get_current_weather_by_id(
    mine_id: str,
    force_refresh: bool = Query(False, description="Bypass in-memory cache if true"),
    db: Session = Depends(get_db),
):
    """
    Retrieves current meteorological telemetry for a specific mine by path parameter.
    """
    if not _verify_mine_exists(mine_id, db):
        raise HTTPException(status_code=404, detail=f"Mine '{mine_id}' not found")

    return get_weather_for_mine(mine_id, db=db, force_refresh=force_refresh)


@router.post("/cache/clear")
def clear_cache():
    """Administrative utility to reset in-memory weather cache."""
    clear_weather_cache()
    return {"status": "success", "message": "Weather cache successfully cleared"}
