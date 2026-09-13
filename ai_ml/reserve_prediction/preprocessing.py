"""
Preprocessing and normalization for reserve geological features.
"""
import pandas as pd
import numpy as np


def preprocess_geological_inputs(data: dict) -> np.ndarray:
    """Standardizes input features into a normalized vector for inference."""
    mn = float(data.get("mn_grade_pct", 35.0))
    fe = float(data.get("fe_grade_pct", 8.0))
    sio2 = float(data.get("sio2_pct", 15.0))
    depth = float(data.get("depth_meters", 50.0))
    ndvi = float(data.get("ndvi", 0.20))
    lst = float(data.get("land_surface_temp_c", 35.0))

    mn_fe_ratio = mn / max(0.1, fe)
    depth_factor = 1.0 / (1.0 + np.exp(-depth / 100.0))

    return np.array([mn, fe, sio2, mn_fe_ratio, depth_factor, ndvi, lst], dtype=np.float32)
