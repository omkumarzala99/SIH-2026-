"""
Pydantic schemas for the Reserve Intelligence ML Module.
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


class ReservePredictionRequest(BaseModel):
    zone_id: str
    mine_id: Optional[str] = "MINE_BALAGHAT_01"
    depth_meters: Optional[float] = 60.0
    mn_grade_pct: Optional[float] = 40.0
    fe_grade_pct: Optional[float] = 6.5
    sio2_pct: Optional[float] = 12.0
    phosphorus_pct: Optional[float] = 0.15
    rock_formation: Optional[str] = "Mansar Schist"
    ndvi: Optional[float] = 0.18
    land_surface_temp_c: Optional[float] = 34.5


class ReservePredictionResponse(BaseModel):
    zone_id: str
    reserve_probability: float = Field(..., ge=0.0, le=1.0)
    classification: str # HIGH, MEDIUM, LOW
    estimated_tonnage: float
    estimated_mn_grade: float
    confidence: float = Field(..., ge=0.0, le=1.0)
    model_version: str = "Reserve_ML_v1.0"
    contributing_indicators: Dict[str, Any]
