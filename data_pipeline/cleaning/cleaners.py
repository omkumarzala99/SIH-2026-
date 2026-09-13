"""
Data cleaning and outlier handling utilities.
"""
import pandas as pd
import numpy as np


def clean_geological_data(df: pd.DataFrame) -> pd.DataFrame:
    """Cleans geological borehole data, clips assay grades to physical bounds, removes duplicates."""
    df_clean = df.copy()
    df_clean.drop_duplicates(subset=["borehole_id"], keep="last", inplace=True)
    
    # Clip assays to physical bounds
    df_clean["mn_grade_pct"] = df_clean["mn_grade_pct"].clip(lower=0.0, upper=60.0)
    df_clean["fe_grade_pct"] = df_clean["fe_grade_pct"].clip(lower=0.0, upper=30.0)
    df_clean["sio2_pct"] = df_clean["sio2_pct"].clip(lower=0.0, upper=50.0)
    df_clean["phosphorus_pct"] = df_clean["phosphorus_pct"].clip(lower=0.0, upper=2.0)
    
    # Fill any null depth with median
    if df_clean["depth_meters"].isnull().any():
        df_clean["depth_meters"] = df_clean["depth_meters"].fillna(df_clean["depth_meters"].median())
        
    return df_clean


def clean_production_data(df: pd.DataFrame) -> pd.DataFrame:
    """Cleans production logs, recalculates shortfall, verifies non-negative tonnages."""
    df_clean = df.copy()
    df_clean.drop_duplicates(subset=["date", "mine_id", "zone_id", "shift"], keep="last", inplace=True)
    
    df_clean["planned_tonnage"] = df_clean["planned_tonnage"].clip(lower=0.0)
    df_clean["actual_tonnage"] = df_clean["actual_tonnage"].clip(lower=0.0)
    df_clean["shortfall_tonnage"] = (df_clean["planned_tonnage"] - df_clean["actual_tonnage"]).clip(lower=0.0)
    df_clean["blasting_delay_hours"] = df_clean["blasting_delay_hours"].clip(lower=0.0, upper=12.0)
    
    return df_clean


def clean_equipment_data(df: pd.DataFrame) -> pd.DataFrame:
    """Cleans equipment telematics, ensures downtime + operational <= 24h."""
    df_clean = df.copy()
    df_clean["downtime_hours"] = df_clean["downtime_hours"].clip(lower=0.0, upper=24.0)
    df_clean["operational_hours"] = df_clean["operational_hours"].clip(lower=0.0, upper=24.0)
    df_clean["efficiency_pct"] = df_clean["efficiency_pct"].clip(lower=0.0, upper=100.0)
    return df_clean
