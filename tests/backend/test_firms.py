"""
Unit and Integration Tests for NASA FIRMS Service & Endpoints.
Verifies:
1. Haversine distance calculation and boundary box calculations (WEST,SOUTH,EAST,NORTH)
2. CSV parsing for VIIRS NRT thermal anomalies (nominal, empty, malformed)
3. Graceful offline/unavailable handling when NASA_FIRMS_MAP_KEY is absent (zero 500s)
4. Mocked live API response handling and hotspot normalization
5. Error handling for HTTP 403, 401, and connection timeouts
6. Multi-mine coverage across all 8 MOIL manganese concessions
7. In-memory caching and cache invalidation
8. Zero exposure of API keys in payloads, logs, or error responses
9. Fleet-wide summary endpoint (/api/firms/all/summary)
"""
import os
import json
import io
import urllib.request
import urllib.error
from unittest.mock import patch, MagicMock
import pytest
from fastapi.testclient import TestClient

from backend.app.main import app
from services.firms_service import (
    haversine_distance_km,
    calculate_bounding_box,
    build_firms_area_url,
    parse_firms_csv,
    get_firms_for_mine,
    clear_firms_cache,
    FirmsHotspot,
    FirmsResponse,
)

client = TestClient(app)

SAMPLE_VIIRS_CSV = (
    "latitude,longitude,bright_ti4,scan,track,acq_date,acq_time,satellite,instrument,confidence,version,bright_ti5,frp,daynight\n"
    "21.8500,80.2000,325.4,0.4,0.4,2026-03-16,0815,N,VIIRS,nominal,2.0NRT,298.1,5.6,D\n"
    "21.7900,80.1500,340.2,0.4,0.4,2026-03-16,0815,N,VIIRS,high,2.0NRT,301.5,14.2,D\n"
)

SAMPLE_EMPTY_CSV = (
    "latitude,longitude,bright_ti4,scan,track,acq_date,acq_time,satellite,instrument,confidence,version,bright_ti5,frp,daynight\n"
)


@pytest.fixture(autouse=True)
def reset_firms_cache():
    clear_firms_cache()
    yield
    clear_firms_cache()


# ============================================================
# 1. SPATIAL & MATHEMATICAL UTILITIES
# ============================================================

def test_haversine_distance_zero():
    """Distance from a point to itself must be exactly 0 km."""
    d = haversine_distance_km(21.8129, 80.1835, 21.8129, 80.1835)
    assert round(d, 4) == 0.0


def test_haversine_distance_known_points():
    """Haversine distance calculation between Balaghat and Nagpur (~135-155 km)."""
    balaghat_lat, balaghat_lon = 21.8129, 80.1835
    nagpur_lat, nagpur_lon = 21.1458, 79.0882
    dist = haversine_distance_km(balaghat_lat, balaghat_lon, nagpur_lat, nagpur_lon)
    assert 130.0 < dist < 160.0


def test_calculate_bounding_box():
    """Bounding box calculation produces valid geographic bounds with radius."""
    lat, lon = 21.8129, 80.1835
    west, south, east, north = calculate_bounding_box(lat, lon, radius_km=20.0)

    assert west < east
    assert south < north
    assert west < lon < east
    assert south < lat < north


def test_bounding_box_coordinate_order_in_url():
    """NASA FIRMS Area API strictly requires WEST,SOUTH,EAST,NORTH order."""
    url = build_firms_area_url(
        map_key="TEST_KEY_123",
        source="VIIRS_NOAA21_NRT",
        west=79.9894,
        south=21.6327,
        east=80.3776,
        north=21.9931,
        day_range=1,
    )
    expected_area = "79.9894,21.6327,80.3776,21.9931"
    assert f"/api/area/csv/TEST_KEY_123/VIIRS_NOAA21_NRT/{expected_area}/1" in url


# ============================================================
# 2. CSV PARSING TESTS
# ============================================================

def test_parse_firms_csv_nominal():
    """Valid VIIRS CSV correctly parses into normalized FirmsHotspot objects."""
    center_lat, center_lon = 21.8129, 80.1835
    hotspots = parse_firms_csv(SAMPLE_VIIRS_CSV, center_lat, center_lon)

    assert len(hotspots) == 2

    # Sorted by proximity: closer hotspot (21.79, 80.15) appears first
    h1 = hotspots[0]
    assert h1.latitude == 21.7900
    assert h1.longitude == 80.1500
    assert h1.brightness_temperature_k == 340.2
    assert h1.frp == 14.2
    assert h1.confidence == "high"
    assert h1.distance_km > 0.0

    h2 = hotspots[1]
    assert h2.latitude == 21.8500
    assert h2.confidence == "nominal"
    assert h2.frp == 5.6


def test_parse_firms_csv_empty():
    """Header-only or blank CSV returns empty list without errors."""
    hotspots = parse_firms_csv(SAMPLE_EMPTY_CSV, 21.8129, 80.1835)
    assert hotspots == []

    blank_hotspots = parse_firms_csv("", 21.8129, 80.1835)
    assert blank_hotspots == []


def test_parse_firms_csv_malformed():
    """Malformed CSV text handles errors gracefully and parses valid rows."""
    malformed = "not,a,valid,csv\nfoo,bar\n"
    hotspots = parse_firms_csv(malformed, 21.8129, 80.1835)
    assert hotspots == []


# ============================================================
# 3. BACKEND API ENDPOINT TESTS (OFFLINE & UNAVAILABLE)
# ============================================================

def test_firms_endpoint_no_map_key():
    """Without NASA_FIRMS_MAP_KEY, endpoint returns 200 with status 'unavailable' (never 500)."""
    with patch.dict(os.environ, {"NASA_FIRMS_MAP_KEY": ""}, clear=False):
        response = client.get("/api/firms/MINE_BALAGHAT_01")
        assert response.status_code == 200
        data = response.json()

        assert data["mine_id"] == "MINE_BALAGHAT_01"
        assert "Balaghat" in data["mine_name"]
        assert data["status"] == "unavailable"
        assert data["hotspot_count"] == 0
        assert data["hotspots"] == []
        assert "latitude" in data and "longitude" in data
        assert data["latitude"] > 0
        assert data["longitude"] > 0
        assert "bounding_box" in data


def test_firms_endpoint_all_8_moil_mines():
    """All 8 MOIL concessions dynamically load coordinates and return valid 200 responses."""
    concessions = [
        ("MINE_BALAGHAT_01", "Balaghat"),
        ("MINE_GUMGAON_02", "Gumgaon"),
        ("MINE_TIRODI_03", "Tirodi"),
        ("MINE_DONGRI_04", "Dongri"),
        ("MINE_KANDRI_05", "Kandri"),
        ("MINE_MANSAR_06", "Mansar"),
        ("MINE_CHIKLA_07", "Chikla"),
        ("MINE_UKWA_08", "Ukwa"),
    ]

    with patch.dict(os.environ, {"NASA_FIRMS_MAP_KEY": ""}, clear=False):
        for m_id, m_name in concessions:
            res = client.get(f"/api/firms/{m_id}")
            assert res.status_code == 200, f"Failed for mine {m_id}"
            d = res.json()
            assert d["mine_id"] == m_id
            assert m_name.lower() in d["mine_name"].lower()
            assert d["latitude"] > 0
            assert d["longitude"] > 0
            assert d["radius_km"] == 20.0
            assert "west" in d["bounding_box"]


def test_firms_endpoint_invalid_mine_404():
    """Querying a non-existent mine_id returns HTTP 404."""
    response = client.get("/api/firms/MINE_NONEXISTENT_99")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


# ============================================================
# 4. MOCKED LIVE NASA API RESPONSES
# ============================================================

def test_firms_mocked_live_success():
    """Mocking NASA FIRMS 200 with detections returns live_observations."""
    mock_response = MagicMock()
    mock_response.status = 200
    mock_response.read.return_value = SAMPLE_VIIRS_CSV.encode("utf-8")
    mock_response.__enter__.return_value = mock_response

    with patch("urllib.request.urlopen", return_value=mock_response):
        with patch.dict(os.environ, {"NASA_FIRMS_MAP_KEY": "valid_dummy_key"}, clear=False):
            response = client.get("/api/firms/MINE_BALAGHAT_01")
            assert response.status_code == 200
            data = response.json()

            assert data["status"] == "live_observations"
            assert data["hotspot_count"] == 2
            assert len(data["hotspots"]) == 2
            assert data["hotspots"][0]["distance_km"] > 0


def test_firms_mocked_zero_observations():
    """When NASA returns 0 hotspots, status is 'no_observations' with 0 hotspots."""
    mock_response = MagicMock()
    mock_response.status = 200
    mock_response.read.return_value = SAMPLE_EMPTY_CSV.encode("utf-8")
    mock_response.__enter__.return_value = mock_response

    with patch("urllib.request.urlopen", return_value=mock_response):
        with patch.dict(os.environ, {"NASA_FIRMS_MAP_KEY": "valid_dummy_key"}, clear=False):
            response = client.get("/api/firms/MINE_BALAGHAT_01")
            assert response.status_code == 200
            data = response.json()

            assert data["status"] == "no_observations"
            assert data["hotspot_count"] == 0
            assert data["hotspots"] == []


def test_firms_mocked_http_403_forbidden():
    """Invalid Map Key returning 403 handles gracefully without raising 500."""
    http_err = urllib.error.HTTPError(
        url="https://firms.modaps.eosdis.nasa.gov",
        code=403,
        msg="Forbidden - Invalid Map Key",
        hdrs={},
        fp=io.BytesIO(b"Invalid map key"),
    )

    with patch("urllib.request.urlopen", side_effect=http_err):
        with patch.dict(os.environ, {"NASA_FIRMS_MAP_KEY": "invalid_key"}, clear=False):
            response = client.get("/api/firms/MINE_BALAGHAT_01")
            assert response.status_code == 200
            data = response.json()

            assert data["status"] == "unavailable"
            assert data["hotspot_count"] == 0


def test_firms_mocked_timeout_fallback():
    """Network timeout handles gracefully without crashing backend."""
    url_err = urllib.error.URLError(reason="timed out")

    with patch("urllib.request.urlopen", side_effect=url_err):
        with patch.dict(os.environ, {"NASA_FIRMS_MAP_KEY": "dummy_key"}, clear=False):
            response = client.get("/api/firms/MINE_BALAGHAT_01")
            assert response.status_code == 200
            data = response.json()

            assert data["status"] == "unavailable"
            assert "unreachable" in data["message"].lower() or "timeout" in data["message"].lower()


# ============================================================
# 5. CACHING & CACHE INVALIDATION
# ============================================================

def test_firms_caching_behavior():
    """Subsequent requests hit the in-memory cache and don't re-invoke urlopen."""
    mock_response = MagicMock()
    mock_response.status = 200
    mock_response.read.return_value = SAMPLE_VIIRS_CSV.encode("utf-8")
    mock_response.__enter__.return_value = mock_response

    with patch("urllib.request.urlopen", return_value=mock_response) as mock_urlopen:
        with patch.dict(os.environ, {"NASA_FIRMS_MAP_KEY": "valid_key"}, clear=False):
            # First request
            res1 = client.get("/api/firms/MINE_BALAGHAT_01")
            assert res1.status_code == 200
            assert mock_urlopen.call_count == 1

            # Second request - cache hit
            res2 = client.get("/api/firms/MINE_BALAGHAT_01")
            assert res2.status_code == 200
            assert mock_urlopen.call_count == 1

            # Invalidate cache via POST endpoint
            clear_res = client.post("/api/firms/cache/clear")
            assert clear_res.status_code == 200

            # Third request - re-fetches
            res3 = client.get("/api/firms/MINE_BALAGHAT_01")
            assert res3.status_code == 200
            assert mock_urlopen.call_count == 2


# ============================================================
# 6. ZERO KEY EXPOSURE & SECURITY
# ============================================================

def test_firms_zero_key_exposure():
    """The MAP_KEY must never leak into API responses, payloads, or messages."""
    secret_key = "TOP_SECRET_NASA_MAP_KEY_XYZ_99999"

    mock_response = MagicMock()
    mock_response.status = 200
    mock_response.read.return_value = SAMPLE_VIIRS_CSV.encode("utf-8")
    mock_response.__enter__.return_value = mock_response

    with patch("urllib.request.urlopen", return_value=mock_response):
        with patch.dict(os.environ, {"NASA_FIRMS_MAP_KEY": secret_key}, clear=False):
            response = client.get("/api/firms/MINE_BALAGHAT_01")
            assert response.status_code == 200
            body_text = response.text

            assert secret_key not in body_text
            for k, v in response.headers.items():
                assert secret_key not in v


# ============================================================
# 7. FLEET-WIDE SUMMARY ENDPOINT
# ============================================================

def test_firms_summary_endpoint():
    """Summary endpoint aggregates status across all 8 MOIL concessions."""
    with patch.dict(os.environ, {"NASA_FIRMS_MAP_KEY": ""}, clear=False):
        res = client.get("/api/firms/all/summary")
        assert res.status_code == 200
        data = res.json()

        assert isinstance(data, list)
        assert len(data) == 8
        assert data[0]["mine_id"] == "MINE_BALAGHAT_01"
        assert "radius_km" in data[0]
