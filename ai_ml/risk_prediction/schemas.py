"""
Pydantic schemas for the Multi-Factor Risk Assessment Engine.
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


class RiskFactor(BaseModel):
    name: str
    severity: str # LOW, MEDIUM, HIGH, CRITICAL
    weight: float
    description: str
    observed_value: Any


class RiskAssessmentRequest(BaseModel):
    mine_id: Optional[str] = "MINE_BALAGHAT_01"
    equipment_downtime_hours: float = Field(default=3.5, ge=0.0)
    rainfall_mm: float = Field(default=28.0, ge=0.0)
    blasting_delay_hours: float = Field(default=1.5, ge=0.0)
    shortfall_percentage: float = Field(default=16.0, ge=0.0)
    # Optional production and operational context
    planned_production: Optional[float] = None
    predicted_production: Optional[float] = None
    shortfall: Optional[float] = None
    equipment_efficiency_pct: Optional[float] = None
    soil_moisture_pct: Optional[float] = None
    flood_risk_score: Optional[float] = None
    active_equipment_count: Optional[float] = None


class RiskAssessmentResponse(BaseModel):
    mine_id: str
    overall_risk_score: float # 0 - 100
    risk_tier: str # LOW, MEDIUM, HIGH, CRITICAL
    equipment_risk: float
    weather_risk: float
    blasting_risk: float
    production_risk: float
    contributing_factors: List[RiskFactor]
    summary_explanation: str
    # Optional production context
    planned_production: Optional[float] = None
    predicted_production: Optional[float] = None
    shortfall: Optional[float] = None
    shortfall_percentage: Optional[float] = None

