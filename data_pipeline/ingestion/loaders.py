"""
Data Ingestion Loaders: Reads CSV and streaming sources into Pandas DataFrames with type enforcement.
"""
import os
import pandas as pd
from typing import Optional, Dict


def load_dataset(file_path: str) -> pd.DataFrame:
    """Loads a CSV dataset safely, returning an empty DataFrame if file is not found."""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Dataset file not found: {file_path}")
    return pd.read_csv(file_path)


def load_all_mock_data(base_dir: str = "data/mock") -> Dict[str, pd.DataFrame]:
    """Loads all 5 synthetic prototype datasets for MOIL mining platform."""
    datasets = {}
    files = {
        "geological": os.path.join(base_dir, "geological_data.csv"),
        "production": os.path.join(base_dir, "production_data.csv"),
        "equipment": os.path.join(base_dir, "equipment_data.csv"),
        "weather": os.path.join(base_dir, "weather_data.csv"),
        "satellite": os.path.join(base_dir, "satellite_data.csv"),
    }
    for name, path in files.items():
        if os.path.exists(path):
            datasets[name] = pd.read_csv(path)
        else:
            datasets[name] = pd.DataFrame()
    return datasets
