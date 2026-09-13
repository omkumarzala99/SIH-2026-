"""
Production Prediction & Forecasting Endpoints.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.app.api.dependencies import get_db
from database.models import ProductionRecord, Equipment
from ai_ml.production_prediction.schemas import ProductionPredictionRequest, ProductionPredictionResponse
from ai_ml.production_prediction.predict import predict_production_and_shortfall

router = APIRouter(prefix="/production", tags=["Production"])


@router.get("")
def get_production_trends(db: Session = Depends(get_db)):
    """Fetches past 14 days daily production trends (Planned vs Actual vs Shortfall)."""
    # Sample 14-day aggregated trend
    trend = [
        {"date": "2026-03-01", "planned": 1050, "actual": 1020, "shortfall": 30, "blasting_delay_h": 0.0, "rainfall_mm": 0.0},
        {"date": "2026-03-02", "planned": 1050, "actual": 1040, "shortfall": 10, "blasting_delay_h": 0.5, "rainfall_mm": 2.0},
        {"date": "2026-03-03", "planned": 1000, "actual": 980, "shortfall": 20, "blasting_delay_h": 0.0, "rainfall_mm": 0.0},
        {"date": "2026-03-04", "planned": 1100, "actual": 1060, "shortfall": 40, "blasting_delay_h": 0.0, "rainfall_mm": 5.0},
        {"date": "2026-03-05", "planned": 1050, "actual": 1030, "shortfall": 20, "blasting_delay_h": 0.0, "rainfall_mm": 0.0},
        {"date": "2026-03-06", "planned": 1000, "actual": 990, "shortfall": 10, "blasting_delay_h": 0.5, "rainfall_mm": 0.0},
        {"date": "2026-03-07", "planned": 1050, "actual": 1010, "shortfall": 40, "blasting_delay_h": 0.0, "rainfall_mm": 8.0},
        {"date": "2026-03-08", "planned": 1000, "actual": 950, "shortfall": 50, "blasting_delay_h": 1.0, "rainfall_mm": 12.0},
        {"date": "2026-03-09", "planned": 1050, "actual": 920, "shortfall": 130, "blasting_delay_h": 1.5, "rainfall_mm": 24.0},
        {"date": "2026-03-10", "planned": 1000, "actual": 880, "shortfall": 120, "blasting_delay_h": 2.0, "rainfall_mm": 38.0},
        {"date": "2026-03-11", "planned": 1050, "actual": 840, "shortfall": 210, "blasting_delay_h": 2.5, "rainfall_mm": 52.0},
        {"date": "2026-03-12", "planned": 1000, "actual": 810, "shortfall": 190, "blasting_delay_h": 2.0, "rainfall_mm": 64.0},
        {"date": "2026-03-13", "planned": 1000, "actual": 820, "shortfall": 180, "blasting_delay_h": 1.8, "rainfall_mm": 54.2},
        {"date": "2026-03-14 (Today)", "planned": 1000, "actual": 790, "shortfall": 210, "blasting_delay_h": 2.2, "rainfall_mm": 48.0}
    ]

    return {
        "current_target": 1000.0,
        "current_predicted": 820.0,
        "current_shortfall": 180.0,
        "shortfall_percentage": 18.0,
        "history": trend
    }


@router.post("/predict", response_model=ProductionPredictionResponse)
def predict_production(req: ProductionPredictionRequest):
    """Executes AI regression forecasting for planned production vs constraints."""
    return predict_production_and_shortfall(req)


@router.get("/equipment")
def get_equipment_status():
    """Fetches operational status and telematics for heavy earthmoving machinery."""
    return [
        {"id": "EXC_CAT_349_01", "name": "CAT 349D2 L", "type": "Hydraulic Excavator", "zone": "Central Pit B", "status": "CRITICAL_MAINTENANCE", "downtime_h": 6.5, "efficiency": 52.0},
        {"id": "EXC_KOM_PC450_02", "name": "Komatsu PC450-8", "type": "Hydraulic Excavator", "zone": "North Pit A", "status": "OPTIMAL", "downtime_h": 0.5, "efficiency": 94.0},
        {"id": "DMP_VOLVO_FMX_11", "name": "Volvo FMX 460", "type": "Haul Dumper 35T", "zone": "Central Pit B", "status": "WARNING", "downtime_h": 3.0, "efficiency": 72.0},
        {"id": "DMP_VOLVO_FMX_12", "name": "Volvo FMX 460", "type": "Haul Dumper 35T", "zone": "North Pit A", "status": "OPTIMAL", "downtime_h": 0.0, "efficiency": 96.0},
        {"id": "DMP_VOLVO_FMX_13", "name": "Volvo FMX 440", "type": "Haul Dumper 35T", "zone": "South Pit C", "status": "OPTIMAL", "downtime_h": 1.0, "efficiency": 89.0},
        {"id": "DRL_ATLAS_ROC_01", "name": "Atlas Copco ROC L8", "type": "Blast Drill Rig", "zone": "North Pit A", "status": "WARNING", "downtime_h": 2.2, "efficiency": 78.0},
        {"id": "CRU_TELSMITH_01", "name": "Telsmith 3648", "type": "Primary Jaw Crusher", "zone": "Crusher Pad", "status": "OPTIMAL", "downtime_h": 0.0, "efficiency": 98.0}
    ]
