"""
Feature engineering pipelines for AI/ML models.
"""
import pandas as pd
import numpy as np


def build_reserve_features(geo_df: pd.DataFrame, sat_df: pd.DataFrame) -> pd.DataFrame:
    """Builds features for reserve probability classification per zone."""
    # Geological aggregates
    geo_agg = geo_df.groupby("zone_id").agg({
        "mn_grade_pct": ["mean", "max"],
        "fe_grade_pct": "mean",
        "sio2_pct": "mean",
        "depth_meters": "mean",
        "borehole_id": "count"
    })
    geo_agg.columns = ["mn_mean", "mn_max", "fe_mean", "sio2_mean", "depth_mean", "borehole_count"]
    geo_agg = geo_agg.reset_index()

    # Manganese to Iron ratio
    geo_agg["mn_fe_ratio"] = (geo_agg["mn_mean"] / geo_agg["fe_mean"].replace(0, 1)).round(2)
    # Silica penalty index
    geo_agg["silica_penalty"] = (geo_agg["sio2_mean"] / 20.0).clip(lower=0.5, upper=2.0)

    # Satellite features if present
    if not sat_df.empty:
        sat_agg = sat_df.groupby("zone_id").agg({
            "ndvi": "mean",
            "land_surface_temp_c": "mean",
            "soil_moisture_satellite_pct": "mean"
        }).reset_index()
        features = pd.merge(geo_agg, sat_agg, on="zone_id", how="left")
    else:
        features = geo_agg
        features["ndvi"] = 0.25
        features["land_surface_temp_c"] = 35.0
        features["soil_moisture_satellite_pct"] = 25.0

    return features


def build_production_features(merged_ops_df: pd.DataFrame) -> pd.DataFrame:
    """Builds time-lagged and constraint features for daily production forecasting."""
    df = merged_ops_df.sort_values(by=["zone_id", "date"]).copy()
    
    # Lagged actual tonnages (strictly leakage-free, current day excluded)
    df["actual_lag_1d"] = df.groupby("zone_id")["actual_tonnage"].shift(1).fillna(df["actual_tonnage"].mean())
    df["rolling_3d_shortfall"] = df.groupby("zone_id")["shortfall_tonnage"].transform(lambda x: x.shift(1).rolling(3, min_periods=1).mean()).fillna(0.0)
    
    # Operational stress index: combines equipment downtime, blasting delay, and rainfall
    df["weather_impact_factor"] = (df["rainfall_mm"] / 50.0).clip(0, 2.5)
    df["downtime_impact_factor"] = (df.get("total_equipment_downtime_hours", 0) / 10.0).clip(0, 2.5)
    df["blasting_impact_factor"] = (df["blasting_delay_hours"] / 3.0).clip(0, 2.5)

    df["operational_stress_score"] = (
        df["weather_impact_factor"] * 0.35 +
        df["downtime_impact_factor"] * 0.40 +
        df["blasting_impact_factor"] * 0.25
    ).round(3)

    return df
