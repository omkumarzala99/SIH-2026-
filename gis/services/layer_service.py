"""
GIS Layer Service: Loads, serves, and queries GeoJSON spatial layers.
"""
import os
import json
from typing import Dict, Any, Optional

GEOJSON_DIRS = ["gis/geojson", "gis/data"]


def get_layer_geojson(layer_name: str) -> Optional[Dict[str, Any]]:
    """Retrieves GeoJSON feature collection by layer name."""
    filename = f"{layer_name}.geojson" if not layer_name.endswith(".geojson") else layer_name
    for base_dir in GEOJSON_DIRS:
        path = os.path.join(base_dir, filename)
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
    return None


def list_available_layers() -> Dict[str, Any]:
    """Lists all active GIS layers with metadata."""
    return {
        "layers": [
            {
                "id": "mine_boundary",
                "name": "Mine Concession Boundary",
                "type": "Polygon",
                "description": "Perimeter lease coordinates of Balaghat Manganese Concession",
                "color": "#f59e0b"
            },
            {
                "id": "mining_zones",
                "name": "Operational Mining Zones & Benches",
                "type": "Polygon",
                "description": "Active extraction pits, development benches, and waste dumps",
                "color": "#3b82f6"
            },
            {
                "id": "reserve_zones",
                "name": "AI Reserve Probability Heatmap",
                "type": "Polygon",
                "description": "Surface and sub-surface manganese reserve classification (High/Med/Low)",
                "color": "#22c55e"
            }
        ]
    }
