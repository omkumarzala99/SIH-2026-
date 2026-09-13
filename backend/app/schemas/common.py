"""
Shared Pydantic data contracts across backend, frontend, and ML services.
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Literal
from datetime import datetime


class MineDTO(BaseModel):
    id: str
    name: str
    concession_code: str
    state: str
    district: str
    latitude: float
    longitude: float
    area_sq_km: float
    mineral_type: str


class MineZoneDTO(BaseModel):
    id: str
    mine_id: str
    name: str
    operational_status: str
    bench_level: str
    daily_target_tons: int


class DashboardSummaryDTO(BaseModel):
    total_estimated_reserves_tonnes: float
    daily_planned_production_tonnes: float
    daily_predicted_production_tonnes: float
    daily_shortfall_tonnes: float
    shortfall_percentage: float
    current_risk_score: float # 0 - 100
    current_risk_tier: str # LOW, MEDIUM, HIGH, CRITICAL
    active_equipment_count: int
    fleet_health_score: float
    active_alerts_count: int
    mode: str # demo | live


class SimulationRequestDTO(BaseModel):
    equipment_downtime_hours: float = Field(default=2.0, ge=0.0, le=24.0)
    rainfall_mm: float = Field(default=10.0, ge=0.0)
    blasting_delay_hours: float = Field(default=0.5, ge=0.0, le=12.0)
    planned_production: float = Field(default=1000.0, ge=0.0)


class SimulationResultDTO(BaseModel):
    scenario_name: str
    baseline: Dict[str, Any]
    simulated: Dict[str, Any]
    variance: Dict[str, Any]
    recommendation: str
