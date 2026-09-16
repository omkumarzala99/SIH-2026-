"""
Automated tests for GIS and satellite endpoints with multi-mine integration.
Verifies:
1. GIS endpoints accept and handle mine_id query parameters.
2. Satellite endpoint returns real mine-specific telemetry from database.
3. Balaghat returns Balaghat concession and zone records.
4. Gumgaon returns Gumgaon concession and zone records.
5. Invalid mine IDs return 404 without crashing.
6. Existing GIS layer listing and coordinate queries remain fully backward-compatible.
"""
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_gis_layers_listing():
    """Verify GET /api/gis/layers lists active vector layers."""
    res = client.get("/api/gis/layers")
    assert res.status_code == 200
    data = res.json()
    assert "layers" in data
    assert len(data["layers"]) >= 3
    layer_ids = [l["id"] for l in data["layers"]]
    assert "mine_boundary" in layer_ids
    assert "mining_zones" in layer_ids
    assert "reserve_zones" in layer_ids


def test_gis_geojson_balaghat_default():
    """Verify GET /api/gis/geojson/{layer} defaults to Balaghat when mine_id is omitted."""
    # 1. Boundary
    res_b = client.get("/api/gis/geojson/mine_boundary")
    assert res_b.status_code == 200
    b_data = res_b.json()
    assert b_data["type"] == "FeatureCollection"
    assert len(b_data["features"]) >= 1
    assert "Balaghat" in b_data["features"][0]["properties"]["name"]

    # 2. Mining Zones (5 operational zones for Balaghat)
    res_z = client.get("/api/gis/geojson/mining_zones")
    assert res_z.status_code == 200
    z_data = res_z.json()
    assert len(z_data["features"]) == 5
    zone_ids = [f["properties"]["zone_id"] for f in z_data["features"]]
    assert "ZONE_NORTH_A" in zone_ids or "Z01" in zone_ids

    # 3. Reserve Zones
    res_r = client.get("/api/gis/geojson/reserve_zones")
    assert res_r.status_code == 200
    r_data = res_r.json()
    assert len(r_data["features"]) >= 4


def test_gis_geojson_gumgaon_filtering():
    """Verify GET /api/gis/geojson/{layer}?mine_id=MINE_GUMGAON_02 returns Gumgaon spatial layers."""
    # 1. Gumgaon Boundary
    res_b = client.get("/api/gis/geojson/mine_boundary?mine_id=MINE_GUMGAON_02")
    assert res_b.status_code == 200
    b_data = res_b.json()
    assert b_data["type"] == "FeatureCollection"
    assert "Gumgaon" in b_data["features"][0]["properties"]["name"]

    # 2. Gumgaon Mining Zones (4 operational zones)
    res_z = client.get("/api/gis/geojson/mining_zones?mine_id=MINE_GUMGAON_02")
    assert res_z.status_code == 200
    z_data = res_z.json()
    assert len(z_data["features"]) == 4
    for feat in z_data["features"]:
        assert feat["properties"]["mine_id"] == "MINE_GUMGAON_02"
        assert "GMG" in feat["properties"]["zone_id"]

    # 3. Gumgaon Reserve Zones
    res_r = client.get("/api/gis/geojson/reserve_zones?mine_id=MINE_GUMGAON_02")
    assert res_r.status_code == 200
    r_data = res_r.json()
    assert len(r_data["features"]) == 4
    for feat in r_data["features"]:
        assert feat["properties"]["mine_id"] == "MINE_GUMGAON_02"
        assert feat["properties"]["classification"] in ["HIGH", "MEDIUM", "LOW"]


def test_gis_satellite_indices_balaghat():
    """Verify GET /api/gis/satellite-indices returns Balaghat telemetry."""
    res = client.get("/api/gis/satellite-indices?mine_id=MINE_BALAGHAT_01")
    assert res.status_code == 200
    data = res.json()
    assert data["mine_id"] == "MINE_BALAGHAT_01"
    assert "Balaghat" in data["mine_name"]
    assert "ndvi" in data
    assert "ndwi" in data
    assert "land_surface_temp_c" in data
    assert "soil_moisture_satellite_pct" in data
    assert "cloud_coverage_pct" in data
    assert "rainfall_mm" in data
    assert data["status"] == "VALID_OBSERVATION"
    assert len(data["indicators"]) == 5


def test_gis_satellite_indices_gumgaon():
    """Verify GET /api/gis/satellite-indices returns Gumgaon telemetry distinct from Balaghat."""
    res_bgt = client.get("/api/gis/satellite-indices?mine_id=MINE_BALAGHAT_01")
    res_gmg = client.get("/api/gis/satellite-indices?mine_id=MINE_GUMGAON_02")
    assert res_gmg.status_code == 200
    data = res_gmg.json()
    assert data["mine_id"] == "MINE_GUMGAON_02"
    assert "Gumgaon" in data["mine_name"]
    assert len(data["indicators"]) == 4
    # Verify values differ from Balaghat
    assert data["ndvi"] != res_bgt.json()["ndvi"]
    assert data["soil_moisture_satellite_pct"] != res_bgt.json()["soil_moisture_satellite_pct"]


def test_gis_invalid_mine_id():
    """Verify invalid mine IDs return 404 on both GIS geojson and satellite endpoints."""
    res_geo = client.get("/api/gis/geojson/mine_boundary?mine_id=MINE_NONEXISTENT_99")
    assert res_geo.status_code == 404

    res_sat = client.get("/api/gis/satellite-indices?mine_id=MINE_NONEXISTENT_99")
    assert res_sat.status_code == 404


def test_gis_backward_compatibility():
    """Verify spatial query with lat/lon coordinates works without mine_id."""
    res = client.get("/api/gis/satellite-indices?lat=21.8129&lon=80.1835")
    assert res.status_code == 200
    data = res.json()
    assert "ndvi" in data
    assert data["status"] == "VALID_OBSERVATION"
