# Synthetic Datasets Documentation: PS-26009 MOIL Mining Intelligence Platform

> [!IMPORTANT]
> **PROTOTYPE DATA DISCLAIMER**:
> All datasets located in `data/mock/` and `data/mock_baseline/` (`mines.csv`, `mining_zones.csv`, `geological_data.csv`, `production_data.csv`, `equipment_data.csv`, `weather_data.csv`, `satellite_data.csv`, `quality_test_records.csv`) are **100% synthetic prototype datasets** generated strictly for software engineering, architecture modeling, algorithmic verification, and hackathon evaluation for Problem Statement PS-26009.
> They are parameterized after realistic public domain geological and mining literature regarding Indian manganese belts (e.g., the Sausar Group, Mansar Formation, Gondite, and Chorbaoli Quartzite across Madhya Pradesh and Maharashtra) and do **NOT** represent confidential, proprietary, or actual operational telemetry of MOIL Limited.

---

## 1. Multi-Mine Data Architecture Overview

The platform supports a realistic relational multi-mine concession architecture spanning 8 major MOIL mining areas across Balaghat, Bhandara, and Nagpur districts:

| Mine ID | Mine Name | State | District | Area (sq km) | Annual Capacity | Concession Type |
|---|---|---|---|---|---|---|
| `MINE_BALAGHAT_01` | Balaghat Manganese Concession | Madhya Pradesh | Balaghat | 14.85 | 650,000 Tonnes/Yr | Underground / Deep Open Bench |
| `MINE_GUMGAON_02` | Gumgaon Manganese Mine | Maharashtra | Nagpur | 9.40 | 180,000 Tonnes/Yr | Underground Shaft |
| `MINE_TIRODI_03` | Tirodi Manganese Mine | Madhya Pradesh | Balaghat | 8.20 | 280,000 Tonnes/Yr | Opencast & Underground |
| `MINE_DONGRI_04` | Dongri Buzurg Mine | Maharashtra | Bhandara | 11.50 | 420,000 Tonnes/Yr | Opencast / Beneficiation Plant |
| `MINE_KANDRI_05` | Kandri Manganese Mine | Maharashtra | Nagpur | 7.80 | 210,000 Tonnes/Yr | Underground Shaft |
| `MINE_MANSAR_06` | Mansar Manganese Mine | Maharashtra | Nagpur | 6.90 | 190,000 Tonnes/Yr | Underground Incline |
| `MINE_CHIKLA_07` | Chikla Manganese Mine | Maharashtra | Bhandara | 8.60 | 230,000 Tonnes/Yr | Underground Main Haulage |
| `MINE_UKWA_08` | Ukwa Manganese Mine | Madhya Pradesh | Balaghat | 10.30 | 260,000 Tonnes/Yr | Underground Drift / Seam Incline |

---

## 2. Dataset Files & Schema Details

### 2.1. `mines.csv`
Master registry of 8 MOIL mining concessions.
- `id`: Primary key (e.g. `MINE_BALAGHAT_01`)
- `name`: Concession name
- `concession_code`: Statutory lease code (e.g. `MOIL-MP-BGT-001`)
- `state` / `district`: Geographic administrative region
- `latitude` / `longitude`: Centroid coordinates (WGS84)
- `area_sq_km`: Total lease perimeter area
- `mineral_type`: Ore classification (`Manganese Ore`)
- `annual_capacity`: Rated production capacity
- `type`: Operational extraction classification

### 2.2. `mining_zones.csv`
Master registry of 37 operational sectors across all 8 concessions (5 zones for Balaghat + 32 zones across 7 mines).
- `id`: Sector primary key (`ZONE_NORTH_A` to `ZONE_UKW_05`)
- `mine_id`: Foreign key referencing `mines.id`
- `name`: Operational sector name (e.g., `North Bench Pit A`, `Gumgaon Deep Shaft Pit 1`)
- `operational_status`: Current state (`ACTIVE_EXTRACTION`, `DEVELOPMENT_BENCH`, `GEOLOGICAL_PROSPECTING`, `WASTE_STABILIZATION`)
- `bench_level`: Elevation relative to datum (e.g., `-120m RL`, `Surface (+320m RL)`)
- `daily_target_tons`: Scheduled daily extraction quota in metric tonnes
- `potential`: Reserve potential classification (`HIGH`, `MEDIUM`, `LOW`)

### 2.3. `geological_data.csv` (1,204 records)
Subsurface borehole drilling intervals and geochemical assays.
- `borehole_id`: Unique borehole code (e.g. `BH-101`, `BH-GMG-201`)
- `mine_id`: Concession foreign key
- `zone_id`: Operational zone foreign key
- `latitude` / `longitude`: Drill collar geographic coordinates
- `depth_meters`: Intercept depth (15m – 140m)
- `mn_grade_pct`: Manganese grade assay percentage ($Mn$)
- `fe_grade_pct`: Iron grade assay percentage ($Fe$)
- `sio2_pct`: Silica grade assay percentage ($SiO_2$)
- `phosphorus_pct`: Phosphorus grade assay percentage ($P$)
- `rock_formation`: Lithological formation (`Sausar Group Gondite`, `Mansar Schist`, `Chorbaoli Quartzite`, `Tirodi Biotite Gneiss`)
- `subsurface_layer`: Stratigraphic horizon (`Primary Ore Body`, `Secondary Enriched`, `Weathered Horizon`, `Overburden`)
- `timestamp`: Sampling timestamp (ISO 8601 UTC)

### 2.4. `production_data.csv` (2,290 records)
Shift and daily ore production tracking across 6 realistic operational scenarios.
- `date`: Calendar date (`YYYY-MM-DD`)
- `mine_id` / `zone_id`: Spatial tracking foreign keys
- `shift`: Operational shift (`Shift-A`, `Shift-B`, `Shift-C`, `Daily_Aggregate`)
- `planned_tonnage`: Scheduled extraction target in metric tonnes
- `actual_tonnage`: Verified dispatched ore in metric tonnes
- `shortfall_tonnage`: Extraction shortfall ($\max(0, \text{planned} - \text{actual})$)
- `ore_grade_mined`: Run-of-mine manganese grade percentage
- `hauling_trips`: Dumper hauling cycle count
- `blasting_status`: Blasting outcome (`Completed`, `Postponed_Rain`, `Delayed_Misfire`, `Suspended_Pit_Inundation`)
- `blasting_delay_hours`: Downtime caused by delayed shot-firing (0.0h – 5.5h)
- `timestamp`: Log entry timestamp

### 2.5. `equipment_data.csv` (2,992 records)
Operational telematics across a 40-unit HEMM fleet (Excavators, Dumpers, Blast Drill Rigs, Jaw Crushers, Dozers, Water Bowsers).
- `equipment_id`: Unique machinery ID (`EXC_CAT_349_01` to `WTR_TRK_TATA_04`)
- `equipment_type`: Machinery category
- `mine_id` / `zone_id`: Concession and assigned sector
- `operational_hours`: Active engine hours per 24h cycle
- `downtime_hours`: Unscheduled breakdown duration
- `downtime_reason`: Root-cause failure log
- `efficiency_pct`: Overall Equipment Effectiveness (OEE)
- `health_status`: Telematics status (`OPTIMAL`, `WARNING`, `CRITICAL_MAINTENANCE`)
- `timestamp`: Telemetry transmission timestamp

### 2.6. `weather_data.csv` (1,297 records)
Meteorological sensor telemetry across all 8 mining concessions covering seasonal transitions and monsoon surge cycles.
- `mine_id`: Concession foreign key
- `date`: Calendar date
- `rainfall_mm`: Precipitation in millimeters (0.0mm – 95.0mm)
- `soil_moisture_pct`: Ground saturation index (15.0% – 85.0%)
- `ambient_temp_c`: Ambient surface temperature (18.0°C – 44.0°C)
- `humidity_pct`: Relative atmospheric humidity (25.0% – 98.0%)
- `wind_speed_kmh`: Surface wind velocity (8.0 km/h – 45.0 km/h)
- `flood_risk_index`: Hydrological risk rating (`LOW`, `MODERATE`, `HIGH`, `CRITICAL`)
- `timestamp`: Observation timestamp

### 2.7. `satellite_data.csv` (1,742 records)
Multispectral remote sensing telemetry (Sentinel-2 MSI surface indices).
- `satellite_source`: Constellation sensor (`Sentinel-2 MSI`)
- `mine_id` / `zone_id`: Geospatial references
- `ndvi`: Normalized Difference Vegetation Index (-0.10 to 0.55)
- `ndwi`: Normalized Difference Water Index (-0.35 to 0.40)
- `land_surface_temp_c`: Thermal radiometer surface temperature
- `soil_moisture_satellite_pct`: Satellite-derived topsoil saturation
- `cloud_coverage_pct`: Scene cloud cover percentage
- `data_quality_flag`: Atmospheric correction flag (`CLEAR`, `HAZE_CORRECTED`)
- `timestamp`: Satellite acquisition timestamp

---

## 3. Profiles & Reproducibility

The dataset generation engine (`scripts/data/generate_mock_data.py`) and database seeder (`scripts/seed.py`) support two reproducible execution profiles:

1. **Full Profile (`--profile full`, default)**:
   - 8 Concessions
   - 37 Operational Zones
   - 40 Fleet Units
   - 1,204 Geological borehole observations
   - 2,992 Equipment status telematics logs
   - 1,297 Weather observations
   - 1,742 Satellite observations
   - 2,290 Production records
   - 8 Model version & recommendation entries

2. **Small Profile (`--profile small`)**:
   - 2 Baseline Concessions (Balaghat & Gumgaon)
   - 5 Baseline Zones
   - 8 Baseline Equipment units
   - 60 Geological observations
   - 112 Equipment status logs
   - 30 Weather observations
   - 50 Satellite observations
   - 90 Production records

### Commands:
```bash
# Generate full synthetic CSVs in data/mock/
python scripts/data/generate_mock_data.py --profile full

# Cleanly seed SQLite database with full dataset
python scripts/seed.py --clean

# Switch back to small baseline dataset
python scripts/data/generate_mock_data.py --profile small
python scripts/seed.py --profile small --clean
```
