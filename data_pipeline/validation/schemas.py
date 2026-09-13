"""
Validation schemas for data pipeline ingestion contracts.
"""
from pydantic import BaseModel, Field
from typing import Optional


class GeologicalRecordSchema(BaseModel):
    borehole_id: str
    mine_id: str
    zone_id: str
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    depth_meters: float = Field(..., ge=0.0, le=1000.0)
    mn_grade_pct: float = Field(..., ge=0.0, le=100.0)
    fe_grade_pct: float = Field(..., ge=0.0, le=100.0)
    sio2_pct: float = Field(..., ge=0.0, le=100.0)
    phosphorus_pct: float = Field(..., ge=0.0, le=10.0)
    rock_formation: str
    subsurface_layer: str
    timestamp: str


class ProductionRecordSchema(BaseModel):
    date: str
    mine_id: str
    zone_id: str
    shift: str
    planned_tonnage: float = Field(..., ge=0.0)
    actual_tonnage: float = Field(..., ge=0.0)
    shortfall_tonnage: float = Field(..., ge=0.0)
    ore_grade_mined: float = Field(..., ge=0.0, le=100.0)
    hauling_trips: int = Field(..., ge=0)
    blasting_status: str
    blasting_delay_hours: float = Field(..., ge=0.0, le=24.0)
    timestamp: str


class EquipmentRecordSchema(BaseModel):
    equipment_id: str
    equipment_type: str
    mine_id: str
    zone_id: str
    operational_hours: float = Field(..., ge=0.0, le=24.0)
    downtime_hours: float = Field(..., ge=0.0, le=24.0)
    downtime_reason: str
    efficiency_pct: float = Field(..., ge=0.0, le=100.0)
    health_status: str
    timestamp: str


class WeatherRecordSchema(BaseModel):
    mine_id: str
    date: str
    rainfall_mm: float = Field(..., ge=0.0)
    soil_moisture_pct: float = Field(..., ge=0.0, le=100.0)
    ambient_temp_c: float = Field(..., ge=-20.0, le=60.0)
    humidity_pct: float = Field(..., ge=0.0, le=100.0)
    wind_speed_kmh: float = Field(..., ge=0.0)
    flood_risk_index: str
    timestamp: str


class SatelliteRecordSchema(BaseModel):
    satellite_source: str
    mine_id: str
    zone_id: str
    ndvi: float = Field(..., ge=-1.0, le=1.0)
    ndwi: float = Field(..., ge=-1.0, le=1.0)
    land_surface_temp_c: float = Field(..., ge=-20.0, le=70.0)
    soil_moisture_satellite_pct: float = Field(..., ge=0.0, le=100.0)
    cloud_coverage_pct: float = Field(..., ge=0.0, le=100.0)
    data_quality_flag: str
    timestamp: str
