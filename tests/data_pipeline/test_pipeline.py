"""
Unit tests for Data Pipeline: Ingestion, Cleaning, Transformations, and Quality.
"""
import pytest
import pandas as pd
from data_pipeline.ingestion.loaders import load_all_mock_data
from data_pipeline.cleaning.cleaners import clean_geological_data, clean_production_data
from data_pipeline.quality.quality_checker import get_all_data_quality_metrics


def test_mock_datasets_loaded():
    datasets = load_all_mock_data("data/mock")
    assert "geological" in datasets
    assert "production" in datasets
    assert "equipment" in datasets
    assert "weather" in datasets
    assert "satellite" in datasets
    assert len(datasets["geological"]) > 0
    assert len(datasets["production"]) > 0


def test_data_cleaning_pipeline():
    raw_geo = pd.DataFrame([{
        "borehole_id": "BH-TEST-1",
        "mine_id": "MINE_BALAGHAT_01",
        "zone_id": "ZONE_NORTH_A",
        "latitude": 21.8,
        "longitude": 80.1,
        "depth_meters": 50.0,
        "mn_grade_pct": 75.0, # out of bound, should be clipped to 60.0
        "fe_grade_pct": 5.0,
        "sio2_pct": 12.0,
        "phosphorus_pct": 0.1,
        "rock_formation": "Mansar",
        "subsurface_layer": "Ore",
        "timestamp": "2026-03-01T00:00:00Z"
    }])
    cleaned = clean_geological_data(raw_geo)
    assert cleaned.iloc[0]["mn_grade_pct"] == 60.0


def test_quality_metrics_authentic():
    report = get_all_data_quality_metrics("data/mock")
    assert report["fleet_health_score"] > 80.0
    for domain in ["geological", "production", "equipment", "weather", "satellite"]:
        assert domain in report["domains"]
        assert report["domains"][domain]["completeness_pct"] > 85.0
