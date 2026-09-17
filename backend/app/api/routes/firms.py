"""
NASA FIRMS (Fire Information for Resource Management System) REST Endpoints.
Provides near real-time surface thermal/active fire anomaly observations around MOIL concessions.
"""
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from backend.app.api.dependencies import get_db
from backend.app.services.firms_service import (
    FirmsResponse,
    get_firms_for_mine,
    clear_firms_cache,
)
from database.models import Mine

router = APIRouter(prefix="/firms", tags=["NASA FIRMS Space Telemetry"])


def _check_mine_exists(mine_id: str, db: Session) -> Mine:
    """Dynamically loads and validates mine from the database."""
    mine = db.query(Mine).filter(Mine.id == mine_id).first()
    if not mine:
        raise HTTPException(status_code=404, detail=f"Mine '{mine_id}' not found in database registry")
    return mine


@router.get("", response_model=FirmsResponse)
@router.get("/", response_model=FirmsResponse)
def get_firms_telemetry(
    mine_id: Optional[str] = Query(None, description="MOIL Concession Mine ID (defaults to Balaghat)"),
    radius_km: Optional[float] = Query(None, ge=1.0, le=100.0, description="Search radius in km (default: 20km)"),
    lookback_days: Optional[int] = Query(None, ge=1, le=10, description="Acquisition lookback days (default: 1)"),
    source: Optional[str] = Query(None, description="VIIRS or MODIS satellite source identifier"),
    force_refresh: bool = Query(False, description="Bypass in-memory cache if true"),
    db: Session = Depends(get_db),
):
    """
    Retrieves NASA FIRMS active surface thermal/fire anomaly telemetry for a concession.
    Dynamically resolves coordinates from the database and queries the official NASA Area API.
    """
    target_mine_id = mine_id or "MINE_BALAGHAT_01"
    _check_mine_exists(target_mine_id, db)

    return get_firms_for_mine(
        mine_id=target_mine_id,
        db=db,
        force_refresh=force_refresh,
        radius_km=radius_km,
        lookback_days=lookback_days,
        source=source
    )


@router.get("/all/summary", response_model=List[FirmsResponse])
def get_all_mines_firms_summary(
    radius_km: Optional[float] = Query(None, ge=1.0, le=100.0),
    lookback_days: Optional[int] = Query(None, ge=1, le=10),
    db: Session = Depends(get_db),
):
    """
    Retrieves FIRMS active surface thermal telemetry across all 8 MOIL concessions.
    """
    mines = db.query(Mine).all()
    results = []
    for m in mines:
        res = get_firms_for_mine(
            mine_id=m.id,
            db=db,
            force_refresh=False,
            radius_km=radius_km,
            lookback_days=lookback_days
        )
        results.append(res)
    return results


@router.get("/{mine_id}", response_model=FirmsResponse)
def get_firms_telemetry_by_id(
    mine_id: str,
    radius_km: Optional[float] = Query(None, ge=1.0, le=100.0, description="Search radius in km (default: 20km)"),
    lookback_days: Optional[int] = Query(None, ge=1, le=10, description="Acquisition lookback days (default: 1)"),
    source: Optional[str] = Query(None, description="VIIRS or MODIS satellite source identifier"),
    force_refresh: bool = Query(False, description="Bypass in-memory cache if true"),
    db: Session = Depends(get_db),
):
    """
    Retrieves NASA FIRMS active surface thermal/fire anomaly telemetry for a specific concession.
    """
    _check_mine_exists(mine_id, db)

    return get_firms_for_mine(
        mine_id=mine_id,
        db=db,
        force_refresh=force_refresh,
        radius_km=radius_km,
        lookback_days=lookback_days,
        source=source
    )


@router.post("/cache/clear")
def clear_cache():
    """Administrative utility to reset in-memory FIRMS telemetry cache."""
    clear_firms_cache()
    return {"status": "success", "message": "NASA FIRMS telemetry cache successfully cleared"}
