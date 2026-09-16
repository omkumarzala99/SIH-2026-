# Data Dictionary & Synthetic Catalog Specifications
**MOIL AI Mining Intelligence Platform**
**Organization:** MOIL Limited / Ministry of Steel

---

## 1. Domain Calibration & Data Context

All datasets in this platform are calibrated to reflect the geological and operational realities of the **Central Indian Manganese Ore Belt** (stretching across Balaghat district in Madhya Pradesh, and Nagpur and Bhandara districts in Maharashtra), operated by **MOIL Limited**.

### Concession Profile: Balaghat Mine (Bharveli)
- **Geology:** Sausar Group metasediments comprising quartzites, schists, and calc-silicate marbles host the world-renowned braunite-bixbyite-pyrolusite ore bodies.
- **Ore Grade:** High-grade manganese ore typically ranges between $35.0\%$ and $48.0\% Mn$, with low phosphorus ($\le 0.15\% P$) and favorable $Mn:Fe$ ratios ($> 5:1$).
- **Mining Method:** Integrated large-scale opencast pit coupled with deep underground shaft extraction.

---

## 2. Core Relational Data Schemas

### 2.1 Subsurface Geological Assays (`geological_observations`)
Records sub-surface core drilling assays from exploratory diamond core drilling.

| Column Name | Data Type | Units / Format | Physical Bounds | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | String (PK) | `GEO_xxx` | Unique | Primary key observation identifier. |
| `zone_id` | String (FK) | `ZONE_xxx` | Valid Zone | Foreign key pointing to the concession pit zone. |
| `borehole_id` | String | `BH-xxx` | Alphanumeric | Drill hole collar identification code. |
| `depth_m` | Float | Meters | $5.0 - 350.0$ | Depth from surface collar to sample interval. |
| `manganese_pct` | Float | Percent (%) | $12.0 - 54.0$ | Laboratory assay elemental manganese ($Mn$). |
| `iron_pct` | Float | Percent (%) | $2.5 - 22.0$ | Elemental iron ($Fe$) concentration. |
| `silica_pct` | Float | Percent (%) | $1.5 - 28.0$ | Silica ($SiO_2$) gangue concentration. |
| `phosphorus_pct`| Float | Percent (%) | $0.05 - 0.25$| Phosphorus ($P$) penalty element. |
| `lithology` | String | Categorical | Host Rocks | Host formation (Braunite Ore, Gondite, Quartzite). |
| `reserve_category`| String | Enum | `HIGH`, `MED`, `LOW` | Calibrated ground-truth reserve classification. |

---

### 2.2 Shift Production Dispatch (`production_records`)
Captures actual extraction against planned schedule per shift.

| Column Name | Data Type | Units / Format | Description |
| :--- | :--- | :--- | :--- |
| `id` | String (PK) | `PRD_xxx` | Shift production record identifier. |
| `mine_id` | String (FK) | `MINE_xxx` | Concession identifier. |
| `shift_date` | Date | `YYYY-MM-DD` | Production date. |
| `shift_type` | String | Enum (`A`, `B`, `C`) | 8-hour operational shift indicator. |
| `planned_tonnes`| Float | Metric Tonnes | Shift extraction quota. |
| `actual_tonnes` | Float | Metric Tonnes | Actual scale-weighted ore haulage. |
| `shortfall_tonnes`| Float | Metric Tonnes | Difference ($\max(0, \text{planned} - \text{actual})$). |
| `stripping_ratio`| Float | Volume Ratio | Waste-to-ore ratio for the active bench. |
| `haulage_trips` | Integer | Count | Completed dumper round trips to primary crusher. |

---

### 2.3 Heavy Machinery Telematics (`equipment_status`)
Captures telematics logs from excavators, haul dumpers, and blast drill rigs.

| Column Name | Data Type | Units / Format | Description |
| :--- | :--- | :--- | :--- |
| `id` | String (PK) | `EQS_xxx` | Status log record ID. |
| `equipment_id` | String (FK) | `EXC_xxx` / `DMP_xxx` | Foreign key referencing equipment fleet unit. |
| `shift_date` | Date | `YYYY-MM-DD` | Operational log date. |
| `operating_hours`| Float | Hours ($0 - 8$) | Active run-time during shift. |
| `breakdown_hours`| Float | Hours ($0 - 8$) | Unscheduled mechanical or electrical downtime. |
| `idle_hours` | Float | Hours ($0 - 8$) | Waiting or standby idle time. |
| `fuel_consumed_l`| Float | Liters | Shift diesel consumption. |
| `failure_mode` | String | Text | Root cause if broken down (e.g., `Hydraulic Pump`, `Tire`). |

---

### 2.4 Meteorological Sensor Telemetry (`weather_observations`)
Monitors atmospheric and hydrological constraints on pit haulage and blasting.

| Column Name | Data Type | Units / Format | Description |
| :--- | :--- | :--- | :--- |
| `id` | String (PK) | `WTR_xxx` | Weather record ID. |
| `mine_id` | String (FK) | `MINE_xxx` | Concession identifier. |
| `observation_date`| Date | `YYYY-MM-DD` | Observation date. |
| `rainfall_mm` | Float | Millimeters | 24-hour cumulative precipitation. |
| `temp_celsius` | Float | Celsius (°C) | Pit ambient dry-bulb temperature. |
| `humidity_pct` | Float | Percent (%) | Relative atmospheric humidity. |
| `soil_moisture_pct`| Float | Percent (%) | Bench surface moisture sensor saturation. |
| `flood_alert_level`| String | Enum | `NONE`, `LOW`, `MODERATE`, `HIGH`, `CRITICAL`. |

---

### 2.5 Satellite Multi-Spectral Indices (`satellite_observations`)
Earth observation indicators derived from Sentinel-2 (MSI) and Landsat-9 (OLI-2 / TIRS-2).

| Index | Sensor | Spectral Bands | Contextual Function |
| :--- | :--- | :--- | :--- |
| **NDVI** | Sentinel-2 | $(B8 - B4) / (B8 + B4)$ | Vegetation density & canopy health in buffer perimeter. |
| **SAVI** | Sentinel-2 | $(1 + L)(B8 - B4) / (B8 + B4 + L)$ | Soil-adjusted vegetation index minimizing arid background bias. |
| **NDWI** | Sentinel-2 | $(B3 - B8) / (B3 + B8)$ | Pit floor and bench water ponding detection. |
| **MNDWI**| Sentinel-2 | $(B3 - B11) / (B3 + B11)$ | Modified open water index suppressing urban/tailings noise. |
| **LST** | Landsat-9 | TIRS-2 Band 10 Split Window | Surface radiometric kinetic temperature (Kelvin / °C). |
| **Clay Ratio**| Sentinel-2 | $B11 / B12$ | Surface weathering and clay alteration mineral halos. |
| **Iron Ratio**| Sentinel-2 | $B4 / B2$ | Ferric iron oxidation cap (gossan) discrimination. |

---

## 3. Data Pipeline: Cleaning, Deduplication & Quality Audit

The platform integrates an automated pipeline (`data_pipeline/`) enforcing empirical data standards:

1. **Format Validation:** Asserts presence and datatype of mandatory schema attributes.
2. **Physical Boundary Clipping:** Automatically caps sensor anomalies (e.g., negative rainfall, manganese assay $> 100\%$, operating hours $> 24\text{h}$).
3. **Temporal Alignment:** Resamples multi-source shift logs, weather feeds, and satellite passes into unified daily feature matrices.
4. **Empirical Quality Audit:** Inspects null counts, duplicate records, and out-of-bound samples without synthetic fabrication. Produces completeness reports accessible via `GET /api/quality`.
