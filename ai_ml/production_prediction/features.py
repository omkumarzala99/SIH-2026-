"""
Feature calculation and extraction for production forecasting.
"""
from typing import Dict, Any


def extract_production_features(data: Dict[str, Any]) -> Dict[str, float]:
    planned = float(data.get("planned_production", 1000.0))
    downtime = float(data.get("equipment_downtime_hours", 2.0))
    rainfall = float(data.get("rainfall_mm", 0.0))
    blasting_delay = float(data.get("blasting_delay_hours", 0.0))
    excavators = int(data.get("active_excavator_count", 2))
    dumpers = int(data.get("active_dumper_count", 3))

    return {
        "planned_production": planned,
        "downtime_hours": downtime,
        "rainfall_mm": rainfall,
        "blasting_delay_hours": blasting_delay,
        "excavator_capacity_tonnes": excavators * 450.0,
        "dumper_capacity_tonnes": dumpers * 320.0,
        "operational_friction_index": round((downtime * 25.0) + (rainfall * 2.2) + (blasting_delay * 35.0), 2)
    }
