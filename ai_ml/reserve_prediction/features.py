"""
Feature definitions and extraction for reserve modeling.
"""
from typing import Dict, Any

# Non-target feature set for leakage-free ML model training and inference
FEATURE_NAMES = [
    "depth_meters",
    "fe_grade_pct",
    "sio2_pct",
    "phosphorus_pct"
]


def extract_features(data: Dict[str, Any]) -> Dict[str, float]:
    mn = float(data.get("mn_grade_pct", 35.0))
    fe = float(data.get("fe_grade_pct", 8.0))
    sio2 = float(data.get("sio2_pct", 15.0))
    depth = float(data.get("depth_meters", 50.0))
    p = float(data.get("phosphorus_pct", 0.15))
    ndvi = float(data.get("ndvi", 0.20))
    lst = float(data.get("land_surface_temp_c", 35.0))

    return {
        "depth_meters": depth,
        "mn_grade_pct": mn,
        "fe_grade_pct": fe,
        "sio2_pct": sio2,
        "phosphorus_pct": p,
        "mn_fe_ratio": round(mn / max(0.1, fe), 2),
        "depth_factor": round(depth / 100.0, 3),
        "ndvi": ndvi,
        "land_surface_temp_c": lst
    }
