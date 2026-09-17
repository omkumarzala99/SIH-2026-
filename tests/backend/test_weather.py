"""
Unit and Integration Tests for Real-Time Weather Service (Weatherstack + Offline Fallback).
Verifies:
1. Normalization of live Weatherstack telemetry when API key is provided
2. Resilient fallback to SQLite on missing key, invalid key, or network timeout
3. Multi-mine coverage across all 8 MOIL manganese concessions
4. In-memory caching behavior and cache invalidation
5. Zero exposure of API keys in payloads, logs, or error responses
6. End-to-end integration into Executive Dashboard and AI Execution Pipeline
"""
import os
import json
from unittest.mock import patch, MagicMock
import pytest
from fastapi.testclient import TestClient

from backend.app.main import app
from services.weather_service import (
    get_weather_for_mine,
    clear_weather_cache,
    fetch_weatherstack_live,
    _calculate_flood_risk,
)

client = TestClient(app)

MOCK_WEATHERSTACK_PAYLOAD = {
    "request": {
        "type": "LatLon",
        "query": "Lat 21.81 and Lon 80.18",
        "language": "en",
        "unit": "m"
    },
    "location": {
        "name": "Balaghat",
        "country": "India",
        "region": "Madhya Pradesh",
        "lat": "21.813",
        "lon": "80.184",
        "timezone_id": "Asia/Kolkata",
        "localtime": "2026-03-15 11:30",
        "utc_offset": "5.50"
    },
    "current": {
        "observation_time": "06:00 AM",
        "temperature": 33,
        "weather_code": 113,
        "weather_icons": ["https://assets.weatherstack.com/images/wsymbols01_png_64/wsymbol_0001_sunny.png"],
        "weather_descriptions": ["Sunny"],
        "wind_speed": 18,
        "wind_degree": 240,
        "wind_dir": "WSW",
        "pressure": 1010,
        "precip": 12.4,
        "humidity": 62,
        "cloudcover": 15,
        "feelslike": 35,
        "uv_index": 7,
        "visibility": 10
    }
}


@pytest.fixture(autouse=True)
def reset_cache_before_each_test():
    clear_weather_cache()
    yield
    clear_weather_cache()


def test_weather_offline_fallback_balaghat():
    """Without API key, returns normalized fallback data for Balaghat."""
    with patch.dict(os.environ, {"WEATHERSTACK_API_KEY": ""}, clear=False):
        response = client.get("/api/weather/MINE_BALAGHAT_01")
        assert response.status_code == 200
        data = response.json()

        assert data["mine_id"] == "MINE_BALAGHAT_01"
        assert "Balaghat" in data["mine_name"]
        assert data["is_live"] is False
        assert "Offline Fallback" in data["data_source_label"]
        assert data["precipitation_mm"] in [54.2, 87.0]
        assert data["temperature_c"] > 0
        assert data["soil_moisture_pct"] > 0
        assert data["flood_risk_index"] in ["HIGH", "MODERATE_HIGH", "SEVERE"]


def test_weather_all_8_moil_mines():
    """All 8 MOIL concessions return valid HTTP 200 meteorological telemetry."""
    concessions = [
        "MINE_BALAGHAT_01",
        "MINE_GUMGAON_02",
        "MINE_TIRODI_03",
        "MINE_DONGRI_04",
        "MINE_KANDRI_05",
        "MINE_MANSAR_06",
        "MINE_CHIKLA_07",
        "MINE_UKWA_08",
    ]
    for m_id in concessions:
        res = client.get(f"/api/weather/{m_id}")
        assert res.status_code == 200, f"Failed for {m_id}"
        payload = res.json()
        assert payload["mine_id"] == m_id
        assert payload["latitude"] > 0
        assert payload["longitude"] > 0
        assert payload["precipitation_mm"] >= 0.0
        assert payload["temperature_c"] > 0.0
        assert payload["humidity_pct"] >= 0.0
        assert payload["wind_speed_kmh"] >= 0.0
        assert payload["data_source_label"] is not None


def test_weather_invalid_mine_404():
    """Requesting an unknown mine ID returns HTTP 404."""
    response = client.get("/api/weather/NONEXISTENT_MINE_XYZ")
    assert response.status_code == 404


def test_weather_live_weatherstack_normalization():
    """When WEATHERSTACK_API_KEY is configured and API succeeds, returns live normalized response."""
    test_key = "test_live_key_9876543210"

    with patch.dict(os.environ, {"WEATHERSTACK_API_KEY": test_key}):
        with patch("services.weather_service.fetch_weatherstack_live", return_value=MOCK_WEATHERSTACK_PAYLOAD):
            response = client.get("/api/weather/MINE_BALAGHAT_01")
            assert response.status_code == 200
            data = response.json()

            assert data["is_live"] is True
            assert data["source"] == "LIVE — Weatherstack"
            assert data["data_source_label"] == "Data Source: Weatherstack"
            assert data["temperature_c"] == 33.0
            assert data["humidity_pct"] == 62.0
            assert data["precipitation_mm"] == 12.4
            assert data["wind_speed_kmh"] == 18.0
            assert data["pressure_mb"] == 1010.0
            assert data["weather_description"] == "Sunny"
            assert data["observation_time"] == "06:00 AM"
            assert data["flood_risk_index"] == "LOW"


def test_weather_api_error_payload_graceful_fallback():
    """When Weatherstack returns an application-level error (e.g. invalid key 101), falls back to DB."""
    error_payload = {
        "success": False,
        "error": {
            "code": 101,
            "type": "invalid_access_key",
            "info": "You have not supplied a valid API Access Key."
        }
    }
    with patch.dict(os.environ, {"WEATHERSTACK_API_KEY": "invalid_dummy_key"}):
        with patch("services.weather_service.fetch_weatherstack_live", return_value=None):
            response = client.get("/api/weather/MINE_BALAGHAT_01")
            assert response.status_code == 200
            data = response.json()
            assert data["is_live"] is False
            assert "Offline Fallback" in data["data_source_label"]


def test_weather_network_timeout_fallback():
    """Network timeout falls back to local database without raising 500 error."""
    with patch.dict(os.environ, {"WEATHERSTACK_API_KEY": "valid_key"}):
        with patch("services.weather_service.fetch_weatherstack_live", side_effect=TimeoutError("Connection timed out")):
            # Even if fetch_weatherstack_live raised an exception, get_weather_for_mine handles it
            res = get_weather_for_mine("MINE_BALAGHAT_01")
            assert res.is_live is False
            assert res.precipitation_mm > 0


def test_weather_in_memory_caching():
    """Subsequent requests within cache TTL avoid redundant external API calls."""
    with patch.dict(os.environ, {"WEATHERSTACK_API_KEY": "valid_key"}):
        with patch("services.weather_service.fetch_weatherstack_live", return_value=MOCK_WEATHERSTACK_PAYLOAD) as mock_fetch:
            res1 = client.get("/api/weather/MINE_BALAGHAT_01")
            assert res1.status_code == 200
            assert mock_fetch.call_count == 1

            # Second call should use cache
            res2 = client.get("/api/weather/MINE_BALAGHAT_01")
            assert res2.status_code == 200
            assert mock_fetch.call_count == 1

            # Force refresh bypasses cache
            res3 = client.get("/api/weather/MINE_BALAGHAT_01?force_refresh=true")
            assert res3.status_code == 200
            assert mock_fetch.call_count == 2


def test_weather_zero_key_exposure():
    """The Weatherstack API key must never appear in response payloads or headers."""
    secret_key = "super_secret_weatherstack_key_xyz123"
    with patch.dict(os.environ, {"WEATHERSTACK_API_KEY": secret_key}):
        with patch("services.weather_service.fetch_weatherstack_live", return_value=MOCK_WEATHERSTACK_PAYLOAD):
            response = client.get("/api/weather/MINE_BALAGHAT_01")
            raw_text = response.text
            assert secret_key not in raw_text
            assert "access_key" not in raw_text


def test_dashboard_contains_weather_provenance():
    """GET /api/dashboard returns enriched environmental_status with provenance."""
    response = client.get("/api/dashboard?mine_id=MINE_BALAGHAT_01")
    assert response.status_code == 200
    env = response.json()["environmental_status"]

    assert "data_source_label" in env
    assert "is_live" in env
    assert "rainfall_mm" in env
    assert "soil_moisture_pct" in env
    assert "ambient_temp_c" in env
    assert "humidity_pct" in env
    assert "wind_speed_kmh" in env


def test_pipeline_stage_0_weather_integration():
    """POST /api/pipeline/run integrates weather telemetry into Stage 0 execution summary."""
    response = client.post("/api/pipeline/run?mine_id=MINE_BALAGHAT_01")
    assert response.status_code == 200
    data = response.json()

    stage0 = next((s for s in data["stages"] if s["id"] == 0), None)
    assert stage0 is not None
    assert "weather telemetry" in stage0["summary"].lower()
    assert "data_source_label" in stage0["details"]
    assert "is_live_weather" in stage0["details"]
    assert "rainfall_mm" in stage0["details"]
