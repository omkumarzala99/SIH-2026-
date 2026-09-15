# GIS & Space Technology Module (Member 4 Ownership)

> **PS-26009** — Using AI/ML and Space Technology to Identify Manganese Reserves and Overcome Production Shortfalls  
> **Smart India Hackathon 2026** | MOIL Mining Intelligence Platform

---

## 1. GIS Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│                    GIS MODULE ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   GeoJSON Files (gis/data/)                                      │
│        │                                                         │
│        ▼                                                         │
│   fetch() / Future API ──────────► Backend REST API              │
│        │                           (Replace fetch URLs           │
│        ▼                            with /api/gis/... endpoints) │
│   Leaflet.js Layer Engine                                        │
│        │                                                         │
│        ├── Mine Markers (Point)                                  │
│        ├── Mine Boundaries (Polygon)                             │
│        ├── Mining Zones (Polygon)                                │
│        ├── Reserve Potential (Polygon, color-coded)              │
│        ├── Risk Zones (Polygon, color-coded)                     │
│        └── Satellite Indicators (Overlay labels)                 │
│        │                                                         │
│        ▼                                                         │
│   Interactive Dark-Themed Map                                    │
│        ├── Layer toggle controls                                 │
│        ├── Drill-down navigation                                 │
│        ├── Click popups with zone details                        │
│        ├── Info panel                                            │
│        └── Legend                                                │
│                                                                  │
│   Satellite Provider (gis/satellite/provider.py)                 │
│        ├── MockSatelliteProvider (offline demo)                  │
│        └── CopernicusSatelliteAdapter (live API stub)            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Folder Structure

```text
gis/
├── map/                          # Standalone Leaflet.js GIS prototype
│   ├── index.html                # Main HTML page (entry point)
│   ├── style.css                 # Dark-themed mining intelligence CSS
│   └── map.js                    # Core map controller & layer logic
│
├── data/                         # GeoJSON + JSON data consumed by the map
│   ├── moil_mines.geojson        # 10 MOIL mine Point locations
│   ├── mine_boundaries.geojson   # 4 mine lease boundary Polygons
│   ├── mining_zones.geojson      # 9 mining zone Polygons
│   ├── reserve_zones.geojson     # 8 reserve potential Polygons
│   ├── risk_zones.geojson        # 6 risk zone Polygons
│   └── satellite_indicators.json # 9 satellite/environmental indicator records
│
├── geojson/                      # Original Balaghat-specific GeoJSON (preserved)
│   ├── mine_boundary.geojson     # Balaghat concession boundary
│   ├── mining_zones.geojson      # Balaghat mining zones (5 zones)
│   └── reserve_zones.geojson     # Balaghat reserve potential (4 zones)
│
├── satellite/                    # Python satellite data provider
│   ├── __init__.py
│   └── provider.py               # BaseSatelliteProvider, MockSatelliteProvider,
│                                 # CopernicusSatelliteAdapter
│
├── layers/                       # Reserved for future layer processors
│   └── __init__.py
│
├── processing/                   # Reserved for GIS data processing
├── services/                     # Reserved for GIS services
├── utils/                        # Reserved for GIS utilities
├── __init__.py
└── README.md                     # This file
```

Frontend data mirror (for future React integration):

```text
frontend/public/data/
├── moil_mines.geojson            # Copy of gis/data/moil_mines.geojson
├── mine_boundaries.geojson       # Copy of gis/data/mine_boundaries.geojson
├── mine_boundary.geojson         # Original Balaghat boundary (pre-existing)
├── mining_zones.geojson          # Original Balaghat zones (pre-existing)
├── reserve_zones.geojson         # Original Balaghat reserves (pre-existing)
├── risk_zones.geojson            # Copy of gis/data/risk_zones.geojson
└── satellite_indicators.json     # Copy of gis/data/satellite_indicators.json
```

---

## 3. GeoJSON Schema

### Mine Locations (`moil_mines.geojson`)

```json
{
  "type": "Feature",
  "geometry": { "type": "Point", "coordinates": [longitude, latitude] },
  "properties": {
    "mine_id": "M01",
    "name": "Balaghat Mine (Bharveli)",
    "state": "Madhya Pradesh",
    "district": "Balaghat",
    "tehsil": "Balaghat",
    "commodity": "Manganese Ore",
    "mine_type": "Underground | Opencast",
    "status": "Operational",
    "operator": "MOIL Limited",
    "description": "...",
    "coordinate_accuracy": "REFERENCED | APPROXIMATE",
    "source": "Source reference string",
    "icon": "underground | opencast"
  }
}
```

### Mine Boundaries (`mine_boundaries.geojson`)

```json
{
  "type": "Feature",
  "geometry": { "type": "Polygon", "coordinates": [[[lon, lat], ...]] },
  "properties": {
    "mine_id": "M01",
    "name": "Balaghat Mine Lease Perimeter",
    "state": "Madhya Pradesh",
    "district": "Balaghat",
    "area_sq_km": 14.85,
    "operator": "MOIL Limited",
    "lease_validity": "2045-12-31",
    "data_type": "APPROXIMATE | DEMO_APPROXIMATE"
  }
}
```

### Mining Zones (`mining_zones.geojson`)

```json
{
  "type": "Feature",
  "geometry": { "type": "Polygon", "coordinates": [[[lon, lat], ...]] },
  "properties": {
    "zone_id": "Z01",
    "mine_id": "M01",
    "mine_name": "Balaghat Mine",
    "name": "North Bench Pit A",
    "status": "ACTIVE_EXTRACTION | HIGH_EXTRACTION | DEVELOPMENT_BENCH | GEOLOGICAL_PROSPECTING | WASTE_STABILIZATION",
    "current_bench_level": "-120m RL",
    "active_equipment_count": 4,
    "daily_target_tons": 450,
    "safety_clearance": "APPROVED | RESTRICTED | RESTRICTED_MONSOON",
    "data_type": "DEMO"
  }
}
```

### Reserve Zones (`reserve_zones.geojson`)

```json
{
  "type": "Feature",
  "geometry": { "type": "Polygon", "coordinates": [[[lon, lat], ...]] },
  "properties": {
    "zone_id": "Z01",
    "mine_id": "M01",
    "mine_name": "Balaghat Mine",
    "name": "North High-Grade Manganese Reef",
    "reserve_level": "HIGH | MEDIUM | LOW",
    "reserve_score": 0.89,
    "estimated_tonnage_kt": 485,
    "avg_mn_grade_pct": 44.2,
    "avg_fe_grade_pct": 5.8,
    "confidence": 0.86,
    "primary_formation": "Sausar Group Gondite",
    "data_type": "DEMO"
  }
}
```

### Risk Zones (`risk_zones.geojson`)

```json
{
  "type": "Feature",
  "geometry": { "type": "Polygon", "coordinates": [[[lon, lat], ...]] },
  "properties": {
    "zone_id": "Z03",
    "mine_id": "M01",
    "mine_name": "Balaghat Mine",
    "name": "South Expansion Zone C — Monsoon Risk",
    "risk_level": "HIGH | MEDIUM | LOW",
    "risk_score": 0.82,
    "risk_factors": ["Heavy monsoon rainfall", "Pit floor waterlogging", "..."],
    "mitigation_status": "MONITORING | SCHEDULED | ACTIVE_MITIGATION | PLANNING",
    "data_type": "DEMO"
  }
}
```

### Satellite Indicators (`satellite_indicators.json`)

```json
{
  "zone_id": "Z01",
  "mine_id": "M01",
  "mine_name": "Balaghat Mine",
  "zone_name": "North Bench Pit A",
  "ndvi": 0.15,
  "ndvi_interpretation": "Very low vegetation — exposed pit floor",
  "surface_moisture_pct": 18.5,
  "land_disturbance": "HIGH | MEDIUM | LOW",
  "vegetation_stress": "HIGH | MODERATE | LOW | N/A",
  "rainfall_mm_monthly": 142.0,
  "land_surface_temp_c": 38.2,
  "cloud_coverage_pct": 4.2,
  "acquisition_date": "2026-09-10",
  "data_type": "DEMO"
}
```

---

## 4. How to Run the Standalone Map

### Option A: Python HTTP Server (Recommended)

```bash
cd gis/
python3 -m http.server 8080
```

Then open: **http://localhost:8080/map/**

### Option B: Node.js HTTP Server

```bash
npx -y serve gis/ -l 8080
```

Then open: **http://localhost:8080/map/**

### Option C: VS Code Live Server

Right-click `gis/map/index.html` → "Open with Live Server"

> **Note:** The map must be served over HTTP (not `file://`) because it uses `fetch()` to load GeoJSON data.

---

## 5. How to Add a New Mine

1. Open `gis/data/moil_mines.geojson`
2. Add a new Feature to the `features` array:

```json
{
  "type": "Feature",
  "id": "M11",
  "properties": {
    "mine_id": "M11",
    "name": "New Mine Name",
    "state": "Maharashtra",
    "district": "District Name",
    "tehsil": "Tehsil Name",
    "commodity": "Manganese Ore",
    "mine_type": "Underground",
    "status": "Operational",
    "operator": "MOIL Limited",
    "description": "Description of the mine.",
    "coordinate_accuracy": "APPROXIMATE",
    "source": "Source reference",
    "icon": "underground"
  },
  "geometry": {
    "type": "Point",
    "coordinates": [LONGITUDE, LATITUDE]
  }
}
```

3. Copy the updated file to `frontend/public/data/moil_mines.geojson`
4. Refresh the map — the new mine will appear automatically

---

## 6. How to Add a New Zone

1. Open the relevant GeoJSON file (`mining_zones.geojson`, `reserve_zones.geojson`, or `risk_zones.geojson`)
2. Add a new Polygon feature with the appropriate properties (see schemas in Section 3)
3. Ensure the `zone_id` is unique and `mine_id` links to an existing mine
4. For satellite indicators, add a matching entry in `satellite_indicators.json`
5. Refresh the map

---

## 7. Reserve and Risk Value Representation

### Reserve Levels

| Level  | Score Range | Color   | Meaning                          |
|--------|-------------|---------|----------------------------------|
| HIGH   | ≥ 0.70      | Green   | High-confidence ore body         |
| MEDIUM | 0.40 – 0.69 | Yellow  | Moderate potential, needs more drilling |
| LOW    | < 0.40      | Red     | Marginal or uncertain reserve    |

### Risk Levels

| Level  | Score Range | Color   | Meaning                          |
|--------|-------------|---------|----------------------------------|
| HIGH   | ≥ 0.70      | Red     | Immediate operational concern    |
| MEDIUM | 0.40 – 0.69 | Orange  | Elevated risk, monitoring needed |
| LOW    | < 0.40      | Green   | Manageable/low risk              |

The map visually encodes these levels through polygon fill colors and popup badges.

---

## 8. Future Backend / API Integration

The GIS module is designed for easy backend integration. In `map.js`, the `CONFIG.dataPaths` object defines all data source URLs:

```javascript
const CONFIG = {
  dataBasePath: '../data',  // Change to API base URL
  dataPaths: {
    mines: 'moil_mines.geojson',        // → /api/gis/mines
    boundaries: 'mine_boundaries.geojson', // → /api/gis/boundaries
    miningZones: 'mining_zones.geojson', // → /api/gis/zones
    reserves: 'reserve_zones.geojson',   // → /api/gis/reserves
    risk: 'risk_zones.geojson',          // → /api/gis/risk
    satellite: 'satellite_indicators.json', // → /api/gis/satellite
  },
};
```

### Integration Steps

1. **Change `dataBasePath`** to point to your backend API (e.g., `http://localhost:8000/api/gis`)
2. **Ensure API responses** return the same GeoJSON/JSON schema as the static files
3. **Use `window.updateGISLayer()`** to dynamically push ML predictions:

```javascript
// Example: Update reserve layer with fresh ML predictions
fetch('/api/ml/reserve-predictions')
  .then(res => res.json())
  .then(geojson => {
    window.updateGISLayer('reserves', geojson);
  });
```

### React Frontend Integration

The React frontend (Member 6) can integrate the GIS module by:

1. **Using static data** from `frontend/public/data/` with `react-leaflet`
2. **Embedding the standalone map** in an iframe during development
3. **Porting `map.js` logic** into a React component using `react-leaflet` wrappers
4. **Consuming the same GeoJSON schema** — all data structures are designed to be framework-agnostic

---

## 9. Data Provenance — Real vs. Demo/Synthetic

### ✅ Real / Official Data

| Data | Source | Accuracy |
|------|--------|----------|
| Mine names and locations (10 mines) | MOIL official website, forestsclearance.nic.in, Mapcarta, Wikimapia, ResearchGate | REFERENCED or APPROXIMATE (flagged per mine) |
| Mine types (Underground/Opencast) | MOIL official documentation | Confirmed |
| District and tehsil assignments | MOIL official website, government documents | Confirmed |
| Geological formations (Sausar Group etc.) | Published geological literature | Confirmed |

### ⚠️ Demo / Synthetic Data

| Data | Status |
|------|--------|
| Mine boundary polygons (except Balaghat) | DEMO_APPROXIMATE — representative shapes, not survey-grade |
| Mining zone geometries | DEMO — approximate operational zone representations |
| Reserve scores, tonnage estimates, grade values | DEMO — synthetic values for visualization prototype |
| Risk scores and risk factors | DEMO — synthetic values for visualization prototype |
| Satellite indicators (NDVI, moisture, temperature) | DEMO — synthetic values, not actual satellite observations |

> **All demo/synthetic data is explicitly marked with `"data_type": "DEMO"` in the JSON and labelled in UI popups.**

---

## 10. Coordinate Sources

| Mine | Coordinates | Source | Accuracy |
|------|------------|--------|----------|
| Balaghat (Bharveli) | 21.8502°N, 80.2274°E | Wikimapia, Mapcarta | REFERENCED |
| Tirodi | 21.6836°N, 79.7247°E | Mapcarta, forestsclearance.nic.in | REFERENCED |
| Sitapatore | 21.7000°N, 79.6667°E | forestsclearance.nic.in | APPROXIMATE |
| Ukwa | 21.9691°N, 80.4582°E | latitude.to, geloky.com | APPROXIMATE |
| Kandri | 21.4106°N, 79.2656°E | forestsclearance.nic.in | REFERENCED |
| Mansar | 21.3967°N, 79.2627°E | Mapcarta (Mansar village) | APPROXIMATE |
| Beldongri | 21.3833°N, 79.1500°E | Parseoni town reference | APPROXIMATE |
| Gumgaon | 21.4000°N, 78.9833°E | ResearchGate, forestsclearance.nic.in | REFERENCED |
| Dongri Buzurg | 21.5461°N, 79.6867°E | forestsclearance.nic.in | REFERENCED |
| Chikla | 21.5336°N, 79.7437°E | Mapcarta, forestsclearance.nic.in | REFERENCED |

---

## Layers Provided

- `moil_mines.geojson`: 10 MOIL mine Point locations with sourced coordinates
- `mine_boundaries.geojson`: Lease boundary Polygons for 4 major mines
- `mining_zones.geojson`: 9 active mining zone Polygons across 3 mines
- `reserve_zones.geojson`: 8 AI-classified reserve potential Polygons with probability, tonnage, and grade attributes
- `risk_zones.geojson`: 6 multi-factor risk zone Polygons with risk scores and contributing factors
- `satellite_indicators.json`: 9 satellite/environmental indicator records (NDVI, moisture, temperature, disturbance)

## Satellite / Remote Sensing Architecture

- `gis/satellite/provider.py`: Provides modular `BaseSatelliteProvider` interface.
- Includes `MockSatelliteProvider` for offline hackathon demonstration.
- Includes `CopernicusSatelliteAdapter` ready for live ESA Copernicus / Sentinel Hub API connection.
- Frontend satellite data served via `satellite_indicators.json` — designed to be replaced by API responses.
