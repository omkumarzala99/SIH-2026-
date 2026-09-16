"""
Preprocessing and normalization for reserve geological features.
"""
import pandas as pd
import numpy as np


def preprocess_geological_inputs(data: dict) -> np.ndarray:
    """Standardizes input non-target features into a normalized vector for model inference."""
    depth = float(data.get("depth_meters", 50.0))
    fe = float(data.get("fe_grade_pct", 8.0))
    sio2 = float(data.get("sio2_pct", 15.0))
    p = float(data.get("phosphorus_pct", 0.15))

    return np.array([depth, fe, sio2, p], dtype=np.float32)
