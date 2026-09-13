"""
Pydantic schemas for the Production Forecasting & Shortfall Prediction Module.
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


class ProductionPredictionRequest(BaseModel):
    mine_id: Optional[str] = "MINE_BALAGHAT_01"
    target_date: Optional[str] = "2026-03-15"
    planned_production: float = Field(default=1000.0, ge=0.0)
    equipment_downtime_hours: float = Field(default=2.0, ge=0.0, le=24.0)
    rainfall_mm: float = Field(default=5.0, ge=0.0)
    blasting_delay_hours: float = Field(default=0.5, ge=0.0, le=12.0)
    active_excavator_count: int = Field(default=2, ge=0)
    active_dumper_count: int = Field(default=3, ge=0)


class ProductionPredictionResponse(BaseModel):
    mine_id: str
    target_date: str
    planned_production: float
    predicted_production: float
    shortfall: float
    shortfall_percentage: float
    risk_level: str # LOW, MEDIUM, HIGH, CRITICAL
    confidence: float
    model_version: str = "Production_Forecaster_v1.0"
    contributing_factors: Dict[str, Any]
