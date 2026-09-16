# Synthetic Data Catalog & Generation Methodology

## Disclaimer & Purpose
All data documented in this catalog was synthesized programmatically to support end-to-end software engineering, spatial analytics, and AI/ML model execution for the **MOIL Mining Intelligence Platform**. No confidential mining data, proprietary mineral reserve ledgers, or non-public telemetry from MOIL Limited was utilized.

---

## 1. Concession & Zone Geographic Topology

The dataset simulates 8 distinct concessions reflecting the geological characteristics of the Central Indian Manganese Belt:

1. **Balaghat Concession (`MINE_BALAGHAT_01`)**:
   - Centroid: 21.8129°N, 80.1835°E | Area: 14.85 km²
   - 5 Zones: North Bench Pit A, Central Main Pit B, South Expansion Zone C, East Exploration Block D, West Overburden Dump E.
   - Geological Setting: Sausar Group Gondite and Mansar Mica Schist; high-grade pyrolusite and psilomelane ore body.

2. **Gumgaon Mine (`MINE_GUMGAON_02`)**:
   - Centroid: 21.3854°N, 78.9812°E | Area: 9.40 km²
   - 4 Zones: Deep Shaft Pit 1, Central Stope 2, South Incline 3, Prospecting Block 4.
   - Geological Setting: Deep underground shaft; braunite and quartzites.

3. **Tirodi Mine (`MINE_TIRODI_03`)**:
   - Centroid: 21.6836°N, 79.7247°E | Area: 8.20 km²
   - 5 Zones: Main Quarry Pit 1, West Open Bench 2, East Expansion 3, Prospecting Block 4, Overburden Ridge 5.
   - Geological Setting: Combined opencast quarrying and underground extraction; Tirodi Biotite Gneiss basement.

4. **Dongri Buzurg Mine (`MINE_DONGRI_04`)**:
   - Centroid: 21.5500°N, 79.6833°E | Area: 11.50 km²
   - 4 Zones: Main Quarry Pit 1, East Open Bench 2, Low-Grade Stockpile 3, Prospecting North 4.
   - Geological Setting: Large opencast with integrated heavy-media separation plant; supergene oxide enrichment.

5. **Kandri Mine (`MINE_KANDRI_05`)**:
   - Centroid: 21.4167°N, 79.2667°E | Area: 7.80 km²
   - 4 Zones: North Shaft Stope 1, East Bench 2, South Incline 3, Prospecting Block 4.

6. **Mansar Mine (`MINE_MANSAR_06`)**:
   - Centroid: 21.4000°N, 79.2833°E | Area: 6.90 km²
   - 4 Zones: Central Pit 1, West Bench 2, South Incline 3, Exploration Block 4.

7. **Chikla Mine (`MINE_CHIKLA_07`)**:
   - Centroid: 21.5667°N, 79.7667°E | Area: 8.60 km²
   - 5 Zones: Main Haulage Level 1, North Stope 2, South Bench 3, Prospecting Block 4, Waste Stockpile 5.

8. **Ukwa Mine (`MINE_UKWA_08`)**:
   - Centroid: 21.9667°N, 80.4667°E | Area: 10.30 km²
   - 5 Zones: Deep Seam Drift 1, Central Extraction 2, North Expansion 3, Exploration Trench 4, Overburden Mound 5.

---

## 2. Operational Scenarios in Production Data

The 2,290 production records cover 6 distinct operational scenarios reflecting real mining disruptions:

1. **Normal Optimal Operations (75% of days)**:
   - Planned vs. Actual: Dispatched ore within $\pm 5\%$ of planned capacity.
   - Blasting: Completed without delay (0.0h).
   - Weather: Dry or trace precipitation (< 5.0mm).

2. **Monsoon Rain Impact (8% of days)**:
   - Planned vs. Actual: Extraction reduced to 65%–82% of planned capacity.
   - Blasting: Postponed due to saturated blast holes (delay 1.5h – 3.5h).
   - Weather: Rainfall recorded between 35mm and 75mm.

3. **Equipment Breakdown Disruption (8% of days)**:
   - Planned vs. Actual: Extraction reduced to 55%–78% of capacity due to hydraulic failure or excavator downtime (downtime > 4.5h).
   - Dumper turnarounds reduced by 30%–45%.

4. **Blasting Delay / Misfire Hazard (5% of days)**:
   - Secondary shot-firing delayed by 2.0h – 4.0h due to safety clearance checks.
   - Run-of-mine ore feed halted temporarily during inspection.

5. **Pit Floor Inundation Crisis (2% of days)**:
   - Extreme storm surge (rainfall > 65mm, soil moisture > 70%).
   - Bench extraction suspended temporarily, triggering dewatering pump protocols.

6. **Overproduction Surge (2% of days)**:
   - Favorable fragmented muckpile conditions yielding 108%–125% of daily target.

---

## 3. Data Integrity & Controlled Quality Test Dataset

A dedicated test fixture dataset is maintained in `data/mock/quality_test_records.csv` to ensure data cleaning, bounds verification, and anomaly detection rules can be tested deterministically:
- Row 1: Grade anomaly (> 60% Mn) to test boundary clipping.
- Row 2: Negative downtime hours (< 0.0h) to test non-negative validity constraints.
- Row 3: Missing required coordinate to test null imputation.
- Row 4: Future timestamp to test freshness temporal bounds.
- Row 5: Extreme rainfall (> 300mm) to test meteorological outlier detection.
