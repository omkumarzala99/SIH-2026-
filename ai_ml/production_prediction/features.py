"""
Feature calculation and extraction for production forecasting.
Extracts operational, equipment, weather, and historical lag features without target leakage.
"""
import os
import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple, Optional

# Canonical feature list expected by the Production ML Model
FEATURE_NAMES = [
    "planned_production",
    "equipment_downtime_hours",
    "rainfall_mm",
    "blasting_delay_hours",
    "hauling_trips",
    "equipment_efficiency_pct",
    "active_equipment_count",
    "soil_moisture_pct",
    "flood_risk_score",
    "ambient_temp_c",
    "humidity_pct",
    "wind_speed_kmh",
    "actual_lag_1d",
    "rolling_3d_shortfall"
]

FLOOD_RISK_MAP = {
    "LOW": 0.0,
    "MODERATE": 1.0,
    "MEDIUM": 1.0,
    "HIGH": 2.0,
    "CRITICAL": 3.0
}


def extract_production_features(data: Dict[str, Any]) -> Dict[str, float]:
    """
    Extracts and standardizes the 14 operational and environmental features for model inference.
    Guarantees that target variables (actual_tonnage, shortfall_tonnage) are NEVER present.
    """
    # Defensive target leakage checks
    assert "actual_tonnage" not in data or data.get("actual_tonnage") is None or "actual_tonnage" in ["target", "label"], \
        "Target leakage warning: actual_tonnage should not be in inference input!"

    planned = float(data.get("planned_production", data.get("planned_tonnage", 1000.0)))
    downtime = float(data.get("equipment_downtime_hours", data.get("downtime_hours", 2.0)))
    rainfall = float(data.get("rainfall_mm", 0.0))
    blasting_delay = float(data.get("blasting_delay_hours", 0.0))
    raw_hauling = data.get("hauling_trips")
    if raw_hauling is None:
        hauling = max(60.0, round(135.0 - (rainfall * 0.6) - (downtime * 5.0), 1))
    else:
        hauling = float(raw_hauling)

    raw_eff = data.get("equipment_efficiency_pct", data.get("average_efficiency_pct"))
    if raw_eff is None:
        eff = max(50.0, round(96.0 - (downtime * 6.5), 1))
    else:
        eff = float(raw_eff)

    excavators = int(data.get("active_excavator_count", 2))
    dumpers = int(data.get("active_dumper_count", 3))
    raw_eq_count = data.get("active_equipment_count")
    if raw_eq_count is None:
        eq_count = float(excavators + dumpers)
    else:
        eq_count = float(raw_eq_count)

    raw_soil = data.get("soil_moisture_pct")
    if raw_soil is None:
        soil_moisture = min(70.0, round(22.0 + (rainfall * 0.65), 1))
    else:
        soil_moisture = float(raw_soil)

    raw_flood = data.get("flood_risk_score", data.get("flood_risk_index"))
    if raw_flood is None:
        flood_score = 2.0 if rainfall >= 50.0 else (1.0 if rainfall >= 20.0 else 0.0)
    elif isinstance(raw_flood, str):
        flood_score = FLOOD_RISK_MAP.get(raw_flood.upper(), 0.0)
    else:
        flood_score = float(raw_flood)

    temp_c = float(data.get("ambient_temp_c", 32.0) or 32.0)
    raw_humidity = data.get("humidity_pct")
    if raw_humidity is None:
        humidity = min(90.0, round(45.0 + (rainfall * 0.45), 1))
    else:
        humidity = float(raw_humidity)

    wind = float(data.get("wind_speed_kmh", 18.0) or 18.0)

    raw_lag = data.get("actual_lag_1d")
    if raw_lag is None:
        lag_1d = planned * 0.95
    else:
        lag_1d = float(raw_lag)

    raw_rolling = data.get("rolling_3d_shortfall")
    if raw_rolling is None:
        raw_rolling = max(0.0, (downtime * 18.0) + (rainfall * 1.5))
    rolling_shortfall = float(raw_rolling)

    features = {
        "planned_production": planned,
        "equipment_downtime_hours": downtime,
        "rainfall_mm": rainfall,
        "blasting_delay_hours": blasting_delay,
        "hauling_trips": hauling,
        "equipment_efficiency_pct": eff,
        "active_equipment_count": eq_count,
        "soil_moisture_pct": soil_moisture,
        "flood_risk_score": flood_score,
        "ambient_temp_c": temp_c,
        "humidity_pct": humidity,
        "wind_speed_kmh": wind,
        "actual_lag_1d": lag_1d,
        "rolling_3d_shortfall": rolling_shortfall,
        # Backward compatibility helper keys
        "downtime_hours": downtime,
        "excavator_capacity_tonnes": excavators * 450.0,
        "dumper_capacity_tonnes": dumpers * 320.0,
        "operational_friction_index": round((downtime * 25.0) + (rainfall * 2.2) + (blasting_delay * 35.0), 2)
    }

    assert "actual_tonnage" not in features, "Critical: actual_tonnage leaked into features!"
    assert "shortfall_tonnage" not in features, "Critical: shortfall_tonnage leaked into features!"

    return features


def build_production_training_dataset(
    data_dir: str = "data/mock"
) -> Tuple[pd.DataFrame, pd.Series]:
    """
    Builds a cleaned, leakage-free dataset for training the Production ML model.
    Joins daily production records with equipment status logs and weather observations.
    """
    def _find_path(filename: str) -> str:
        candidates = [
            os.path.join(data_dir, filename),
            os.path.join("data", "mock", filename),
            os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data", "mock", filename)
        ]
        for p in candidates:
            if os.path.exists(p):
                return p
        return candidates[0]

    prod_path = _find_path("production_data.csv")
    eq_path = _find_path("equipment_data.csv")
    weather_path = _find_path("weather_data.csv")

    if not os.path.exists(prod_path):
        raise FileNotFoundError(f"Production data not found at '{prod_path}'")

    prod_df = pd.read_csv(prod_path)
    if "mine_id" in prod_df.columns:
        prod_df = prod_df[prod_df["mine_id"] == "MINE_BALAGHAT_01"]

    # 1. Daily production totals
    daily_prod = prod_df.groupby("date").agg(
        mine_id=("mine_id", "first"),
        planned_tonnage=("planned_tonnage", "sum"),
        actual_tonnage=("actual_tonnage", "sum"),
        shortfall_tonnage=("shortfall_tonnage", "sum"),
        hauling_trips=("hauling_trips", "sum"),
        blasting_delay_hours=("blasting_delay_hours", "sum")
    ).reset_index()

    # 2. Weather observations
    if os.path.exists(weather_path):
        weath_df = pd.read_csv(weather_path)
        if "mine_id" in weath_df.columns:
            weath_df = weath_df[weath_df["mine_id"] == "MINE_BALAGHAT_01"]
        weath_df["flood_risk_score"] = weath_df["flood_risk_index"].map(FLOOD_RISK_MAP).fillna(0.0)
        df = pd.merge(daily_prod, weath_df, on=["date", "mine_id"], how="left")
    else:
        df = daily_prod.copy()
        df["rainfall_mm"] = 0.0
        df["soil_moisture_pct"] = 25.0
        df["flood_risk_score"] = 0.0
        df["ambient_temp_c"] = 32.0
        df["humidity_pct"] = 48.0
        df["wind_speed_kmh"] = 18.0

    # 3. Equipment status logs
    if os.path.exists(eq_path):
        eq_df = pd.read_csv(eq_path)
        balaghat_eq_ids = {
            "EXC_CAT_349_01", "EXC_KOM_PC450_02", "DMP_VOLVO_FMX_11", "DMP_VOLVO_FMX_12",
            "DMP_VOLVO_FMX_13", "DRL_ATLAS_ROC_01", "CRU_TELSMITH_01", "WTR_TRK_TATA_01"
        }
        if "equipment_id" in eq_df.columns:
            eq_df = eq_df[eq_df["equipment_id"].isin(balaghat_eq_ids)]
        eq_df["date"] = eq_df["timestamp"].str[:10]
        daily_eq = eq_df.groupby("date").agg(
            equipment_downtime_hours=("downtime_hours", "sum"),
            equipment_efficiency_pct=("efficiency_pct", "mean"),
            active_equipment_count=("equipment_id", "count")
        ).reset_index()

        mean_dt = daily_eq["equipment_downtime_hours"].mean()
        mean_eff = daily_eq["equipment_efficiency_pct"].mean()
        mean_cnt = daily_eq["active_equipment_count"].mean()

        df = pd.merge(df, daily_eq, on="date", how="left")
        df["equipment_downtime_hours"] = df["equipment_downtime_hours"].fillna(mean_dt).round(2)
        df["equipment_efficiency_pct"] = df["equipment_efficiency_pct"].fillna(mean_eff).round(2)
        df["active_equipment_count"] = df["active_equipment_count"].fillna(mean_cnt).round(1)
    else:
        df["equipment_downtime_hours"] = 2.0
        df["equipment_efficiency_pct"] = 88.0
        df["active_equipment_count"] = 5.0

    # Chronological sort
    df = df.sort_values(by="date").reset_index(drop=True)

    # Standardize planned production column name
    df["planned_production"] = df["planned_tonnage"]

    # Strictly leakage-free historical lag features:
    # 1-day lag of actual production (strictly shifted by 1, so today's actual is NEVER used)
    df["actual_lag_1d"] = df["actual_tonnage"].shift(1).fillna(df["planned_production"].iloc[0] * 0.95)
    # Rolling 3-day shortfall (strictly shifted by 1, so today's shortfall is NEVER used)
    df["rolling_3d_shortfall"] = df["shortfall_tonnage"].shift(1).rolling(3, min_periods=1).mean().fillna(0.0)

    # Target variable
    y = df["actual_tonnage"].copy()

    # Features matrix
    X = df[FEATURE_NAMES].copy()

    # Target leakage verification
    assert "actual_tonnage" not in X.columns, "Leakage Error: actual_tonnage found in feature matrix X!"
    assert "shortfall_tonnage" not in X.columns, "Leakage Error: shortfall_tonnage found in feature matrix X!"
    assert len(X.columns) == len(FEATURE_NAMES), f"Expected {len(FEATURE_NAMES)} features, got {len(X.columns)}"

    return X, y
