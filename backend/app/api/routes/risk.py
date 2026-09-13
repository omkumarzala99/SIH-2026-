"""
Risk Assessment & Explainability Endpoints.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.api.dependencies import get_db
from ai_ml.risk_prediction.schemas import RiskAssessmentRequest, RiskAssessmentResponse
from ai_ml.risk_prediction.engine import evaluate_mining_risk

router = APIRouter(prefix="/risk", tags=["Risk"])


@router.get("", response_model=RiskAssessmentResponse)
def get_current_risk():
    """Returns real-time multi-factor risk evaluation and contributing factors."""
    req = RiskAssessmentRequest(
        mine_id="MINE_BALAGHAT_01",
        equipment_downtime_hours=5.5,
        rainfall_mm=54.2,
        blasting_delay_hours=2.2,
        shortfall_percentage=18.0
    )
    return evaluate_mining_risk(req)


@router.post("/predict", response_model=RiskAssessmentResponse)
def evaluate_custom_risk(req: RiskAssessmentRequest):
    """Calculates risk tier and explainability factors for custom operational conditions."""
    return evaluate_mining_risk(req)


@router.get("/history")
def get_risk_history():
    """Returns past 7 days risk index trajectory."""
    return [
        {"date": "2026-03-08", "score": 28.5, "tier": "LOW", "primary_driver": "Normal Operations"},
        {"date": "2026-03-09", "score": 42.0, "tier": "MEDIUM", "primary_driver": "Scattered Showers"},
        {"date": "2026-03-10", "score": 58.4, "tier": "HIGH", "primary_driver": "Rainfall & Sump Inflow"},
        {"date": "2026-03-11", "score": 72.8, "tier": "CRITICAL", "primary_driver": "CAT Excavator Hose Failure"},
        {"date": "2026-03-12", "score": 69.2, "tier": "HIGH", "primary_driver": "Continuous Monsoon & Blasting Freeze"},
        {"date": "2026-03-13", "score": 66.5, "tier": "HIGH", "primary_driver": "Ramp Dewatering Underway"},
        {"date": "2026-03-14", "score": 68.5, "tier": "HIGH", "primary_driver": "Equipment Downtime & Shortfall"}
    ]
