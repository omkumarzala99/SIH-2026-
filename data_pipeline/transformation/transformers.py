"""
Data transformation routines: temporal resampling and multi-sensor alignment.
"""
import pandas as pd


def aggregate_daily_production(prod_df: pd.DataFrame) -> pd.DataFrame:
    """Aggregates shift-level records into daily totals per mine and zone."""
    if prod_df.empty:
        return pd.DataFrame()

    daily = prod_df.groupby(["date", "mine_id", "zone_id"]).agg({
        "planned_tonnage": "sum",
        "actual_tonnage": "sum",
        "shortfall_tonnage": "sum",
        "ore_grade_mined": "mean",
        "hauling_trips": "sum",
        "blasting_delay_hours": "sum"
    }).reset_index()

    daily["shortfall_pct"] = (
        (daily["shortfall_tonnage"] / daily["planned_tonnage"].replace(0, 1)) * 100
    ).round(2)
    return daily


def merge_operational_factors(daily_prod_df: pd.DataFrame, weather_df: pd.DataFrame, eq_df: pd.DataFrame) -> pd.DataFrame:
    """Merges production records with co-located weather and equipment downtime metrics."""
    merged = daily_prod_df.copy()

    if not weather_df.empty:
        merged = pd.merge(
            merged,
            weather_df[["date", "rainfall_mm", "soil_moisture_pct", "flood_risk_index"]],
            on="date",
            how="left"
        )
        merged["rainfall_mm"] = merged["rainfall_mm"].fillna(0.0)
        merged["soil_moisture_pct"] = merged["soil_moisture_pct"].fillna(20.0)

    if not eq_df.empty:
        # Aggregate equipment downtime by date and zone
        eq_daily = eq_df.copy()
        eq_daily["date"] = eq_daily["timestamp"].str.slice(0, 10)
        eq_agg = eq_daily.groupby(["date", "zone_id"]).agg({
            "downtime_hours": "sum",
            "efficiency_pct": "mean"
        }).reset_index().rename(columns={
            "downtime_hours": "total_equipment_downtime_hours",
            "efficiency_pct": "fleet_efficiency_pct"
        })
        merged = pd.merge(merged, eq_agg, on=["date", "zone_id"], how="left")
        merged["total_equipment_downtime_hours"] = merged["total_equipment_downtime_hours"].fillna(0.0)
        merged["fleet_efficiency_pct"] = merged["fleet_efficiency_pct"].fillna(90.0)

    return merged
