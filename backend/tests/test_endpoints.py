"""
Backend integration test suite.
"""
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_models_registry_endpoint():
    response = client.get("/api/models")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 3


def test_prediction_history_endpoint():
    response = client.get("/api/prediction-history")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert "prediction_error_tonnes" in data[0]


def test_gis_zones_endpoint():
    response = client.get("/api/gis/zones")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 3
