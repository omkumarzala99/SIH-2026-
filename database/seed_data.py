"""
Seed script to initialize and populate the MOIL Mining database with synthetic relational data.
Supports both '--profile full' (~1,255 geo, ~2,500 prod, 40 equipment, 3,600 logs)
and '--profile small' (baseline 60 geo, 90 prod, 8 equipment, 112 logs).
"""
import os
import csv
import sys
import argparse
from datetime import datetime, timezone
from database.connection import init_db, SessionLocal, engine
from database.models import (
    Base, Mine, MineZone, GeologicalObservation, SatelliteObservation,
    WeatherObservation, Equipment, EquipmentStatus, ProductionRecord,
    ReservePrediction, ProductionPrediction, RiskAssessment,
    Recommendation, ModelVersion
)

# 40 Full Fleet Equipment definitions across all 8 MOIL mines
FULL_EQUIPMENT_FLEET = [
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
    {"id": "WTR_TRK_TATA_04", "mine_id": "MINE_UKWA_08", "equipment_type": "Dust Suppression Bowser", "model": "Tata Prima 2828", "year": 2022, "zone": "ZONE_UKW_02"}
]

RECOMMENDATIONS = [
    # Balaghat (Preserved exact IDs)
    Recommendation(
        id="REC_2026_001",
        mine_id="MINE_BALAGHAT_01",
        title="Re-deploy Haul Dumper Fleet to Pit A Upper Bench",
        category="EQUIPMENT",
        problem_summary="Pit B experienced hydraulic failure on EXC_CAT_349_01, creating hauling idle time while Pit A faces 24% shortfall.",
        recommended_action="Temporarily re-route Dumpers DMP_VOLVO_FMX_11 and 12 to North Pit A bench -120m RL to feed Primary Crusher at capacity.",
        expected_impact="Recovers approximately 110 tons/shift and reduces dumper idle fuel consumption by 18%.",
        expected_tonnage_recovery=110.0,
        urgency="HIGH",
        status="PENDING",
        created_at=datetime.now(timezone.utc)
    ),
    Recommendation(
        id="REC_2026_002",
        mine_id="MINE_BALAGHAT_01",
        title="Reschedule Bench Blasting Window Post-Monsoon Surge",
        category="BLASTING",
        problem_summary="Monsoon rainfall recorded at 72.4mm saturated top blast holes in Zone C, causing 3.2 hour ignition delay.",
        recommended_action="Postpone secondary shot-firing in Zone C to Shift-B; prioritize pre-blasted fragmented muckpile extraction in Central Zone B.",
        expected_impact="Avoids misfire safety hazard and unlocks 95 tons of immediate run-of-mine ore feed.",
        expected_tonnage_recovery=95.0,
        urgency="HIGH",
        status="PENDING",
        created_at=datetime.now(timezone.utc)
    ),
    Recommendation(
        id="REC_2026_003",
        mine_id="MINE_BALAGHAT_01",
        title="Activate Sump Dewatering Pumps in Central Pit B",
        category="ENVIRONMENTAL",
        problem_summary="Soil moisture index reached 64% with 48mm pit floor water accumulation, impending haul ramp traction.",
        recommended_action="Deploy 2x 75kW submersible slurry pumps at Bench -160m sump and grade haul road with dry quartz gravel.",
        expected_impact="Prevents ramp slippage risk and restores dumper cycle speed from 12 km/h to standard 22 km/h.",
        expected_tonnage_recovery=75.0,
        urgency="MEDIUM",
        status="APPROVED",
        created_at=datetime.now(timezone.utc)
    ),
    # Gumgaon
    Recommendation(
        id="REC_2026_004",
        mine_id="MINE_GUMGAON_02",
        title="Deep Shaft Auxiliary Dewatering & Ventilation Acceleration",
        category="ENVIRONMENTAL",
        problem_summary="Water seepage at -180m Central Stope increased sump level by 1.8m following sustained subterranean inflows.",
        recommended_action="Commission tertiary pump stage at shaft bottom and throttle extraction from Stope 2 to Stope 1 until water clearance.",
        expected_impact="Protects stope access and maintains baseline extraction at 88% of planned daily quota.",
        expected_tonnage_recovery=65.0,
        urgency="HIGH",
        status="PENDING",
        created_at=datetime.now(timezone.utc)
    ),
    # Tirodi
    Recommendation(
        id="REC_2026_005",
        mine_id="MINE_TIRODI_03",
        title="Grade Main Haul Ramp with Quartz Aggregate",
        category="EQUIPMENT",
        problem_summary="Ramp surface friction diminished due to heavy rainfall, reducing dumper payload speeds by 40%.",
        recommended_action="Deploy Dozer DOZ_CAT_D8R_01 with crushed ballast along Ramp 3 to restore traction.",
        expected_impact="Increases hauling turnarounds from 3.2 to 4.8 cycles per hour, adding 120 tons per shift.",
        expected_tonnage_recovery=120.0,
        urgency="MEDIUM",
        status="PENDING",
        created_at=datetime.now(timezone.utc)
    ),
    # Dongri Buzurg
    Recommendation(
        id="REC_2026_006",
        mine_id="MINE_DONGRI_04",
        title="Dynamic Ore Blending for Beneficiation Feed Consistency",
        category="ZONE_PRIORITIZATION",
        problem_summary="Pit 1 feed grade dropped to 36.2% Mn, which reduces downstream plant recovery rate.",
        recommended_action="Blend 60% high-grade (44.5% Mn) from Bench 2 with 40% low-grade stockpile to achieve target 41.5% feed.",
        expected_impact="Stabilizes heavy media separation plant recovery at 92.4% without reducing throughput.",
        expected_tonnage_recovery=85.0,
        urgency="MEDIUM",
        status="APPROVED",
        created_at=datetime.now(timezone.utc)
    ),
    # Chikla
    Recommendation(
        id="REC_2026_007",
        mine_id="MINE_CHIKLA_07",
        title="Preventive Hydraulic Seal Replacement on Drill Rig",
        category="EQUIPMENT",
        problem_summary="Telemetry indicates elevated operating temperature and minor pressure loss on DRL_SND_DX800_02.",
        recommended_action="Schedule 2-hour preventive maintenance before Shift-B to swap high-pressure boom seals.",
        expected_impact="Eliminates risk of catastrophic blast pattern drilling stoppage during primary extraction window.",
        expected_tonnage_recovery=50.0,
        urgency="LOW",
        status="PENDING",
        created_at=datetime.now(timezone.utc)
    ),
    # Ukwa
    Recommendation(
        id="REC_2026_008",
        mine_id="MINE_UKWA_08",
        title="Underground Seam Incline Timbering & Roof Bolting",
        category="ZONE_PRIORITIZATION",
        problem_summary="Convergence monitoring indicates minor stratum relaxation at Deep Seam Drift 1 intersection.",
        recommended_action="Install supplementary resin roof bolts and timber cribbing along 40m haulage heading.",
        expected_impact="Ensures worker safety compliance and maintains uninterrupted ore tramming.",
        expected_tonnage_recovery=70.0,
        urgency="HIGH",
        status="PENDING",
        created_at=datetime.now(timezone.utc)
    ),
    # Kandri
    Recommendation(
        id="REC_2026_009",
        mine_id="MINE_KANDRI_05",
        title="Upgrade Dewatering Capacity at Lower Incline Stope",
        category="ENVIRONMENTAL",
        problem_summary="Infiltration rate increased by 22% along underground stope footwall following seasonal aquifer recharge.",
        recommended_action="Deploy automated submersible sump pump with continuous water level telemetry at -150m level.",
        expected_impact="Prevents stope submersion risk and secures 80 tons/shift production schedule.",
        expected_tonnage_recovery=80.0,
        urgency="MEDIUM",
        status="PENDING",
        created_at=datetime.now(timezone.utc)
    ),
    # Mansar
    Recommendation(
        id="REC_2026_010",
        mine_id="MINE_MANSAR_06",
        title="Stope Pillar Stabilization and Geotechnical Reinforcement",
        category="ZONE_PRIORITIZATION",
        problem_summary="Local rock stress detected at Level 4 extraction drive during routine geotechnical seismic monitoring.",
        recommended_action="Apply resin rock bolts and wire mesh reinforcement along crown drive, re-routing loader to North Drift.",
        expected_impact="Stabilizes hanging wall integrity and maintains safe extraction rate of 75 tons/shift.",
        expected_tonnage_recovery=75.0,
        urgency="HIGH",
        status="PENDING",
        created_at=datetime.now(timezone.utc)
    )
]


def _find_csv(filename: str, profile: str = "full") -> str:
    subfolder = "mock" if profile == "full" else "mock_baseline"
    candidates = [
        os.path.join("data", subfolder, filename),
        os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", subfolder, filename),
        os.path.join("data", "mock", filename),
        os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "mock", filename)
    ]
    for p in candidates:
        if os.path.exists(p):
            return p
    return candidates[0]


def seed_database(profile: str = "full", clean: bool = False):
    """
    Seeds SQLite/PostgreSQL database with synthetic mining data.
    profile: 'full' (all 8 mines, ~1.2k geo, ~2.5k prod) or 'small' (baseline 2 mines, 60 geo).
    clean: if True, drops all existing tables and re-creates them cleanly.
    """
    print(f"Initializing database tables (profile='{profile}', clean={clean})...")
    if clean:
        print("Dropping existing tables for clean seed...")
        Base.metadata.drop_all(bind=engine)
    init_db()
    session = SessionLocal()

    try:
        # Check if database is already fully seeded
        mine_count = session.query(Mine).count()
        if not clean and profile == "full" and mine_count >= 8:
            print(f"Database already populated with {mine_count} mines. Skipping re-seed.")
            return

        # 1. Seed Mines
        if session.query(Mine).count() == 0:
            print(f"Seeding Mines (profile={profile})...")
            mines_csv = _find_csv("mines.csv", profile)
            if os.path.exists(mines_csv) and profile == "full":
                with open(mines_csv, mode="r", encoding="utf-8") as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        session.add(Mine(
                            id=row["id"],
                            name=row["name"],
                            concession_code=row["concession_code"],
                            state=row["state"],
                            district=row["district"],
                            latitude=float(row["latitude"]),
                            longitude=float(row["longitude"]),
                            area_sq_km=float(row["area_sq_km"]),
                            mineral_type=row.get("mineral_type", "Manganese Ore")
                        ))
            else:
                # Fallback baseline mines
                balaghat = Mine(
                    id="MINE_BALAGHAT_01",
                    name="Balaghat Manganese Concession",
                    concession_code="MOIL-MP-BGT-001",
                    state="Madhya Pradesh",
                    district="Balaghat",
                    latitude=21.8129,
                    longitude=80.1835,
                    area_sq_km=14.85,
                    mineral_type="Manganese Ore"
                )
                gumgaon = Mine(
                    id="MINE_GUMGAON_02",
                    name="Gumgaon Manganese Mine",
                    concession_code="MOIL-MH-GMG-002",
                    state="Maharashtra",
                    district="Nagpur",
                    latitude=21.3854,
                    longitude=78.9812,
                    area_sq_km=9.40,
                    mineral_type="Manganese Ore"
                )
                session.add_all([balaghat, gumgaon])
            session.commit()
            print(f"Mines seeded: {session.query(Mine).count()}")
        else:
            print("Mines already exist. Skipping.")

        # 2. Seed Mine Zones
        if session.query(MineZone).count() == 0:
            print(f"Seeding Mine Zones (profile={profile})...")
            zones_csv = _find_csv("mining_zones.csv", profile)
            if os.path.exists(zones_csv) and profile == "full":
                with open(zones_csv, mode="r", encoding="utf-8") as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        session.add(MineZone(
                            id=row["id"],
                            mine_id=row["mine_id"],
                            name=row["name"],
                            operational_status=row["operational_status"],
                            bench_level=row["bench_level"],
                            daily_target_tons=int(row["daily_target_tons"])
                        ))
            else:
                # Baseline 5 zones for Balaghat
                zones_data = [
                    ("ZONE_NORTH_A", "MINE_BALAGHAT_01", "North Bench Pit A", "ACTIVE_EXTRACTION", "-120m RL", 450),
                    ("ZONE_CENTRAL_B", "MINE_BALAGHAT_01", "Central Main Pit B", "HIGH_EXTRACTION", "-160m RL", 520),
                    ("ZONE_SOUTH_C", "MINE_BALAGHAT_01", "South Expansion Zone C", "DEVELOPMENT_BENCH", "-60m RL", 250),
                    ("ZONE_EAST_D", "MINE_BALAGHAT_01", "East Exploration Block D", "GEOLOGICAL_PROSPECTING", "Surface (+320m RL)", 0),
                    ("ZONE_WEST_E", "MINE_BALAGHAT_01", "West Overburden Dump E", "WASTE_STABILIZATION", "Surface (+340m RL)", 0),
                ]
                for zid, mid, name, status, bench, target in zones_data:
                    session.add(MineZone(
                        id=zid, mine_id=mid, name=name,
                        operational_status=status, bench_level=bench,
                        daily_target_tons=target
                    ))
            session.commit()
            print(f"Mine Zones seeded: {session.query(MineZone).count()}")
        else:
            print("Mine Zones already exist. Skipping.")

        # 3. Seed Equipment Fleet
        if session.query(Equipment).count() == 0:
            print(f"Seeding Equipment Fleet (profile={profile})...")
            fleet = FULL_EQUIPMENT_FLEET if profile == "full" else FULL_EQUIPMENT_FLEET[:8]
            for eq in fleet:
                session.add(Equipment(
                    id=eq["id"],
                    mine_id=eq["mine_id"],
                    equipment_type=eq["equipment_type"],
                    model=eq["model"],
                    commissioned_year=eq["year"],
                    assigned_zone=eq["zone"],
                    is_active=True
                ))
            session.commit()
            print(f"Equipment fleet seeded: {session.query(Equipment).count()}")
        else:
            print("Equipment fleet already exists. Skipping.")

        # 4. Seed Geological observations
        if session.query(GeologicalObservation).count() == 0:
            geo_csv = _find_csv("geological_data.csv", profile)
            if os.path.exists(geo_csv):
                print(f"Seeding Geological observations from {geo_csv}...")
                valid_mine_ids = {m.id for m in session.query(Mine.id).all()}
                valid_zone_ids = {z.id for z in session.query(MineZone.id).all()}
                geo_objects = []
                with open(geo_csv, mode="r", encoding="utf-8") as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        if row["mine_id"] not in valid_mine_ids or row["zone_id"] not in valid_zone_ids:
                            continue
                        geo_objects.append(GeologicalObservation(
                            borehole_id=row["borehole_id"],
                            mine_id=row["mine_id"],
                            zone_id=row["zone_id"],
                            latitude=float(row["latitude"]),
                            longitude=float(row["longitude"]),
                            depth_meters=float(row["depth_meters"]),
                            mn_grade_pct=float(row["mn_grade_pct"]),
                            fe_grade_pct=float(row["fe_grade_pct"]),
                            sio2_pct=float(row["sio2_pct"]),
                            phosphorus_pct=float(row["phosphorus_pct"]),
                            rock_formation=row["rock_formation"],
                            subsurface_layer=row["subsurface_layer"],
                            observed_at=datetime.fromisoformat(row["timestamp"].replace("Z", "+00:00"))
                        ))
                session.bulk_save_objects(geo_objects)
                session.commit()
                print(f"Geological observations seeded: {len(geo_objects)}")
        else:
            print("Geological observations already exist. Skipping.")

        # 5. Seed Equipment Status
        if session.query(EquipmentStatus).count() == 0:
            eq_csv = _find_csv("equipment_data.csv", profile)
            if os.path.exists(eq_csv):
                print(f"Seeding Equipment status logs from {eq_csv}...")
                valid_equipment_ids = {e.id for e in session.query(Equipment.id).all()}
                status_objects = []
                with open(eq_csv, mode="r", encoding="utf-8") as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        eq_id = row["equipment_id"]
                        if eq_id not in valid_equipment_ids:
                            continue
                        status_objects.append(EquipmentStatus(
                            equipment_id=eq_id,
                            operational_hours=float(row["operational_hours"]),
                            downtime_hours=float(row["downtime_hours"]),
                            downtime_reason=row.get("downtime_reason", "None") or "None",
                            efficiency_pct=float(row.get("efficiency_pct", 90.0) or 90.0),
                            health_status=row.get("health_status", "OPTIMAL") or "OPTIMAL",
                            recorded_at=datetime.fromisoformat(row["timestamp"].replace("Z", "+00:00"))
                        ))
                session.bulk_save_objects(status_objects)
                session.commit()
                print(f"Equipment status logs seeded: {len(status_objects)}")
        else:
            print("Equipment status logs already exist. Skipping.")

        # 6. Seed Production Records
        if session.query(ProductionRecord).count() == 0:
            prod_csv = _find_csv("production_data.csv", profile)
            if os.path.exists(prod_csv):
                print(f"Seeding Production records from {prod_csv}...")
                valid_mine_ids = {m.id for m in session.query(Mine.id).all()}
                valid_zone_ids = {z.id for z in session.query(MineZone.id).all()}
                prod_objects = []
                with open(prod_csv, mode="r", encoding="utf-8") as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        if row["mine_id"] not in valid_mine_ids or row["zone_id"] not in valid_zone_ids:
                            continue
                        prod_objects.append(ProductionRecord(
                            mine_id=row["mine_id"],
                            zone_id=row["zone_id"],
                            date=row["date"],
                            shift=row["shift"],
                            planned_tonnage=float(row["planned_tonnage"]),
                            actual_tonnage=float(row["actual_tonnage"]),
                            shortfall_tonnage=float(row["shortfall_tonnage"]),
                            ore_grade_mined=float(row["ore_grade_mined"]),
                            hauling_trips=int(row["hauling_trips"]),
                            blasting_status=row["blasting_status"],
                            blasting_delay_hours=float(row["blasting_delay_hours"]),
                            created_at=datetime.fromisoformat(row["timestamp"].replace("Z", "+00:00"))
                        ))
                session.bulk_save_objects(prod_objects)
                session.commit()
                print(f"Production records seeded: {len(prod_objects)}")
        else:
            print("Production records already exist. Skipping.")

        # 7. Seed Weather observations
        if session.query(WeatherObservation).count() == 0:
            weather_csv = _find_csv("weather_data.csv", profile)
            if os.path.exists(weather_csv):
                print(f"Seeding Weather observations from {weather_csv}...")
                valid_mine_ids = {m.id for m in session.query(Mine.id).all()}
                weather_objects = []
                with open(weather_csv, mode="r", encoding="utf-8") as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        mid = row["mine_id"]
                        if mid not in valid_mine_ids:
                            continue
                        weather_objects.append(WeatherObservation(
                            mine_id=mid,
                            rainfall_mm=float(row["rainfall_mm"]) if row.get("rainfall_mm") else 0.0,
                            soil_moisture_pct=float(row["soil_moisture_pct"]) if row.get("soil_moisture_pct") else 0.0,
                            ambient_temp_c=float(row["ambient_temp_c"]) if row.get("ambient_temp_c") else 25.0,
                            humidity_pct=float(row["humidity_pct"]) if row.get("humidity_pct") else 50.0,
                            wind_speed_kmh=float(row["wind_speed_kmh"]) if row.get("wind_speed_kmh") else 15.0,
                            flood_risk_index=row.get("flood_risk_index", "LOW") or "LOW",
                            observed_at=datetime.fromisoformat(row["timestamp"].replace("Z", "+00:00"))
                        ))
                session.bulk_save_objects(weather_objects)
                session.commit()
                print(f"Weather observations seeded: {len(weather_objects)}")
        else:
            print("Weather observations already exist. Skipping.")

        # 8. Seed Satellite observations
        if session.query(SatelliteObservation).count() == 0:
            sat_csv = _find_csv("satellite_data.csv", profile)
            if os.path.exists(sat_csv):
                print(f"Seeding Satellite observations from {sat_csv}...")
                valid_mine_ids = {m.id for m in session.query(Mine.id).all()}
                valid_zone_ids = {z.id for z in session.query(MineZone.id).all()}
                sat_objects = []
                with open(sat_csv, mode="r", encoding="utf-8") as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        mid = row["mine_id"]
                        zid = row["zone_id"]
                        if mid not in valid_mine_ids or zid not in valid_zone_ids:
                            continue
                        sat_objects.append(SatelliteObservation(
                            satellite_source=row.get("satellite_source", "Sentinel-2 MSI") or "Sentinel-2 MSI",
                            mine_id=mid,
                            zone_id=zid,
                            ndvi=float(row["ndvi"]),
                            ndwi=float(row["ndwi"]),
                            land_surface_temp_c=float(row["land_surface_temp_c"]),
                            soil_moisture_satellite_pct=float(row["soil_moisture_satellite_pct"]),
                            cloud_coverage_pct=float(row.get("cloud_coverage_pct", 5.0) or 5.0),
                            data_quality_flag=row.get("data_quality_flag", "CLEAR") or "CLEAR",
                            observed_at=datetime.fromisoformat(row["timestamp"].replace("Z", "+00:00"))
                        ))
                session.bulk_save_objects(sat_objects)
                session.commit()
                print(f"Satellite observations seeded: {len(sat_objects)}")
        else:
            print("Satellite observations already exist. Skipping.")

        # 9. Seed Model Versions
        if session.query(ModelVersion).count() == 0:
            print("Seeding Model Registry...")
            session.add_all([
                ModelVersion(
                    id="MOD_RES_001",
                    model_name="Manganese Reserve Classification Model",
                    version="v1.2.0",
                    algorithm="RandomForestClassifier + Spatial Kriging",
                    training_date=datetime(2026, 3, 1),
                    accuracy_metric="ROC-AUC",
                    metric_value=0.88,
                    is_active=True
                ),
                ModelVersion(
                    id="MOD_PRD_002",
                    model_name="Daily Extraction Forecaster",
                    version="v1.1.0",
                    algorithm="GradientBoostingRegressor + Lag Constraints",
                    training_date=datetime(2026, 3, 5),
                    accuracy_metric="R2 Score",
                    metric_value=0.85,
                    is_active=True
                ),
                ModelVersion(
                    id="MOD_RSK_003",
                    model_name="Multi-Factor Mining Risk Engine",
                    version="v1.0.0",
                    algorithm="Weighted Rule-Based Engine + Operational Bounds",
                    training_date=datetime(2026, 3, 10),
                    accuracy_metric="Sensitivity",
                    metric_value=0.91,
                    is_active=True
                )
            ])
            session.commit()
            print("Model versions seeded.")
        else:
            print("Model versions already exist. Skipping.")

        # 10. Seed Active Recommendations
        if session.query(Recommendation).count() == 0:
            print("Seeding Recommendations...")
            recs_to_seed = RECOMMENDATIONS if profile == "full" else RECOMMENDATIONS[:3]
            session.add_all(recs_to_seed)
            session.commit()
            print(f"Recommendations seeded: {len(recs_to_seed)}")
        else:
            print("Recommendations already exist. Skipping.")

        print("Database seed completed successfully!")

    except Exception as e:
        session.rollback()
        print(f"Error during seeding: {e}")
        raise
    finally:
        session.close()


def main():
    parser = argparse.ArgumentParser(description="MOIL Mining Platform Database Seeder")
    parser.add_argument("--profile", choices=["full", "small"], default="full",
                        help="Data profile to seed: 'full' (~1.2k geo, 3.6k eq, 2.5k prod) or 'small' (baseline)")
    parser.add_argument("--clean", action="store_true",
                        help="Drop all existing tables and re-create them cleanly before seeding")
    args = parser.parse_args()
    seed_database(profile=args.profile, clean=args.clean)


if __name__ == "__main__":
    main()
