# Data Dictionary: MOIL Mining Intelligence Platform

## Overview of Datasets
All prototype datasets (`geological_data.csv`, `production_data.csv`, `equipment_data.csv`, `weather_data.csv`, `satellite_data.csv`) are located in `data/mock/` and are joined via consistent primary keys: `mine_id`, `zone_id`, and `timestamp`.

---

## 1. `geological_data.csv`
| Field | Type | Physical Bounds / Units | Description |
| :--- | :--- | :--- | :--- |
| `borehole_id` | String | e.g. `BH-101` | Unique exploratory borehole identifier |
| `mine_id` | String | e.g. `MINE_BALAGHAT_01` | Concession identifier |
| `zone_id` | String | e.g. `ZONE_NORTH_A` | Operational sector / bench |
| `latitude` / `longitude` | Float | WGS84 coordinates | Spatial location of borehole collar |
| `depth_meters` | Float | 0.0 – 1000.0 m | Drilling intercept depth |
| `mn_grade_pct` | Float | 0.0 – 60.0% | Chemical assay percentage of Manganese ($Mn$) |
| `fe_grade_pct` | Float | 0.0 – 30.0% | Chemical assay percentage of Iron ($Fe$) |
| `sio2_pct` | Float | 0.0 – 50.0% | Chemical assay percentage of Silica ($SiO_2$) |
| `phosphorus_pct` | Float | 0.0 – 2.0% | Percentage of Phosphorus ($P$) impurity |
| `rock_formation` | String | Text | Lithological formation (`Mansar Schist`, `Sausar Group Gondite`) |
| `subsurface_layer` | String | Text | Stratigraphic horizon (`Primary Ore Body`, `Overburden`) |
| `timestamp` | ISO8601 | UTC Timestamp | Date and time of logging |

---

## 2. `production_data.csv`
| Field | Type | Bounds / Units | Description |
| :--- | :--- | :--- | :--- |
| `date` | Date | `YYYY-MM-DD` | Production calendar date |
| `shift` | String | `Shift-A`, `Shift-B`, `Shift-C` | Shift code (8 hours each) |
| `planned_tonnage` | Float | Metric tonnes | Scheduled extraction target |
| `actual_tonnage` | Float | Metric tonnes | Dispatched ore volume |
| `shortfall_tonnage` | Float | Metric tonnes | $\max(0, \text{planned} - \text{actual})$ |
| `ore_grade_mined` | Float | % Mn | Blended dispatched ore grade |
| `hauling_trips` | Integer | Count | Dumper hauling round-trips |
| `blasting_status` | String | Status | Execution state (`Completed`, `Delayed`, `Suspended`) |
| `blasting_delay_hours` | Float | Hours (0 - 12h) | Pit evacuation and ignition delay |

---

## 3. `equipment_data.csv`
| Field | Type | Bounds / Units | Description |
| :--- | :--- | :--- | :--- |
| `equipment_id` | String | e.g. `EXC_CAT_349_01` | Unique asset machine code |
| `equipment_type` | String | Category | Excavator, Haul Dumper, Blast Drill Rig, Crusher |
| `operational_hours`| Float | 0 – 24 hrs | Daily run time |
| `downtime_hours` | Float | 0 – 24 hrs | Idle or breakdown hours |
| `downtime_reason` | String | Root cause | Specific mechanical failure description |
| `efficiency_pct` | Float | 0 – 100% | Overall Equipment Effectiveness (OEE) |
| `health_status` | String | Status | `OPTIMAL`, `WARNING`, `CRITICAL_MAINTENANCE` |

---

## 4. `weather_data.csv`
| Field | Type | Bounds / Units | Description |
| :--- | :--- | :--- | :--- |
| `rainfall_mm` | Float | Millimeters (mm) | 24-hour precipitation accumulation |
| `soil_moisture_pct`| Float | % (0 – 100%) | Ground saturation index |
| `ambient_temp_c` | Float | Celsius (&deg;C) | Pit ambient surface temperature |
| `humidity_pct` | Float | % (0 – 100%) | Relative humidity |
| `flood_risk_index`| String | Risk tier | `LOW`, `MODERATE`, `SEVERE` |

---

## 5. `satellite_data.csv`
| Field | Type | Bounds / Units | Description |
| :--- | :--- | :--- | :--- |
| `satellite_source` | String | Sensor mission | `Sentinel-2 MSI`, `Landsat-9 OLI-2` |
| `ndvi` | Float | -1.0 to +1.0 | Normalized Difference Vegetation Index |
| `ndwi` | Float | -1.0 to +1.0 | Normalized Difference Water Index (pit sumps) |
| `land_surface_temp_c`| Float | Celsius (&deg;C) | Radiometric thermal band temperature |
| `data_quality_flag`| String | Flag | `CLEAR`, `HAZY`, `INTERPOLATED` |
