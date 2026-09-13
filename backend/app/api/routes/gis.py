"""
Geographic Information Systems (GIS) & Satellite Endpoints.
"""
from fastapi import APIRouter, HTTPException
from gis.services.layer_service import list_available_layers, get_layer_geojson
from gis.satellite.provider import MockSatelliteProvider

router = APIRouter(prefix="/gis", tags=["GIS"])


@router.get("/layers")
def get_layers():
    """Lists available geospatial vector layers."""
    return list_available_layers()


@router.get("/zones")
def get_mining_zones():
    """Lists operational mining zones with spatial properties."""
    data = get_layer_geojson("mining_zones")
    if not data or "features" not in data:
        return []
    return [f.get("properties", {}) for f in data["features"]]


@router.get("/geojson/{layer_name}")
def get_geojson(layer_name: str):
    """Serves GeoJSON data for Leaflet map display."""
    data = get_layer_geojson(layer_name)
    if not data:
        raise HTTPException(status_code=404, detail=f"Layer '{layer_name}' not found")
    return data


@router.get("/satellite-indices")
def get_satellite_indices(lat: float = 21.8129, lon: float = 80.1835):
    """Fetches satellite indices (NDVI, LST, soil moisture) for coordinates."""
    provider = MockSatelliteProvider()
    return provider.get_indices(lat, lon)
