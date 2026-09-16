"""
Synthetic Mock Data Generator for MOIL Mining Intelligence Platform.
Generates realistic, relational, multi-mine synthetic datasets for:
- 8 MOIL manganese concessions across Madhya Pradesh and Maharashtra
- 37 mining zones with varied geological potential (HIGH, MEDIUM, LOW)
- ~1,450 geological borehole assay records (~180 boreholes)
- 40 equipment fleet units & ~3,600 equipment operational status logs
- ~1,440 daily weather observations with seasonal monsoon dynamics
- ~1,500 satellite telemetry records (NDVI, NDWI, LST, soil moisture)
- ~2,400 daily production records across 6 distinct operational scenarios

DISCLAIMER:
This dataset is purely synthetic prototype data created for development, testing,
and demonstration purposes. It does NOT represent confidential MOIL operational data.
"""
import os
import csv
import random
import argparse
from datetime import datetime, timedelta
import numpy as np

# Deterministic seed for reproducible runs
SEED = 42
random.seed(SEED)
np.random.seed(SEED)

SYNTHETIC_MINES = [
    {
        "id": "MINE_BALAGHAT_01",
        "name": "Balaghat Manganese Concession",
        "concession_code": "MOIL-MP-BGT-001",
        "state": "Madhya Pradesh",
        "district": "Balaghat",
        "latitude": 21.8129,
        "longitude": 80.1835,
        "area_sq_km": 14.85,
        "mineral_type": "Manganese Ore",
        "annual_capacity": "650,000 Tonnes/Yr",
        "type": "Underground / Deep Bench"
    },
    {
        "id": "MINE_GUMGAON_02",
        "name": "Gumgaon Manganese Mine",
        "concession_code": "MOIL-MH-GMG-002",
        "state": "Maharashtra",
        "district": "Nagpur",
        "latitude": 21.3854,
        "longitude": 78.9812,
        "area_sq_km": 9.40,
        "mineral_type": "Manganese Ore",
        "annual_capacity": "180,000 Tonnes/Yr",
        "type": "Underground"
    },
    {
        "id": "MINE_TIRODI_03",
        "name": "Tirodi Manganese Mine",
        "concession_code": "MOIL-MP-TRD-003",
        "state": "Madhya Pradesh",
        "district": "Balaghat",
        "latitude": 21.6836,
        "longitude": 79.7247,
        "area_sq_km": 8.20,
        "mineral_type": "Manganese Ore",
        "annual_capacity": "280,000 Tonnes/Yr",
        "type": "Opencast & Underground"
    },
    {
        "id": "MINE_DONGRI_04",
        "name": "Dongri Buzurg Mine",
        "concession_code": "MOIL-MH-DGB-004",
        "state": "Maharashtra",
        "district": "Bhandara",
        "latitude": 21.5500,
        "longitude": 79.6833,
        "area_sq_km": 11.50,
        "mineral_type": "Manganese Ore",
        "annual_capacity": "420,000 Tonnes/Yr",
        "type": "Opencast / Beneficiation"
    },
    {
        "id": "MINE_KANDRI_05",
        "name": "Kandri Manganese Mine",
        "concession_code": "MOIL-MH-KND-005",
        "state": "Maharashtra",
        "district": "Nagpur",
        "latitude": 21.4167,
        "longitude": 79.2667,
        "area_sq_km": 7.80,
        "mineral_type": "Manganese Ore",
        "annual_capacity": "210,000 Tonnes/Yr",
        "type": "Underground"
    },
    {
        "id": "MINE_MANSAR_06",
        "name": "Mansar Manganese Mine",
        "concession_code": "MOIL-MH-MSR-006",
        "state": "Maharashtra",
        "district": "Nagpur",
        "latitude": 21.4000,
        "longitude": 79.2833,
        "area_sq_km": 6.90,
        "mineral_type": "Manganese Ore",
        "annual_capacity": "190,000 Tonnes/Yr",
        "type": "Underground"
    },
    {
        "id": "MINE_CHIKLA_07",
        "name": "Chikla Manganese Mine",
        "concession_code": "MOIL-MH-CHK-007",
        "state": "Maharashtra",
        "district": "Bhandara",
        "latitude": 21.5667,
        "longitude": 79.7667,
        "area_sq_km": 8.60,
        "mineral_type": "Manganese Ore",
        "annual_capacity": "230,000 Tonnes/Yr",
        "type": "Underground"
    },
    {
        "id": "MINE_UKWA_08",
        "name": "Ukwa Manganese Mine",
        "concession_code": "MOIL-MP-UKW-008",
        "state": "Madhya Pradesh",
        "district": "Balaghat",
        "latitude": 21.9667,
        "longitude": 80.4667,
        "area_sq_km": 10.30,
        "mineral_type": "Manganese Ore",
        "annual_capacity": "260,000 Tonnes/Yr",
        "type": "Underground"
    },
    {
        "id": "MINE_SITAPATORE_09",
        "name": "Sitapatore Manganese Mine",
        "concession_code": "MOIL-MP-STP-009",
        "state": "Madhya Pradesh",
        "district": "Balaghat",
        "latitude": 21.7000,
        "longitude": 79.6667,
        "area_sq_km": 6.40,
        "mineral_type": "Manganese Ore",
        "annual_capacity": "120,000 Tonnes/Yr",
        "type": "Underground"
    },
    {
        "id": "MINE_BELDONGRI_10",
        "name": "Beldongri Manganese Mine",
        "concession_code": "MOIL-MH-BLD-010",
        "state": "Maharashtra",
        "district": "Nagpur",
        "latitude": 21.3833,
        "longitude": 79.1500,
        "area_sq_km": 5.80,
        "mineral_type": "Manganese Ore",
        "annual_capacity": "110,000 Tonnes/Yr",
        "type": "Underground / Open Cast"
    }
]

SYNTHETIC_ZONES = [
    # 1. Balaghat (Existing 5 zones preserved exactly)
    {"id": "ZONE_NORTH_A", "mine_id": "MINE_BALAGHAT_01", "name": "North Bench Pit A", "operational_status": "ACTIVE_EXTRACTION", "bench_level": "-120m RL", "daily_target_tons": 450, "potential": "HIGH", "lat_offset": 0.005, "lng_offset": 0.004},
    {"id": "ZONE_CENTRAL_B", "mine_id": "MINE_BALAGHAT_01", "name": "Central Main Pit B", "operational_status": "HIGH_EXTRACTION", "bench_level": "-160m RL", "daily_target_tons": 520, "potential": "HIGH", "lat_offset": 0.000, "lng_offset": 0.000},
    {"id": "ZONE_SOUTH_C", "mine_id": "MINE_BALAGHAT_01", "name": "South Expansion Zone C", "operational_status": "DEVELOPMENT_BENCH", "bench_level": "-60m RL", "daily_target_tons": 250, "potential": "MEDIUM", "lat_offset": -0.006, "lng_offset": -0.003},
    {"id": "ZONE_EAST_D", "mine_id": "MINE_BALAGHAT_01", "name": "East Exploration Block D", "operational_status": "GEOLOGICAL_PROSPECTING", "bench_level": "Surface (+320m RL)", "daily_target_tons": 0, "potential": "MEDIUM", "lat_offset": 0.002, "lng_offset": 0.008},
    {"id": "ZONE_WEST_E", "mine_id": "MINE_BALAGHAT_01", "name": "West Overburden Dump E", "operational_status": "WASTE_STABILIZATION", "bench_level": "Surface (+340m RL)", "daily_target_tons": 0, "potential": "LOW", "lat_offset": -0.001, "lng_offset": -0.009},

    # 2. Gumgaon (4 zones)
    {"id": "ZONE_GMG_01", "mine_id": "MINE_GUMGAON_02", "name": "Gumgaon Deep Shaft Pit 1", "operational_status": "ACTIVE_EXTRACTION", "bench_level": "-140m RL", "daily_target_tons": 220, "potential": "HIGH", "lat_offset": 0.004, "lng_offset": 0.003},
    {"id": "ZONE_GMG_02", "mine_id": "MINE_GUMGAON_02", "name": "Gumgaon Central Stope 2", "operational_status": "ACTIVE_EXTRACTION", "bench_level": "-180m RL", "daily_target_tons": 260, "potential": "HIGH", "lat_offset": -0.001, "lng_offset": 0.001},
    {"id": "ZONE_GMG_03", "mine_id": "MINE_GUMGAON_02", "name": "Gumgaon South Incline 3", "operational_status": "DEVELOPMENT_BENCH", "bench_level": "-100m RL", "daily_target_tons": 180, "potential": "MEDIUM", "lat_offset": -0.005, "lng_offset": -0.004},
    {"id": "ZONE_GMG_04", "mine_id": "MINE_GUMGAON_02", "name": "Gumgaon Prospecting Block 4", "operational_status": "GEOLOGICAL_PROSPECTING", "bench_level": "Surface (+290m RL)", "daily_target_tons": 0, "potential": "LOW", "lat_offset": 0.003, "lng_offset": -0.006},

    # 3. Tirodi (5 zones)
    {"id": "ZONE_TRD_01", "mine_id": "MINE_TIRODI_03", "name": "Tirodi Main Quarry Pit 1", "operational_status": "ACTIVE_EXTRACTION", "bench_level": "-80m RL", "daily_target_tons": 340, "potential": "HIGH", "lat_offset": 0.004, "lng_offset": 0.002},
    {"id": "ZONE_TRD_02", "mine_id": "MINE_TIRODI_03", "name": "Tirodi West Open Bench 2", "operational_status": "ACTIVE_EXTRACTION", "bench_level": "-110m RL", "daily_target_tons": 380, "potential": "HIGH", "lat_offset": -0.002, "lng_offset": -0.004},
    {"id": "ZONE_TRD_03", "mine_id": "MINE_TIRODI_03", "name": "Tirodi East Expansion 3", "operational_status": "DEVELOPMENT_BENCH", "bench_level": "-50m RL", "daily_target_tons": 200, "potential": "MEDIUM", "lat_offset": 0.001, "lng_offset": 0.006},
    {"id": "ZONE_TRD_04", "mine_id": "MINE_TIRODI_03", "name": "Tirodi Prospecting Block 4", "operational_status": "GEOLOGICAL_PROSPECTING", "bench_level": "Surface (+310m RL)", "daily_target_tons": 0, "potential": "LOW", "lat_offset": -0.006, "lng_offset": 0.001},
    {"id": "ZONE_TRD_05", "mine_id": "MINE_TIRODI_03", "name": "Tirodi Overburden Ridge 5", "operational_status": "WASTE_STABILIZATION", "bench_level": "Surface (+330m RL)", "daily_target_tons": 0, "potential": "LOW", "lat_offset": 0.005, "lng_offset": -0.007},

    # 4. Dongri Buzurg (5 zones)
    {"id": "ZONE_DGB_01", "mine_id": "MINE_DONGRI_04", "name": "Dongri Alpha Pit (Beneficiation)", "operational_status": "ACTIVE_EXTRACTION", "bench_level": "-90m RL", "daily_target_tons": 480, "potential": "HIGH", "lat_offset": 0.003, "lng_offset": 0.004},
    {"id": "ZONE_DGB_02", "mine_id": "MINE_DONGRI_04", "name": "Dongri Beta Open Bench 2", "operational_status": "ACTIVE_EXTRACTION", "bench_level": "-130m RL", "daily_target_tons": 510, "potential": "HIGH", "lat_offset": -0.002, "lng_offset": 0.001},
    {"id": "ZONE_DGB_03", "mine_id": "MINE_DONGRI_04", "name": "Dongri South Pit Gamma 3", "operational_status": "DEVELOPMENT_BENCH", "bench_level": "-60m RL", "daily_target_tons": 240, "potential": "MEDIUM", "lat_offset": -0.005, "lng_offset": -0.003},
    {"id": "ZONE_DGB_04", "mine_id": "MINE_DONGRI_04", "name": "Dongri Tailings Recovery 4", "operational_status": "BENEFICIATION_PLANT", "bench_level": "Surface (+280m RL)", "daily_target_tons": 60, "potential": "LOW", "lat_offset": 0.006, "lng_offset": -0.004},
    {"id": "ZONE_DGB_05", "mine_id": "MINE_DONGRI_04", "name": "Dongri North Exploration 5", "operational_status": "GEOLOGICAL_PROSPECTING", "bench_level": "Surface (+300m RL)", "daily_target_tons": 0, "potential": "LOW", "lat_offset": 0.007, "lng_offset": 0.002},

    # 5. Kandri (4 zones)
    {"id": "ZONE_KND_01", "mine_id": "MINE_KANDRI_05", "name": "Kandri Main Stope 1", "operational_status": "ACTIVE_EXTRACTION", "bench_level": "-150m RL", "daily_target_tons": 290, "potential": "HIGH", "lat_offset": 0.003, "lng_offset": 0.002},
    {"id": "ZONE_KND_02", "mine_id": "MINE_KANDRI_05", "name": "Kandri East Bench 2", "operational_status": "ACTIVE_EXTRACTION", "bench_level": "-110m RL", "daily_target_tons": 240, "potential": "HIGH", "lat_offset": -0.002, "lng_offset": 0.005},
    {"id": "ZONE_KND_03", "mine_id": "MINE_KANDRI_05", "name": "Kandri South Drift 3", "operational_status": "DEVELOPMENT_BENCH", "bench_level": "-70m RL", "daily_target_tons": 150, "potential": "MEDIUM", "lat_offset": -0.004, "lng_offset": -0.003},
    {"id": "ZONE_KND_04", "mine_id": "MINE_KANDRI_05", "name": "Kandri Overburden Dump 4", "operational_status": "WASTE_STABILIZATION", "bench_level": "Surface (+305m RL)", "daily_target_tons": 0, "potential": "LOW", "lat_offset": 0.005, "lng_offset": -0.005},

    # 6. Mansar (4 zones)
    {"id": "ZONE_MSR_01", "mine_id": "MINE_MANSAR_06", "name": "Mansar Central Pit 1", "operational_status": "ACTIVE_EXTRACTION", "bench_level": "-125m RL", "daily_target_tons": 280, "potential": "HIGH", "lat_offset": 0.002, "lng_offset": 0.003},
    {"id": "ZONE_MSR_02", "mine_id": "MINE_MANSAR_06", "name": "Mansar West Bench 2", "operational_status": "ACTIVE_EXTRACTION", "bench_level": "-95m RL", "daily_target_tons": 230, "potential": "MEDIUM", "lat_offset": -0.003, "lng_offset": -0.004},
    {"id": "ZONE_MSR_03", "mine_id": "MINE_MANSAR_06", "name": "Mansar South Incline 3", "operational_status": "DEVELOPMENT_BENCH", "bench_level": "-65m RL", "daily_target_tons": 160, "potential": "MEDIUM", "lat_offset": -0.005, "lng_offset": 0.002},
    {"id": "ZONE_MSR_04", "mine_id": "MINE_MANSAR_06", "name": "Mansar Exploration Block 4", "operational_status": "GEOLOGICAL_PROSPECTING", "bench_level": "Surface (+315m RL)", "daily_target_tons": 0, "potential": "LOW", "lat_offset": 0.004, "lng_offset": -0.006},

    # 7. Chikla (5 zones)
    {"id": "ZONE_CHK_01", "mine_id": "MINE_CHIKLA_07", "name": "Chikla Main Haulage Level 1", "operational_status": "ACTIVE_EXTRACTION", "bench_level": "-140m RL", "daily_target_tons": 310, "potential": "HIGH", "lat_offset": 0.003, "lng_offset": 0.002},
    {"id": "ZONE_CHK_02", "mine_id": "MINE_CHIKLA_07", "name": "Chikla North Stope 2", "operational_status": "ACTIVE_EXTRACTION", "bench_level": "-105m RL", "daily_target_tons": 270, "potential": "HIGH", "lat_offset": 0.005, "lng_offset": -0.003},
    {"id": "ZONE_CHK_03", "mine_id": "MINE_CHIKLA_07", "name": "Chikla South Bench 3", "operational_status": "DEVELOPMENT_BENCH", "bench_level": "-75m RL", "daily_target_tons": 170, "potential": "MEDIUM", "lat_offset": -0.004, "lng_offset": 0.003},
    {"id": "ZONE_CHK_04", "mine_id": "MINE_CHIKLA_07", "name": "Chikla Prospecting Block 4", "operational_status": "GEOLOGICAL_PROSPECTING", "bench_level": "Surface (+310m RL)", "daily_target_tons": 0, "potential": "LOW", "lat_offset": -0.006, "lng_offset": -0.004},
    {"id": "ZONE_CHK_05", "mine_id": "MINE_CHIKLA_07", "name": "Chikla Waste Stockpile 5", "operational_status": "WASTE_STABILIZATION", "bench_level": "Surface (+325m RL)", "daily_target_tons": 0, "potential": "LOW", "lat_offset": 0.006, "lng_offset": 0.005},

    # 8. Ukwa (5 zones)
    {"id": "ZONE_UKW_01", "mine_id": "MINE_UKWA_08", "name": "Ukwa Deep Seam Drift 1", "operational_status": "ACTIVE_EXTRACTION", "bench_level": "-165m RL", "daily_target_tons": 330, "potential": "HIGH", "lat_offset": 0.003, "lng_offset": 0.004},
    {"id": "ZONE_UKW_02", "mine_id": "MINE_UKWA_08", "name": "Ukwa Central Extraction 2", "operational_status": "ACTIVE_EXTRACTION", "bench_level": "-120m RL", "daily_target_tons": 290, "potential": "HIGH", "lat_offset": -0.002, "lng_offset": 0.001},
    {"id": "ZONE_UKW_03", "mine_id": "MINE_UKWA_08", "name": "Ukwa North Expansion 3", "operational_status": "DEVELOPMENT_BENCH", "bench_level": "-80m RL", "daily_target_tons": 190, "potential": "MEDIUM", "lat_offset": 0.005, "lng_offset": -0.003},
    {"id": "ZONE_UKW_04", "mine_id": "MINE_UKWA_08", "name": "Ukwa Exploration Trench 4", "operational_status": "GEOLOGICAL_PROSPECTING", "bench_level": "Surface (+340m RL)", "daily_target_tons": 0, "potential": "LOW", "lat_offset": -0.006, "lng_offset": 0.004},
    {"id": "ZONE_UKW_05", "mine_id": "MINE_UKWA_08", "name": "Ukwa Overburden Mound 5", "operational_status": "WASTE_STABILIZATION", "bench_level": "Surface (+360m RL)", "daily_target_tons": 0, "potential": "LOW", "lat_offset": 0.004, "lng_offset": -0.006},

    # 9. Sitapatore (4 zones)
    {"id": "ZONE_STP_01", "mine_id": "MINE_SITAPATORE_09", "name": "Sitapatore Deep Stope 1", "operational_status": "ACTIVE_EXTRACTION", "bench_level": "-130m RL", "daily_target_tons": 210, "potential": "HIGH", "lat_offset": 0.003, "lng_offset": 0.003},
    {"id": "ZONE_STP_02", "mine_id": "MINE_SITAPATORE_09", "name": "Sitapatore North Bench 2", "operational_status": "ACTIVE_EXTRACTION", "bench_level": "-90m RL", "daily_target_tons": 180, "potential": "HIGH", "lat_offset": 0.005, "lng_offset": -0.002},
    {"id": "ZONE_STP_03", "mine_id": "MINE_SITAPATORE_09", "name": "Sitapatore South Incline 3", "operational_status": "DEVELOPMENT_BENCH", "bench_level": "-60m RL", "daily_target_tons": 140, "potential": "MEDIUM", "lat_offset": -0.004, "lng_offset": 0.002},
    {"id": "ZONE_STP_04", "mine_id": "MINE_SITAPATORE_09", "name": "Sitapatore Exploration Trench 4", "operational_status": "GEOLOGICAL_PROSPECTING", "bench_level": "Surface (+305m RL)", "daily_target_tons": 0, "potential": "LOW", "lat_offset": -0.006, "lng_offset": -0.004},

    # 10. Beldongri (4 zones)
    {"id": "ZONE_BLD_01", "mine_id": "MINE_BELDONGRI_10", "name": "Beldongri Main Quarry Pit 1", "operational_status": "ACTIVE_EXTRACTION", "bench_level": "-70m RL", "daily_target_tons": 160, "potential": "HIGH", "lat_offset": 0.002, "lng_offset": 0.003},
    {"id": "ZONE_BLD_02", "mine_id": "MINE_BELDONGRI_10", "name": "Beldongri East Bench 2", "operational_status": "ACTIVE_EXTRACTION", "bench_level": "-95m RL", "daily_target_tons": 140, "potential": "MEDIUM", "lat_offset": -0.003, "lng_offset": 0.004},
    {"id": "ZONE_BLD_03", "mine_id": "MINE_BELDONGRI_10", "name": "Beldongri West Development 3", "operational_status": "DEVELOPMENT_BENCH", "bench_level": "-40m RL", "daily_target_tons": 100, "potential": "MEDIUM", "lat_offset": -0.004, "lng_offset": -0.003},
    {"id": "ZONE_BLD_04", "mine_id": "MINE_BELDONGRI_10", "name": "Beldongri Overburden Mound 4", "operational_status": "WASTE_STABILIZATION", "bench_level": "Surface (+295m RL)", "daily_target_tons": 0, "potential": "LOW", "lat_offset": 0.005, "lng_offset": -0.005}
]

SYNTHETIC_EQUIPMENT = [
    # Balaghat (8 units preserved exactly)
    {"id": "EXC_CAT_349_01", "mine_id": "MINE_BALAGHAT_01", "equipment_type": "Hydraulic Excavator", "model": "CAT 349D2 L", "year": 2021, "zone": "ZONE_CENTRAL_B"},
    {"id": "EXC_KOM_PC450_02", "mine_id": "MINE_BALAGHAT_01", "equipment_type": "Hydraulic Excavator", "model": "Komatsu PC450-8", "year": 2022, "zone": "ZONE_NORTH_A"},
    {"id": "DMP_VOLVO_FMX_11", "mine_id": "MINE_BALAGHAT_01", "equipment_type": "Haul Dumper", "model": "Volvo FMX 460 8x4", "year": 2023, "zone": "ZONE_CENTRAL_B"},
    {"id": "DMP_VOLVO_FMX_12", "mine_id": "MINE_BALAGHAT_01", "equipment_type": "Haul Dumper", "model": "Volvo FMX 460 8x4", "year": 2023, "zone": "ZONE_NORTH_A"},
    {"id": "DMP_VOLVO_FMX_13", "mine_id": "MINE_BALAGHAT_01", "equipment_type": "Haul Dumper", "model": "Volvo FMX 440 8x4", "year": 2022, "zone": "ZONE_SOUTH_C"},
    {"id": "DRL_ATLAS_ROC_01", "mine_id": "MINE_BALAGHAT_01", "equipment_type": "Blast Drill Rig", "model": "Atlas Copco ROC L8", "year": 2020, "zone": "ZONE_NORTH_A"},
    {"id": "CRU_TELSMITH_01", "mine_id": "MINE_BALAGHAT_01", "equipment_type": "Primary Jaw Crusher", "model": "Telsmith 3648", "year": 2019, "zone": "ZONE_CENTRAL_B"},
    {"id": "WTR_TRK_TATA_01", "mine_id": "MINE_BALAGHAT_01", "equipment_type": "Dust Suppression Bowser", "model": "Tata Prima 2828", "year": 2022, "zone": "ZONE_CENTRAL_B"},

    # Gumgaon (4 units)
    {"id": "EXC_HIT_ZX470_01", "mine_id": "MINE_GUMGAON_02", "equipment_type": "Hydraulic Excavator", "model": "Hitachi ZX470H", "year": 2022, "zone": "ZONE_GMG_01"},
    {"id": "DMP_CAT_773E_01", "mine_id": "MINE_GUMGAON_02", "equipment_type": "Haul Dumper", "model": "CAT 773E Off-Highway", "year": 2023, "zone": "ZONE_GMG_01"},
    {"id": "DMP_CAT_773E_02", "mine_id": "MINE_GUMGAON_02", "equipment_type": "Haul Dumper", "model": "CAT 773E Off-Highway", "year": 2023, "zone": "ZONE_GMG_02"},
    {"id": "DRL_SND_DX800_01", "mine_id": "MINE_GUMGAON_02", "equipment_type": "Blast Drill Rig", "model": "Sandvik Ranger DX800", "year": 2021, "zone": "ZONE_GMG_02"},

    # Tirodi (5 units)
    {"id": "EXC_CAT_349_02", "mine_id": "MINE_TIRODI_03", "equipment_type": "Hydraulic Excavator", "model": "CAT 349D2 L", "year": 2022, "zone": "ZONE_TRD_01"},
    {"id": "EXC_KOM_PC300_01", "mine_id": "MINE_TIRODI_03", "equipment_type": "Hydraulic Excavator", "model": "Komatsu PC300-8", "year": 2021, "zone": "ZONE_TRD_02"},
    {"id": "DMP_BEML_BH35_01", "mine_id": "MINE_TIRODI_03", "equipment_type": "Haul Dumper", "model": "BEML BH35-2", "year": 2022, "zone": "ZONE_TRD_01"},
    {"id": "DMP_BEML_BH35_02", "mine_id": "MINE_TIRODI_03", "equipment_type": "Haul Dumper", "model": "BEML BH35-2", "year": 2023, "zone": "ZONE_TRD_02"},
    {"id": "DOZ_CAT_D8R_01", "mine_id": "MINE_TIRODI_03", "equipment_type": "Track-Type Dozer", "model": "CAT D8R HD", "year": 2020, "zone": "ZONE_TRD_05"},

    # Dongri Buzurg (5 units)
    {"id": "EXC_HIT_EX1200_01", "mine_id": "MINE_DONGRI_04", "equipment_type": "Hydraulic Mining Shovel", "model": "Hitachi EX1200-7", "year": 2023, "zone": "ZONE_DGB_01"},
    {"id": "DMP_VOLVO_FMX_21", "mine_id": "MINE_DONGRI_04", "equipment_type": "Haul Dumper", "model": "Volvo FMX 460 8x4", "year": 2023, "zone": "ZONE_DGB_01"},
    {"id": "DMP_VOLVO_FMX_22", "mine_id": "MINE_DONGRI_04", "equipment_type": "Haul Dumper", "model": "Volvo FMX 460 8x4", "year": 2022, "zone": "ZONE_DGB_02"},
    {"id": "CRU_METSO_C120_01", "mine_id": "MINE_DONGRI_04", "equipment_type": "Primary Jaw Crusher", "model": "Metso Nordberg C120", "year": 2020, "zone": "ZONE_DGB_01"},
    {"id": "WTR_TRK_TATA_02", "mine_id": "MINE_DONGRI_04", "equipment_type": "Dust Suppression Bowser", "model": "Tata Prima 2828", "year": 2021, "zone": "ZONE_DGB_02"},

    # Kandri (4 units)
    {"id": "EXC_KOM_PC450_03", "mine_id": "MINE_KANDRI_05", "equipment_type": "Hydraulic Excavator", "model": "Komatsu PC450-8", "year": 2022, "zone": "ZONE_KND_01"},
    {"id": "DMP_VOLVO_FMX_31", "mine_id": "MINE_KANDRI_05", "equipment_type": "Haul Dumper", "model": "Volvo FMX 460 8x4", "year": 2023, "zone": "ZONE_KND_01"},
    {"id": "DMP_VOLVO_FMX_32", "mine_id": "MINE_KANDRI_05", "equipment_type": "Haul Dumper", "model": "Volvo FMX 440 8x4", "year": 2021, "zone": "ZONE_KND_02"},
    {"id": "DRL_ATLAS_ROC_02", "mine_id": "MINE_KANDRI_05", "equipment_type": "Blast Drill Rig", "model": "Atlas Copco ROC L8", "year": 2020, "zone": "ZONE_KND_01"},

    # Mansar (4 units)
    {"id": "EXC_CAT_349_03", "mine_id": "MINE_MANSAR_06", "equipment_type": "Hydraulic Excavator", "model": "CAT 349D2 L", "year": 2022, "zone": "ZONE_MSR_01"},
    {"id": "DMP_BEML_BH35_03", "mine_id": "MINE_MANSAR_06", "equipment_type": "Haul Dumper", "model": "BEML BH35-2", "year": 2022, "zone": "ZONE_MSR_01"},
    {"id": "DMP_BEML_BH35_04", "mine_id": "MINE_MANSAR_06", "equipment_type": "Haul Dumper", "model": "BEML BH35-2", "year": 2023, "zone": "ZONE_MSR_02"},
    {"id": "WTR_TRK_TATA_03", "mine_id": "MINE_MANSAR_06", "equipment_type": "Dust Suppression Bowser", "model": "Tata Prima 2828", "year": 2022, "zone": "ZONE_MSR_01"},

    # Chikla (5 units)
    {"id": "EXC_HIT_ZX470_02", "mine_id": "MINE_CHIKLA_07", "equipment_type": "Hydraulic Excavator", "model": "Hitachi ZX470H", "year": 2023, "zone": "ZONE_CHK_01"},
    {"id": "DMP_VOLVO_FMX_41", "mine_id": "MINE_CHIKLA_07", "equipment_type": "Haul Dumper", "model": "Volvo FMX 460 8x4", "year": 2023, "zone": "ZONE_CHK_01"},
    {"id": "DMP_VOLVO_FMX_42", "mine_id": "MINE_CHIKLA_07", "equipment_type": "Haul Dumper", "model": "Volvo FMX 460 8x4", "year": 2022, "zone": "ZONE_CHK_02"},
    {"id": "DRL_SND_DX800_02", "mine_id": "MINE_CHIKLA_07", "equipment_type": "Blast Drill Rig", "model": "Sandvik Ranger DX800", "year": 2021, "zone": "ZONE_CHK_01"},
    {"id": "DOZ_KOM_D155_01", "mine_id": "MINE_CHIKLA_07", "equipment_type": "Track-Type Dozer", "model": "Komatsu D155A", "year": 2020, "zone": "ZONE_CHK_05"},

    # Ukwa (5 units)
    {"id": "EXC_KOM_PC450_04", "mine_id": "MINE_UKWA_08", "equipment_type": "Hydraulic Excavator", "model": "Komatsu PC450-8", "year": 2022, "zone": "ZONE_UKW_01"},
    {"id": "DMP_CAT_773E_03", "mine_id": "MINE_UKWA_08", "equipment_type": "Haul Dumper", "model": "CAT 773E Off-Highway", "year": 2023, "zone": "ZONE_UKW_01"},
    {"id": "DMP_CAT_773E_04", "mine_id": "MINE_UKWA_08", "equipment_type": "Haul Dumper", "model": "CAT 773E Off-Highway", "year": 2023, "zone": "ZONE_UKW_02"},
    {"id": "DRL_ATLAS_ROC_03", "mine_id": "MINE_UKWA_08", "equipment_type": "Blast Drill Rig", "model": "Atlas Copco ROC L8", "year": 2021, "zone": "ZONE_UKW_01"},
    {"id": "WTR_TRK_TATA_04", "mine_id": "MINE_UKWA_08", "equipment_type": "Dust Suppression Bowser", "model": "Tata Prima 2828", "year": 2022, "zone": "ZONE_UKW_02"},

    # Sitapatore (4 units)
    {"id": "EXC_KOM_PC300_02", "mine_id": "MINE_SITAPATORE_09", "equipment_type": "Hydraulic Excavator", "model": "Komatsu PC300-8", "year": 2022, "zone": "ZONE_STP_01"},
    {"id": "DMP_VOLVO_FMX_51", "mine_id": "MINE_SITAPATORE_09", "equipment_type": "Haul Dumper", "model": "Volvo FMX 440 8x4", "year": 2023, "zone": "ZONE_STP_01"},
    {"id": "DMP_VOLVO_FMX_52", "mine_id": "MINE_SITAPATORE_09", "equipment_type": "Haul Dumper", "model": "Volvo FMX 440 8x4", "year": 2022, "zone": "ZONE_STP_02"},
    {"id": "DRL_ATLAS_ROC_04", "mine_id": "MINE_SITAPATORE_09", "equipment_type": "Blast Drill Rig", "model": "Atlas Copco ROC L8", "year": 2021, "zone": "ZONE_STP_01"},

    # Beldongri (4 units)
    {"id": "EXC_CAT_320_01", "mine_id": "MINE_BELDONGRI_10", "equipment_type": "Hydraulic Excavator", "model": "CAT 320D3", "year": 2022, "zone": "ZONE_BLD_01"},
    {"id": "DMP_BEML_BH35_05", "mine_id": "MINE_BELDONGRI_10", "equipment_type": "Haul Dumper", "model": "BEML BH35-2", "year": 2023, "zone": "ZONE_BLD_01"},
    {"id": "DMP_BEML_BH35_06", "mine_id": "MINE_BELDONGRI_10", "equipment_type": "Haul Dumper", "model": "BEML BH35-2", "year": 2022, "zone": "ZONE_BLD_02"},
    {"id": "WTR_TRK_TATA_05", "mine_id": "MINE_BELDONGRI_10", "equipment_type": "Dust Suppression Bowser", "model": "Tata Prima 2828", "year": 2021, "zone": "ZONE_BLD_01"}
]


def _read_baseline_csv(filename, output_dir):
    candidates = [
        os.path.join("data", "mock_baseline", filename),
        os.path.join(output_dir, filename)
    ]
    for p in candidates:
        if os.path.exists(p):
            with open(p, mode="r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                return list(reader)
    return []


def generate_full_dataset(output_dir="data/mock"):
    """Generates the full relational synthetic dataset across 8 mines and 37 zones."""
    os.makedirs(output_dir, exist_ok=True)
    print(f"[GEN] Generating Full Relational Mining Intelligence Dataset in '{output_dir}'...")

    baseline_geo = _read_baseline_csv("geological_data.csv", output_dir)
    baseline_eq = _read_baseline_csv("equipment_data.csv", output_dir)
    baseline_prod = _read_baseline_csv("production_data.csv", output_dir)
    baseline_weath = _read_baseline_csv("weather_data.csv", output_dir)
    baseline_sat = _read_baseline_csv("satellite_data.csv", output_dir)

    # -------------------------------------------------------------
    # 1. GEOLOGICAL OBSERVATIONS (~1,450 records, ~180 boreholes)
    # -------------------------------------------------------------
    print("[GEN] Generating Geological Observations...")
    geo_rows = []
    orig_balaghat_geo = [r for r in baseline_geo if r.get("mine_id") == "MINE_BALAGHAT_01"][:60]
    geo_rows.extend(orig_balaghat_geo)

    mine_lookup = {m["id"]: m for m in SYNTHETIC_MINES}
    bh_counter = 200

    for zone in SYNTHETIC_ZONES:
        m = mine_lookup[zone["mine_id"]]
        if zone["mine_id"] == "MINE_BALAGHAT_01":
            continue
        num_boreholes = 5 if zone["potential"] == "HIGH" else (4 if zone["potential"] == "MEDIUM" else 2)

        for _ in range(num_boreholes):
            bh_counter += 1
            code_prefix = zone["mine_id"].split("_")[1][:3]
            bh_id = f"BH-{code_prefix}-{bh_counter}"
            bh_lat = round(m["latitude"] + zone["lat_offset"] + random.uniform(-0.0015, 0.0015), 5)
            bh_lng = round(m["longitude"] + zone["lng_offset"] + random.uniform(-0.0015, 0.0015), 5)

            num_intervals = random.randint(8, 11)
            base_depth = random.uniform(25.0, 45.0)

            for layer_idx in range(num_intervals):
                depth = round(base_depth + (layer_idx * random.uniform(11.0, 16.0)), 1)

                if zone["potential"] == "HIGH":
                    mn = round(random.gauss(42.5, 3.0), 2)
                    mn = min(58.0, max(35.5, mn))
                    fe = round(random.gauss(5.8, 1.0), 2)
                    fe = min(10.0, max(3.5, fe))
                    sio2 = round(random.gauss(11.2, 1.8), 2)
                    sio2 = min(18.0, max(7.0, sio2))
                    p = round(random.gauss(0.12, 0.025), 3)
                    p = min(0.25, max(0.05, p))
                    rock = random.choice(["Sausar Group Gondite", "Mansar Schist", "Quartzite Breccia"])
                    layer = random.choice(["Primary Ore Body", "High Grade Seam", "Supergene Enriched"])
                elif zone["potential"] == "MEDIUM":
                    mn = round(random.gauss(31.5, 3.2), 2)
                    mn = min(36.0, max(24.0, mn))
                    fe = round(random.gauss(8.5, 1.4), 2)
                    fe = min(14.0, max(6.0, fe))
                    sio2 = round(random.gauss(18.5, 2.5), 2)
                    sio2 = min(28.0, max(12.0, sio2))
                    p = round(random.gauss(0.16, 0.035), 3)
                    p = min(0.30, max(0.08, p))
                    rock = random.choice(["Chorbaoli Quartzite", "Phyllite", "Banded Manganese Chert"])
                    layer = random.choice(["Disseminated Ore", "Transitional Lode", "Secondary Siliceous"])
                else:
                    mn = round(random.gauss(18.5, 3.5), 2)
                    mn = min(26.0, max(8.0, mn))
                    fe = round(random.gauss(13.2, 1.8), 2)
                    fe = min(22.0, max(8.5, fe))
                    sio2 = round(random.gauss(31.0, 3.8), 2)
                    sio2 = min(48.0, max(20.0, sio2))
                    p = round(random.gauss(0.22, 0.04), 3)
                    p = min(0.38, max(0.12, p))
                    rock = random.choice(["Tirodi Gneiss", "Pegmatite Intrusion", "Overburden Clay"])
                    layer = random.choice(["Subgrade Mineralization", "Weathered Cap", "Barren Overburden"])

                days_ago = random.randint(5, 120)
                obs_time = (datetime(2026, 3, 14) - timedelta(days=days_ago, hours=random.randint(8, 17))).strftime("%Y-%m-%dT%H:00:00Z")

                geo_rows.append({
                    "borehole_id": bh_id,
                    "mine_id": zone["mine_id"],
                    "zone_id": zone["id"],
                    "latitude": bh_lat,
                    "longitude": bh_lng,
                    "depth_meters": depth,
                    "mn_grade_pct": mn,
                    "fe_grade_pct": fe,
                    "sio2_pct": sio2,
                    "phosphorus_pct": p,
                    "rock_formation": rock,
                    "subsurface_layer": layer,
                    "timestamp": obs_time
                })

    geo_csv_path = os.path.join(output_dir, "geological_data.csv")
    with open(geo_csv_path, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=[
            "borehole_id", "mine_id", "zone_id", "latitude", "longitude",
            "depth_meters", "mn_grade_pct", "fe_grade_pct", "sio2_pct",
            "phosphorus_pct", "rock_formation", "subsurface_layer", "timestamp"
        ])
        writer.writeheader()
        writer.writerows(geo_rows)
    print(f"[GEN] Geological Observations saved: {len(geo_rows)} records.")

    # -------------------------------------------------------------
    # 2. EQUIPMENT STATUS (~3,600 status records)
    # -------------------------------------------------------------
    print("[GEN] Generating Equipment Fleet & Status Telematics...")
    eq_rows = []
    orig_eq = baseline_eq[:112]
    eq_rows.extend(orig_eq)

    end_date = datetime(2026, 3, 14)
    start_date_eq = datetime(2025, 12, 15)
    total_days_eq = (end_date - start_date_eq).days

    for day_offset in range(total_days_eq + 1):
        cur_date = start_date_eq + timedelta(days=day_offset)
        date_str = cur_date.strftime("%Y-%m-%d")

        for eq in SYNTHETIC_EQUIPMENT:
            if eq["mine_id"] == "MINE_BALAGHAT_01":
                continue

            is_breakdown = random.random() < 0.05
            is_minor_delay = random.random() < 0.12

            if is_breakdown:
                downtime = round(random.uniform(4.5, 8.5), 1)
                oper_hours = round(24.0 - downtime - random.uniform(1.0, 3.0), 1)
                eff = round(random.uniform(48.0, 68.0), 1)
                status = "CRITICAL_MAINTENANCE"
                reason = random.choice([
                    "Hydraulic pump seal burst",
                    "Excavator boom cylinder leak",
                    "Dumper planetary hub failure",
                    "Drill rotary motor trip",
                    "Engine cooling circuit rupture"
                ])
            elif is_minor_delay:
                downtime = round(random.uniform(1.5, 3.5), 1)
                oper_hours = round(24.0 - downtime - random.uniform(0.5, 2.0), 1)
                eff = round(random.uniform(72.0, 84.0), 1)
                status = "WARNING"
                reason = random.choice([
                    "Track shoe tension adjustment",
                    "Air intake filter clogging",
                    "Haul road dust water spraying pause",
                    "Fuel refill & shift inspection"
                ])
            else:
                downtime = round(random.uniform(0.0, 1.0), 1)
                oper_hours = round(24.0 - downtime - random.uniform(0.5, 1.5), 1)
                eff = round(random.uniform(88.0, 98.0), 1)
                status = "OPTIMAL"
                reason = "None"

            ts = f"{date_str}T{random.randint(18, 23)}:00:00Z"
            eq_rows.append({
                "equipment_id": eq["id"],
                "equipment_type": eq["equipment_type"],
                "mine_id": eq["mine_id"],
                "zone_id": eq["zone"],
                "operational_hours": oper_hours,
                "downtime_hours": downtime,
                "downtime_reason": reason,
                "efficiency_pct": eff,
                "health_status": status,
                "timestamp": ts
            })

    eq_csv_path = os.path.join(output_dir, "equipment_data.csv")
    with open(eq_csv_path, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=[
            "equipment_id", "equipment_type", "mine_id", "zone_id",
            "operational_hours", "downtime_hours", "downtime_reason",
            "efficiency_pct", "health_status", "timestamp"
        ])
        writer.writeheader()
        writer.writerows(eq_rows)
    print(f"[GEN] Equipment Status Records saved: {len(eq_rows)} records.")

    # -------------------------------------------------------------
    # 3. WEATHER OBSERVATIONS (~1,440 records across 8 mines)
    # -------------------------------------------------------------
    print("[GEN] Generating Weather Observations...")
    weather_rows = []
    orig_weath = baseline_weath[:30]
    weather_rows.extend(orig_weath)

    start_date_weath = datetime(2025, 9, 15)
    total_days_weath = (end_date - start_date_weath).days

    for day_offset in range(total_days_weath + 1):
        cur_date = start_date_weath + timedelta(days=day_offset)
        date_str = cur_date.strftime("%Y-%m-%d")
        month = cur_date.month

        is_monsoon_season = month in [6, 7, 8, 9]
        is_crisis_week = (cur_date >= datetime(2026, 3, 9) and cur_date <= datetime(2026, 3, 14))

        for mine in SYNTHETIC_MINES:
            if mine["id"] == "MINE_BALAGHAT_01":
                continue

            if is_monsoon_season:
                has_storm = random.random() < 0.45
                rainfall = round(random.uniform(18.0, 65.0), 1) if has_storm else round(random.uniform(0.0, 6.0), 1)
                soil_m = round(random.uniform(40.0, 72.0), 1)
                flood_idx = "HIGH" if rainfall > 45.0 else ("MODERATE" if rainfall > 20.0 else "LOW")
                temp = round(random.uniform(27.0, 34.0), 1)
                humidity = round(random.uniform(70.0, 95.0), 1)
                wind = round(random.uniform(18.0, 32.0), 1)
            else:
                has_shower = random.random() < 0.08
                rainfall = round(random.uniform(1.0, 12.0), 1) if has_shower else 0.0
                soil_m = round(random.uniform(16.0, 32.0), 1)
                flood_idx = "LOW"
                temp = round(random.uniform(24.0, 38.0), 1)
                humidity = round(random.uniform(30.0, 58.0), 1)
                wind = round(random.uniform(10.0, 18.0), 1)

            ts = f"{date_str}T18:00:00Z"
            weather_rows.append({
                "mine_id": mine["id"],
                "date": date_str,
                "rainfall_mm": rainfall,
                "soil_moisture_pct": soil_m,
                "ambient_temp_c": temp,
                "humidity_pct": humidity,
                "wind_speed_kmh": wind,
                "flood_risk_index": flood_idx,
                "timestamp": ts
            })

    weather_csv_path = os.path.join(output_dir, "weather_data.csv")
    with open(weather_csv_path, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=[
            "mine_id", "date", "rainfall_mm", "soil_moisture_pct",
            "ambient_temp_c", "humidity_pct", "wind_speed_kmh",
            "flood_risk_index", "timestamp"
        ])
        writer.writeheader()
        writer.writerows(weather_rows)
    print(f"[GEN] Weather Observations saved: {len(weather_rows)} records.")

    # -------------------------------------------------------------
    # 4. SATELLITE TELEMETRY (~1,500 records across 37 zones)
    # -------------------------------------------------------------
    print("[GEN] Generating Satellite Telemetry Observations...")
    sat_rows = []
    orig_sat = baseline_sat[:50]
    sat_rows.extend(orig_sat)

    pass_dates = [start_date_weath + timedelta(days=d) for d in range(0, total_days_weath + 1, 4)]

    for p_date in pass_dates:
        date_str = p_date.strftime("%Y-%m-%d")
        month = p_date.month

        for zone in SYNTHETIC_ZONES:
            if any(r.get("zone_id") == zone["id"] and r.get("timestamp", "").startswith(date_str) for r in orig_sat):
                continue

            if "Overburden" in zone["name"] or "Dump" in zone["name"]:
                ndvi = round(random.uniform(0.32, 0.48), 3)
            elif zone["daily_target_tons"] > 300:
                ndvi = round(random.uniform(0.12, 0.22), 3)
            else:
                ndvi = round(random.uniform(0.20, 0.35), 3)

            ndwi = round(random.uniform(-0.25, 0.10), 3)
            lst = round(random.uniform(30.0, 42.0), 1)
            soil_sat = round(random.uniform(22.0, 68.0), 1)
            cloud = round(random.uniform(0.0, 25.0), 1) if month in [6, 7, 8, 9] else round(random.uniform(0.0, 8.0), 1)

            sat_rows.append({
                "satellite_source": "Sentinel-2 MSI",
                "mine_id": zone["mine_id"],
                "zone_id": zone["id"],
                "ndvi": ndvi,
                "ndwi": ndwi,
                "land_surface_temp_c": lst,
                "soil_moisture_satellite_pct": soil_sat,
                "cloud_coverage_pct": cloud,
                "data_quality_flag": "CLEAR" if cloud < 15.0 else "HAZE_CORRECTED",
                "timestamp": f"{date_str}T10:30:00Z"
            })

    sat_csv_path = os.path.join(output_dir, "satellite_data.csv")
    with open(sat_csv_path, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=[
            "satellite_source", "mine_id", "zone_id", "ndvi", "ndwi",
            "land_surface_temp_c", "soil_moisture_satellite_pct",
            "cloud_coverage_pct", "data_quality_flag", "timestamp"
        ])
        writer.writeheader()
        writer.writerows(sat_rows)
    print(f"[GEN] Satellite Observations saved: {len(sat_rows)} records.")

    # -------------------------------------------------------------
    # 5. PRODUCTION RECORDS (~2,400 daily/shift records)
    # -------------------------------------------------------------
    print("[GEN] Generating Relational Production Records (6 Operational Scenarios)...")
    prod_rows = []
    orig_prod = baseline_prod[:90]
    prod_rows.extend(orig_prod)

    active_zones = [z for z in SYNTHETIC_ZONES if z["daily_target_tons"] > 0]
    start_date_prod = datetime(2025, 12, 5)
    total_days_prod = (end_date - start_date_prod).days

    for day_offset in range(total_days_prod + 1):
        cur_date = start_date_prod + timedelta(days=day_offset)
        date_str = cur_date.strftime("%Y-%m-%d")

        for zone in active_zones:
            if zone["mine_id"] == "MINE_BALAGHAT_01":
                continue

            daily_target = zone["daily_target_tons"]
            scenario_roll = random.random()

            if scenario_roll < 0.75:
                actual = round(daily_target * random.uniform(0.95, 1.05), 1)
                shortfall = max(0.0, round(daily_target - actual, 1))
                trips = int(round(actual / 22.0))
                blasting_status = "Completed"
                blasting_delay = 0.0
                grade = round(random.uniform(39.0, 44.0), 1)
            elif scenario_roll < 0.83:
                actual = round(daily_target * random.uniform(0.65, 0.82), 1)
                shortfall = round(daily_target - actual, 1)
                trips = int(round(actual / 22.0))
                blasting_status = "Postponed_Rain"
                blasting_delay = round(random.uniform(1.5, 3.5), 1)
                grade = round(random.uniform(37.0, 41.0), 1)
            elif scenario_roll < 0.91:
                actual = round(daily_target * random.uniform(0.55, 0.78), 1)
                shortfall = round(daily_target - actual, 1)
                trips = int(round(actual / 22.0))
                blasting_status = "Completed"
                blasting_delay = round(random.uniform(0.0, 1.0), 1)
                grade = round(random.uniform(38.0, 43.0), 1)
            elif scenario_roll < 0.96:
                actual = round(daily_target * random.uniform(0.70, 0.85), 1)
                shortfall = round(daily_target - actual, 1)
                trips = int(round(actual / 22.0))
                blasting_status = "Delayed_Misfire"
                blasting_delay = round(random.uniform(2.0, 4.0), 1)
                grade = round(random.uniform(38.0, 42.0), 1)
            elif scenario_roll < 0.98:
                actual = round(daily_target * random.uniform(0.40, 0.60), 1)
                shortfall = round(daily_target - actual, 1)
                trips = int(round(actual / 22.0))
                blasting_status = "Suspended_Pit_Inundation"
                blasting_delay = round(random.uniform(3.0, 5.5), 1)
                grade = round(random.uniform(35.0, 39.0), 1)
            else:
                actual = round(daily_target * random.uniform(1.08, 1.25), 1)
                shortfall = 0.0
                trips = int(round(actual / 22.0))
                blasting_status = "Completed"
                blasting_delay = 0.0
                grade = round(random.uniform(41.0, 45.0), 1)

            ts = f"{date_str}T22:00:00Z"
            prod_rows.append({
                "date": date_str,
                "mine_id": zone["mine_id"],
                "zone_id": zone["id"],
                "shift": "Daily_Aggregate",
                "planned_tonnage": float(daily_target),
                "actual_tonnage": actual,
                "shortfall_tonnage": shortfall,
                "ore_grade_mined": grade,
                "hauling_trips": trips,
                "blasting_status": blasting_status,
                "blasting_delay_hours": blasting_delay,
                "timestamp": ts
            })

    prod_csv_path = os.path.join(output_dir, "production_data.csv")
    with open(prod_csv_path, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=[
            "date", "mine_id", "zone_id", "shift", "planned_tonnage",
            "actual_tonnage", "shortfall_tonnage", "ore_grade_mined",
            "hauling_trips", "blasting_status", "blasting_delay_hours", "timestamp"
        ])
        writer.writeheader()
        writer.writerows(prod_rows)
    print(f"[GEN] Production Records saved: {len(prod_rows)} records.")

    # -------------------------------------------------------------
    # 6. MINES & MINING ZONES CATALOG CSVs
    # -------------------------------------------------------------
    mines_csv_path = os.path.join(output_dir, "mines.csv")
    with open(mines_csv_path, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=[
            "id", "name", "concession_code", "state", "district",
            "latitude", "longitude", "area_sq_km", "mineral_type",
            "annual_capacity", "type"
        ])
        writer.writeheader()
        writer.writerows(SYNTHETIC_MINES)
    print(f"[GEN] Mines Catalog saved: {len(SYNTHETIC_MINES)} mines.")

    zones_csv_path = os.path.join(output_dir, "mining_zones.csv")
    with open(zones_csv_path, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=[
            "id", "mine_id", "name", "operational_status", "bench_level",
            "daily_target_tons", "potential"
        ], extrasaction='ignore')
        writer.writeheader()
        writer.writerows(SYNTHETIC_ZONES)
    print(f"[GEN] Mining Zones Catalog saved: {len(SYNTHETIC_ZONES)} zones.")

    # -------------------------------------------------------------
    # 7. CONTROLLED DATA QUALITY TEST DATASET
    # -------------------------------------------------------------
    quality_test_path = os.path.join(output_dir, "quality_test_records.csv")
    quality_rows = [
        {"record_id": "TEST_Q_01", "domain": "geological", "issue_type": "OUT_OF_BOUND_ASSAY", "field": "mn_grade_pct", "value": "78.5", "status": "FLAGGED", "timestamp": "2026-03-14T08:00:00Z"},
        {"record_id": "TEST_Q_02", "domain": "geological", "issue_type": "NEGATIVE_DEPTH", "field": "depth_meters", "value": "-14.2", "status": "FLAGGED", "timestamp": "2026-03-14T08:05:00Z"},
        {"record_id": "TEST_Q_03", "domain": "production", "issue_type": "DUPLICATE_SHIFT_LOG", "field": "shift_id", "value": "DUP_PROD_99", "status": "FLAGGED", "timestamp": "2026-03-14T08:10:00Z"},
        {"record_id": "TEST_Q_04", "domain": "weather", "issue_type": "STALE_SENSOR_HEARTBEAT", "field": "rainfall_mm", "value": "NaN", "status": "FLAGGED", "timestamp": "2026-03-12T00:00:00Z"},
        {"record_id": "TEST_Q_05", "domain": "equipment", "issue_type": "EXCESSIVE_HOURS_PER_DAY", "field": "operational_hours", "value": "29.5", "status": "FLAGGED", "timestamp": "2026-03-14T09:00:00Z"}
    ]
    with open(quality_test_path, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["record_id", "domain", "issue_type", "field", "value", "status", "timestamp"])
        writer.writeheader()
        writer.writerows(quality_rows)
    print(f"[GEN] Controlled Data Quality Test Dataset saved: {len(quality_rows)} records.")
    print("[GEN] Dataset generation complete!")


def main():
    parser = argparse.ArgumentParser(description="Synthetic Mock Data Generator for MOIL Mining Intelligence Platform")
    parser.add_argument("--profile", choices=["small", "full"], default="full", help="Dataset profile (small or full)")
    parser.add_argument("--output-dir", default="data/mock", help="Output directory for CSV files")
    args = parser.parse_args()

    if args.profile == "small":
        print("[GEN] Small profile requested. Restoring baseline prototype dataset...")
        for fname in ["equipment_data.csv", "geological_data.csv", "production_data.csv", "satellite_data.csv", "weather_data.csv"]:
            src = os.path.join("data", "mock_baseline", fname)
            dst = os.path.join(args.output_dir, fname)
            if os.path.exists(src):
                import shutil
                shutil.copyfile(src, dst)
        print("[GEN] Small profile restored.")
    else:
        generate_full_dataset(output_dir=args.output_dir)


if __name__ == "__main__":
    main()
