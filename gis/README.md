# GIS & Space Technology Module (Member 4 Ownership)

Manages geospatial vector layers, pit bench coordinates, borehole GIS mappings, and satellite remote sensing integrations (Sentinel-2, Landsat-9, and NASA SMAP).

## Layers Provided
- `mine_boundary.geojson`: Perimeter concession lease boundary.
- `mining_zones.geojson`: Active open-pit extraction benches and waste stabilization blocks.
- `reserve_zones.geojson`: AI-classified reserve potential polygons with probability, estimated tonnage, and ore grade attributes.

## Satellite / Remote Sensing Architecture
- `gis/satellite/provider.py`: Provides modular `BaseSatelliteProvider` interface.
- Includes `MockSatelliteProvider` for offline hackathon demonstration.
- Includes `CopernicusSatelliteAdapter` ready for live ESA Copernicus / Sentinel Hub API connection.
