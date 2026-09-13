"""
Schemas for the Risk Engine.
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Any


class RiskFactorSchema(BaseModel):
    name: str
    severity: str # LOW, MEDIUM, HIGH, CRITICAL
    weight: float
    description: str
    observed_value: Any


class RiskEvaluationRequest(BaseModel):
    mine_id: Optional[str] = "MINE_BALAGHAT_01"
    equipment_downtime_hours: float = Field(default=3.5, ge=0.0)
    rainfall_mm: float = Field(default=28.0, ge=0.0)
    blasting_delay_hours: float = Field(default=1.5, ge=0.0)
    shortfall_percentage: float = Field(default=16.0, ge=0.0)


class RiskEvaluationResponse(BaseModel):
    mine_id: str
    overall_risk_score: float
    risk_tier: str # LOW, MEDIUM, HIGH, CRITICAL
    equipment_risk: float
    weather_risk: float
    blasting_risk: float
    production_risk: float
    contributing_factors: List[RiskFactorSchema]
    summary_explanation: str
    model_version: str = "Risk_Engine_v1.0"
