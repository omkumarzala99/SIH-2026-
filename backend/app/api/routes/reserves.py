"""
Reserve Intelligence Endpoints.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.api.dependencies import get_db
from database.models import GeologicalObservation, MineZone
from ai_ml.reserve_prediction.schemas import ReservePredictionRequest, ReservePredictionResponse
from ai_ml.reserve_prediction.predict import predict_reserve_potential

router = APIRouter(prefix="/reserves", tags=["Reserves"])


@router.get("")
def list_reserve_zones():
    """Returns evaluated manganese reserve potential across all operational zones."""
    return [
        {
            "zone_id": "ZONE_NORTH_A",
            "name": "North Bench Pit A",
            "classification": "HIGH",
            "reserve_probability": 0.89,
            "estimated_tonnage": 485000,
            "estimated_mn_grade": 44.2,
            "confidence": 0.86,
            "formation": "Sausar Group Gondite",
            "ndvi_index": 0.15,
            "status": "Priority Extraction"
        },
        {
            "zone_id": "ZONE_CENTRAL_B",
            "name": "Central Main Pit B",
            "classification": "HIGH",
            "reserve_probability": 0.84,
            "estimated_tonnage": 620000,
            "estimated_mn_grade": 41.6,
            "confidence": 0.83,
            "formation": "Mansar Schist",
            "ndvi_index": 0.17,
            "status": "Active Deep Bench"
        },
        {
            "zone_id": "ZONE_SOUTH_C",
            "name": "South Expansion Zone C",
            "classification": "MEDIUM",
            "reserve_probability": 0.62,
            "estimated_tonnage": 295000,
            "estimated_mn_grade": 32.4,
            "confidence": 0.77,
            "formation": "Chorbaoli Quartzite",
            "ndvi_index": 0.24,
            "status": "Secondary Blend Horizon"
        },
        {
            "zone_id": "ZONE_EAST_D",
            "name": "East Exploration Block D",
            "classification": "LOW",
            "reserve_probability": 0.31,
            "estimated_tonnage": 85000,
            "estimated_mn_grade": 21.5,
            "confidence": 0.71,
            "formation": "Tirodi Biotite Gneiss",
            "ndvi_index": 0.39,
            "status": "Prospecting"
        },
        {
            "zone_id": "ZONE_WEST_E",
            "name": "West Overburden Dump E",
            "classification": "LOW",
            "reserve_probability": 0.18,
            "estimated_tonnage": 0,
            "estimated_mn_grade": 14.2,
            "confidence": 0.65,
            "formation": "Overburden Schist",
            "ndvi_index": 0.42,
            "status": "Sterilized Dump Area"
        }
    ]


@router.post("/predict", response_model=ReservePredictionResponse)
def predict_reserve(req: ReservePredictionRequest):
    """Executes AI/ML inference to classify manganese reserve potential for a target zone."""
    return predict_reserve_potential(req)


@router.get("/boreholes")
def get_borehole_observations(db: Session = Depends(get_db), limit: int = Query(default=25, le=100)):
    """Fetches exploratory borehole drilling records."""
    records = db.query(GeologicalObservation).limit(limit).all()
    return [
        {
            "borehole_id": r.borehole_id,
            "zone_id": r.zone_id,
            "depth_meters": r.depth_meters,
            "mn_grade_pct": r.mn_grade_pct,
            "fe_grade_pct": r.fe_grade_pct,
            "sio2_pct": r.sio2_pct,
            "rock_formation": r.rock_formation,
            "subsurface_layer": r.subsurface_layer
        }
        for r in records
    ]
