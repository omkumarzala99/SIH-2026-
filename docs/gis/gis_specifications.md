# GIS & Space Technology Specifications: MOIL Mining Intelligence Platform

## Overview
The Geographic Information Systems (GIS) layer provides spatial visualization and remote sensing telemetry for the MOIL mining platform.

---

## 1. Spatial Vector Layers (GeoJSON WGS84)
- **`mine_boundary.geojson`**: Concession lease boundary covering $14.85\text{ km}^2$ in Balaghat Concession.
- **`mining_zones.geojson`**: Active operational extraction pits and benches:
  - `ZONE_NORTH_A`: North Bench Pit A (Bench level -120m RL, active target 450t)
  - `ZONE_CENTRAL_B`: Central Main Pit B (Bench level -160m RL, active target 520t)
  - `ZONE_SOUTH_C`: South Expansion Zone C (Development bench -60m RL)
  - `ZONE_EAST_D`: East Exploration Block D (Prospecting surface +320m RL)
  - `ZONE_WEST_E`: West Overburden Dump E (Waste stabilization block +340m RL)
- **`reserve_zones.geojson`**: Spatial reserve classification polygons with manganese potential properties (`HIGH`, `MEDIUM`, `LOW`).

---

## 2. Satellite & Remote Sensing Feeds
- **Normalized Difference Vegetation Index (NDVI)**: Derived from Sentinel-2 Band 8 (NIR) and Band 4 (Red):
  $$\text{NDVI} = \frac{\text{B8} - \text{B4}}{\text{B8} + \text{B4}}$$
  Exposed ore reefs show low NDVI ($0.12 - 0.20$), indicating vegetation removal and surface mineralization.
- **Land Surface Temperature (LST)**: Radiometric thermal observations from Landsat-9 TIRS Band 10 ($10.6 - 11.2\,\mu\text{m}$).
- **Soil Moisture**: Synthetic radar backscatter approximation for pit water saturation.
