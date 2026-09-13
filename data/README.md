# Datasets Documentation: PS-26009 MOIL Mining Intelligence

> [!IMPORTANT]
> **Data Disclaimer**:
> All datasets located in this directory (`geological_data.csv`, `production_data.csv`, `equipment_data.csv`, `weather_data.csv`, `satellite_data.csv`) are **synthetic / mock prototype datasets** created strictly for development, architecture modeling, and hackathon demonstration purposes.
> They are modeled after realistic public domain parameters of Indian manganese formations (e.g., Sausar Group, Mansar Schist in the Balaghat/Gumgaon belt) and do **NOT** constitute confidential or proprietary operational records of MOIL Limited.

---

## Dataset Catalog

### 1. `geological_data.csv`
Sub-surface exploratory drilling and borehole survey records.
- `borehole_id`: Unique identifier (e.g. `BH-101`)
- `mine_id`: Concession identifier (e.g. `MINE_BALAGHAT_01`)
- `zone_id`: Operational sector (`ZONE_NORTH_A` to `ZONE_WEST_E`)
- `latitude` / `longitude`: Spatial coordinates (WGS84)
- `depth_meters`: Drilling depth in meters
- `mn_grade_pct`: Assay percentage of Manganese ($Mn$)
- `fe_grade_pct`: Assay percentage of Iron ($Fe$)
- `sio2_pct`: Assay percentage of Silica ($SiO_2$)
- `phosphorus_pct`: Assay percentage of Phosphorus ($P$)
- `rock_formation`: Host lithology (`Sausar Group Gondite`, `Mansar Schist`, `Chorbaoli Quartzite`, `Tirodi Biotite Gneiss`)
- `subsurface_layer`: Stratigraphic horizon (`Primary Ore Body`, `Weathered Horizon`, `Overburden`, `Secondary Enriched`)
- `timestamp`: Observation timestamp (ISO 8601)

### 2. `production_data.csv`
Shift-wise and daily ore extraction tracking.
- `date`: Calendar date (`YYYY-MM-DD`)
- `mine_id` / `zone_id`: Location tracking
- `shift`: Shift identifier (`Shift-A`, `Shift-B`, `Shift-C`)
- `planned_tonnage`: Scheduled extraction target in metric tonnes
- `actual_tonnage`: Dispatched ore metric tonnes
- `shortfall_tonnage`: $\max(0, \text{planned} - \text{actual})$
- `ore_grade_mined`: Run-of-mine $Mn$ percentage
- `hauling_trips`: Dumper cycle count
- `blasting_status`: Execution state (`Completed`, `Delayed`, `Suspended`)
- `blasting_delay_hours`: Downtime caused by delayed blasting windows
- `timestamp`: Record creation timestamp

### 3. `equipment_data.csv`
Heavy Earth Moving Machinery (HEMM) telematics and operational state.
- `equipment_id`: Asset code (e.g. `EXC_CAT_349_01`, `DMP_VOLVO_FMX_11`)
- `equipment_type`: Machine category (Hydraulic Excavator, Haul Dumper, Blast Drill Rig, Jaw Crusher)
- `operational_hours`: Active run time within 24h cycle
- `downtime_hours`: Idle or breakdown duration
- `downtime_reason`: Primary failure root cause
- `efficiency_pct`: Machine overall equipment effectiveness (OEE) percentage
- `health_status`: State classification (`OPTIMAL`, `WARNING`, `CRITICAL_MAINTENANCE`)

### 4. `weather_data.csv`
Meteorological parameters impacting open-pit and incline operations.
- `rainfall_mm`: Precipitation in millimeters
- `soil_moisture_pct`: Ground saturation percentage
- `ambient_temp_c`: Surface temperature in Celsius
- `humidity_pct`: Relative atmospheric humidity
- `wind_speed_kmh`: Surface wind velocity
- `flood_risk_index`: Risk rating (`LOW`, `MODERATE`, `SEVERE`)

### 5. `satellite_data.csv`
Space-borne remote sensing indicators from simulated Sentinel-2 MSI and Landsat-9 passes.
- `satellite_source`: Sensor mission
- `ndvi`: Normalized Difference Vegetation Index (stripping indicator)
- `ndwi`: Normalized Difference Water Index (pit sump water accumulation)
- `land_surface_temp_c`: Thermal radiometric surface temperature
- `soil_moisture_satellite_pct`: Topsoil radar backscatter / microwave soil moisture
- `cloud_coverage_pct`: Optical scene cloud interference
- `data_quality_flag`: Quality validation (`CLEAR`, `HAZY`, `INTERPOLATED`)

---

## Join Key Consistency
All records across all 5 datasets share identical primary keys:
- `mine_id`
- `zone_id`
- `timestamp` (temporal join window)
