"""
SQLAlchemy database models for PS-26009 MOIL Mining Intelligence Platform.
Supports PostgreSQL for production/docker and SQLite for zero-config local demos.
"""
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text, JSON
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class Mine(Base):
    __tablename__ = "mines"

    id = Column(String(50), primary_key=True)
    name = Column(String(100), nullable=False)
    concession_code = Column(String(50), nullable=False)
    state = Column(String(50), default="Madhya Pradesh")
    district = Column(String(50), default="Balaghat")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    area_sq_km = Column(Float, default=14.85)
    mineral_type = Column(String(50), default="Manganese Ore")
    created_at = Column(DateTime, default=datetime.utcnow)

    zones = relationship("MineZone", back_populates="mine", cascade="all, delete-orphan")


class MineZone(Base):
    __tablename__ = "mine_zones"

    id = Column(String(50), primary_key=True)
    mine_id = Column(String(50), ForeignKey("mines.id"), nullable=False)
    name = Column(String(100), nullable=False)
    operational_status = Column(String(50), default="ACTIVE_EXTRACTION")
    bench_level = Column(String(50), default="-120m RL")
    daily_target_tons = Column(Integer, default=450)
    polygon_coordinates = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    mine = relationship("Mine", back_populates="zones")
    geological_records = relationship("GeologicalObservation", back_populates="zone")
    reserve_predictions = relationship("ReservePrediction", back_populates="zone")


class GeologicalObservation(Base):
    __tablename__ = "geological_observations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    borehole_id = Column(String(50), index=True, nullable=False)
    mine_id = Column(String(50), ForeignKey("mines.id"), nullable=False)
    zone_id = Column(String(50), ForeignKey("mine_zones.id"), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    depth_meters = Column(Float, nullable=False)
    mn_grade_pct = Column(Float, nullable=False)
    fe_grade_pct = Column(Float, nullable=False)
    sio2_pct = Column(Float, nullable=False)
    phosphorus_pct = Column(Float, default=0.15)
    rock_formation = Column(String(100), nullable=False)
    subsurface_layer = Column(String(100), nullable=False)
    observed_at = Column(DateTime, default=datetime.utcnow)

    zone = relationship("MineZone", back_populates="geological_records")


class SatelliteObservation(Base):
    __tablename__ = "satellite_observations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    satellite_source = Column(String(50), default="Sentinel-2 MSI")
    mine_id = Column(String(50), ForeignKey("mines.id"), nullable=False)
    zone_id = Column(String(50), ForeignKey("mine_zones.id"), nullable=False)
    ndvi = Column(Float, nullable=False)
    ndwi = Column(Float, nullable=False)
    land_surface_temp_c = Column(Float, nullable=False)
    soil_moisture_satellite_pct = Column(Float, nullable=False)
    cloud_coverage_pct = Column(Float, default=5.0)
    data_quality_flag = Column(String(20), default="CLEAR")
    observed_at = Column(DateTime, default=datetime.utcnow)


class WeatherObservation(Base):
    __tablename__ = "weather_observations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    mine_id = Column(String(50), ForeignKey("mines.id"), nullable=False)
    rainfall_mm = Column(Float, nullable=False)
    soil_moisture_pct = Column(Float, nullable=False)
    ambient_temp_c = Column(Float, nullable=False)
    humidity_pct = Column(Float, nullable=False)
    wind_speed_kmh = Column(Float, default=15.0)
    flood_risk_index = Column(String(20), default="LOW")
    observed_at = Column(DateTime, default=datetime.utcnow)


class Equipment(Base):
    __tablename__ = "equipment"

    id = Column(String(50), primary_key=True)
    mine_id = Column(String(50), ForeignKey("mines.id"), nullable=False)
    equipment_type = Column(String(100), nullable=False)
    model = Column(String(100), nullable=False)
    commissioned_year = Column(Integer, default=2022)
    assigned_zone = Column(String(50), default="ZONE_CENTRAL_B")
    is_active = Column(Boolean, default=True)

    status_logs = relationship("EquipmentStatus", back_populates="equipment")


class EquipmentStatus(Base):
    __tablename__ = "equipment_status"

    id = Column(Integer, primary_key=True, autoincrement=True)
    equipment_id = Column(String(50), ForeignKey("equipment.id"), nullable=False)
    operational_hours = Column(Float, nullable=False)
    downtime_hours = Column(Float, nullable=False)
    downtime_reason = Column(String(200), default="None")
    efficiency_pct = Column(Float, default=90.0)
    health_status = Column(String(50), default="OPTIMAL")
    recorded_at = Column(DateTime, default=datetime.utcnow)

    equipment = relationship("Equipment", back_populates="status_logs")


class ProductionRecord(Base):
    __tablename__ = "production_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    mine_id = Column(String(50), ForeignKey("mines.id"), nullable=False)
    zone_id = Column(String(50), ForeignKey("mine_zones.id"), nullable=False)
    date = Column(String(20), nullable=False)
    shift = Column(String(20), nullable=False)
    planned_tonnage = Column(Float, nullable=False)
    actual_tonnage = Column(Float, nullable=False)
    shortfall_tonnage = Column(Float, default=0.0)
    ore_grade_mined = Column(Float, default=40.0)
    hauling_trips = Column(Integer, default=45)
    blasting_status = Column(String(50), default="Completed")
    blasting_delay_hours = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)


class ReservePrediction(Base):
    __tablename__ = "reserve_predictions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    zone_id = Column(String(50), ForeignKey("mine_zones.id"), nullable=False)
    classification = Column(String(20), nullable=False) # HIGH, MEDIUM, LOW
    reserve_probability = Column(Float, nullable=False)
    estimated_tonnage = Column(Float, nullable=False)
    estimated_mn_grade = Column(Float, nullable=False)
    confidence = Column(Float, nullable=False)
    model_version = Column(String(50), default="Reserve_ML_v1.0")
    features_used = Column(JSON, nullable=True)
    predicted_at = Column(DateTime, default=datetime.utcnow)

    zone = relationship("MineZone", back_populates="reserve_predictions")


class ProductionPrediction(Base):
    __tablename__ = "production_predictions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    mine_id = Column(String(50), ForeignKey("mines.id"), nullable=False)
    target_date = Column(String(20), nullable=False)
    planned_production = Column(Float, nullable=False)
    predicted_production = Column(Float, nullable=False)
    shortfall = Column(Float, nullable=False)
    shortfall_percentage = Column(Float, nullable=False)
    risk_level = Column(String(20), nullable=False) # LOW, MEDIUM, HIGH, CRITICAL
    confidence = Column(Float, nullable=False)
    model_version = Column(String(50), default="Production_Forecaster_v1.0")
    contributing_factors = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    mine_id = Column(String(50), ForeignKey("mines.id"), nullable=False)
    overall_risk_score = Column(Float, nullable=False) # 0 - 100
    risk_tier = Column(String(20), nullable=False) # LOW, MEDIUM, HIGH, CRITICAL
    equipment_risk = Column(Float, nullable=False)
    weather_risk = Column(Float, nullable=False)
    blasting_risk = Column(Float, nullable=False)
    production_risk = Column(Float, nullable=False)
    explainability_factors = Column(JSON, nullable=False)
    assessed_at = Column(DateTime, default=datetime.utcnow)


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(String(50), primary_key=True)
    mine_id = Column(String(50), ForeignKey("mines.id"), nullable=False)
    title = Column(String(200), nullable=False)
    category = Column(String(50), nullable=False) # EQUIPMENT, BLASTING, SCHEDULE, PIT_SELECTION
    problem_summary = Column(Text, nullable=False)
    recommended_action = Column(Text, nullable=False)
    expected_impact = Column(String(200), nullable=False)
    expected_tonnage_recovery = Column(Float, default=120.0)
    urgency = Column(String(20), default="HIGH") # LOW, MEDIUM, HIGH, CRITICAL
    status = Column(String(20), default="PENDING") # PENDING, APPROVED, REJECTED, MODIFIED
    manager_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    reviewed_at = Column(DateTime, nullable=True)


class ModelVersion(Base):
    __tablename__ = "model_versions"

    id = Column(String(50), primary_key=True)
    model_name = Column(String(100), nullable=False)
    version = Column(String(20), nullable=False)
    algorithm = Column(String(100), nullable=False)
    training_date = Column(DateTime, default=datetime.utcnow)
    accuracy_metric = Column(String(50), default="ROC_AUC / R2")
    metric_value = Column(Float, nullable=False)
    is_active = Column(Boolean, default=True)


class PredictionHistory(Base):
    __tablename__ = "prediction_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    prediction_type = Column(String(50), nullable=False) # RESERVE, PRODUCTION, RISK
    target_entity = Column(String(100), nullable=False)
    predicted_value = Column(Float, nullable=False)
    actual_value = Column(Float, nullable=True)
    error_delta = Column(Float, nullable=True)
    confidence = Column(Float, default=0.85)
    model_version = Column(String(50), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)


class SimulationRun(Base):
    __tablename__ = "simulation_runs"

    id = Column(String(50), primary_key=True)
    name = Column(String(100), default="What-If Scenario")
    input_params = Column(JSON, nullable=False)
    baseline_results = Column(JSON, nullable=False)
    simulated_results = Column(JSON, nullable=False)
    variance = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
