"""
NASA FIRMS (Fire Information for Resource Management System) Service.
Integrates official NASA Area API for near real-time surface thermal/active fire anomalies.
Concession coordinates are dynamically loaded from the database (never hardcoded).
Calculates a geographic bounding box around the mine concession and computes
Haversine distance for each detected surface anomaly.
"""
import os
import math
import time
import csv
import io
import logging
import urllib.request
import urllib.error
from datetime import datetime, timezone
from typing import Dict, Any, Optional, Tuple, List
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database.models import Mine

logger = logging.getLogger("firms_service")

# Cache TTL: 10 minutes for live queries, 60 seconds for empty / unavailable
_LIVE_CACHE_TTL_SECONDS = 600
_FALLBACK_CACHE_TTL_SECONDS = 60
_firms_cache: Dict[str, Tuple[float, "FirmsResponse"]] = {}


class FirmsHotspot(BaseModel):
    latitude: float
    longitude: float
    acq_date: str
    acq_time: str
    satellite: str
    instrument: str = "VIIRS"
    confidence: str = "nominal"
    frp: float = Field(default=0.0, description="Fire Radiative Power in Megawatts (MW)")
    brightness_temperature_k: Optional[float] = Field(default=None, description="Brightness temperature in Kelvin")
    scan: Optional[float] = None
    track: Optional[float] = None
    daynight: Optional[str] = None
    version: Optional[str] = None
    distance_km: float = Field(description="Haversine distance from concession center in kilometers")

    model_config = {"populate_by_name": True}


class FirmsResponse(BaseModel):
    mine_id: str
    mine_name: str
    latitude: float
    longitude: float
    source: str = "NASA FIRMS"
    satellite_source: str
    radius_km: float
    bounding_box: Dict[str, float] = Field(description="Bounding box coordinates (west, south, east, north)")
    lookback_days: int
    hotspot_count: int
    hotspots: List[FirmsHotspot] = []
    status: str = Field(description="live_observations | no_observations | unavailable")
    message: str
    last_updated: str

    model_config = {"populate_by_name": True}


def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Computes great-circle distance between two coordinates in kilometers using Haversine formula.
    """
    R = 6371.0  # Earth's mean radius in km
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)

    a = (math.sin(dphi / 2.0) ** 2) + math.cos(phi1) * math.cos(phi2) * (math.sin(dlambda / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(max(0.0, 1.0 - a)))
    return round(R * c, 2)


def calculate_bounding_box(lat: float, lon: float, radius_km: float = 20.0) -> Tuple[float, float, float, float]:
    """
    Computes geographic bounding box around a concession coordinate.
    Order MUST be WEST, SOUTH, EAST, NORTH as mandated by NASA FIRMS Area API.
    """
    # 1 deg latitude ~= 111.0 km
    dlat = radius_km / 111.0
    south = round(lat - dlat, 4)
    north = round(lat + dlat, 4)

    # 1 deg longitude ~= 111.0 * cos(lat) km
    cos_lat = math.cos(math.radians(lat))
    cos_lat = max(0.05, cos_lat)
    dlon = radius_km / (111.0 * cos_lat)
    west = round(lon - dlon, 4)
    east = round(lon + dlon, 4)

    return (west, south, east, north)


def build_firms_area_url(
    map_key: str,
    source: str,
    west: float,
    south: float,
    east: float,
    north: float,
    day_range: int = 1
) -> str:
    """
    Constructs NASA FIRMS Area API URL.
    Order: WEST,SOUTH,EAST,NORTH
    """
    bbox_str = f"{west:.4f},{south:.4f},{east:.4f},{north:.4f}"
    return f"https://firms.modaps.eosdis.nasa.gov/api/area/csv/{map_key}/{source}/{bbox_str}/{day_range}"


def _get_map_key() -> Optional[str]:
    """Retrieves NASA FIRMS MAP_KEY strictly from backend environment variable."""
    key = os.getenv("NASA_FIRMS_MAP_KEY", "").strip()
    return key if key else None


def parse_firms_csv(
    csv_text: str,
    mine_lat: float,
    mine_lon: float,
    default_satellite: str = "VIIRS"
) -> List[FirmsHotspot]:
    """
    Parses NASA FIRMS Area CSV response into normalized FirmsHotspot objects.
    Safely handles optional and variable fields across VIIRS and MODIS missions.
    Computes distance from mine for every valid detection.
    """
    if not csv_text or not csv_text.strip():
        return []

    lines = [line.strip() for line in csv_text.strip().splitlines() if line.strip()]
    if len(lines) <= 1:
        # Header only or empty
        return []

    # Check for NASA error string instead of CSV (e.g. "Invalid map_key" or HTML)
    first_line_lower = lines[0].lower()
    if "error" in first_line_lower or "invalid" in first_line_lower or "<html" in first_line_lower:
        logger.warning(f"NASA FIRMS API returned error text: {lines[0]}")
        return []

    reader = csv.DictReader(io.StringIO("\n".join(lines)))
    hotspots: List[FirmsHotspot] = []

    for row in reader:
        try:
            h_lat = float(row.get("latitude", 0.0))
            h_lon = float(row.get("longitude", 0.0))
            if h_lat == 0.0 and h_lon == 0.0:
                continue

            dist = haversine_distance_km(mine_lat, mine_lon, h_lat, h_lon)

            # Fire Radiative Power (FRP)
            frp_raw = row.get("frp", "0.0")
            try:
                frp = round(float(frp_raw), 1) if frp_raw else 0.0
            except ValueError:
                frp = 0.0

            # Brightness temperature (bright_ti4 for VIIRS, brightness for MODIS)
            bt_raw = row.get("bright_ti4") or row.get("brightness") or row.get("bright_ti5")
            bt_val = None
            if bt_raw:
                try:
                    bt_val = round(float(bt_raw), 1)
                except ValueError:
                    bt_val = None

            # Scan and track
            scan_val = None
            try:
                scan_val = float(row.get("scan", "")) if row.get("scan") else None
            except ValueError:
                pass

            track_val = None
            try:
                track_val = float(row.get("track", "")) if row.get("track") else None
            except ValueError:
                pass

            acq_date = str(row.get("acq_date", datetime.now(timezone.utc).strftime("%Y-%m-%d"))).strip()
            acq_time = str(row.get("acq_time", "0000")).strip()
            satellite = str(row.get("satellite", default_satellite)).strip()
            instrument = str(row.get("instrument", "VIIRS")).strip()
            confidence = str(row.get("confidence", "nominal")).strip()
            daynight = str(row.get("daynight", "")).strip() or None
            version = str(row.get("version", "")).strip() or None

            hotspots.append(FirmsHotspot(
                latitude=h_lat,
                longitude=h_lon,
                acq_date=acq_date,
                acq_time=acq_time,
                satellite=satellite,
                instrument=instrument,
                confidence=confidence,
                frp=frp,
                brightness_temperature_k=bt_val,
                scan=scan_val,
                track=track_val,
                daynight=daynight,
                version=version,
                distance_km=dist
            ))
        except Exception as e:
            logger.debug(f"Skipping malformed FIRMS CSV row: {e}")
            continue

    # Sort hotspots by proximity to mine
    hotspots.sort(key=lambda h: h.distance_km)
    return hotspots


def fetch_firms_live_raw(
    url: str,
    timeout_seconds: float = 5.0
) -> Optional[str]:
    """
    Executes HTTP GET request to NASA FIRMS Area API.
    Never logs the URL containing the MAP_KEY to prevent key leakage.
    """
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "MOIL-Mining-Intelligence/1.0", "Accept": "text/csv, text/plain"}
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout_seconds) as response:
            if response.status != 200:
                logger.warning(f"NASA FIRMS returned HTTP {response.status}")
                return None
            raw = response.read().decode("utf-8", errors="replace")
            return raw
    except urllib.error.HTTPError as e:
        logger.warning(f"NASA FIRMS HTTP error: {e.code}")
        return None
    except urllib.error.URLError as e:
        logger.warning(f"NASA FIRMS network connection error: {e.reason}")
        return None
    except TimeoutError:
        logger.warning(f"NASA FIRMS request timed out after {timeout_seconds}s")
        return None
    except Exception as e:
        logger.warning(f"Unexpected NASA FIRMS error: {type(e).__name__}")
        return None


def get_firms_for_mine(
    mine_id: str,
    db: Optional[Session] = None,
    force_refresh: bool = False,
    radius_km: Optional[float] = None,
    lookback_days: Optional[int] = None,
    source: Optional[str] = None
) -> FirmsResponse:
    """
    Authoritative NASA FIRMS Entrypoint:
    1. Loads mine details (name, latitude, longitude) dynamically from SQLite `mines` table.
    2. Checks in-memory cache for recent responses.
    3. Calculates geographic bounding box (WEST, SOUTH, EAST, NORTH) for given search radius.
    4. Queries NASA FIRMS Area API if MAP_KEY is configured.
    5. Calculates Haversine distance for each hotspot.
    6. Returns normalized FirmsResponse (status: live_observations, no_observations, or unavailable).
    """
    now = time.time()
    now_iso = datetime.now(timezone.utc).isoformat()

    # Configuration defaults
    active_radius = radius_km if radius_km is not None else float(os.getenv("FIRMS_RADIUS_KM", "20.0"))
    active_lookback = lookback_days if lookback_days is not None else int(os.getenv("FIRMS_LOOKBACK_DAYS", "1"))
    active_source = source if source is not None else os.getenv("FIRMS_SOURCE", "VIIRS_NOAA21_NRT")

    # 1. Resolve Mine Info dynamically from Database
    mine_obj = None
    if db is not None:
        try:
            mine_obj = db.query(Mine).filter(Mine.id == mine_id).first()
        except Exception as e:
            logger.warning(f"Error querying mine from DB: {e}")

    if not mine_obj:
        return FirmsResponse(
            mine_id=mine_id,
            mine_name="Unknown Concession",
            latitude=0.0,
            longitude=0.0,
            source="NASA FIRMS",
            satellite_source=active_source,
            radius_km=active_radius,
            bounding_box={"west": 0.0, "south": 0.0, "east": 0.0, "north": 0.0},
            lookback_days=active_lookback,
            hotspot_count=0,
            hotspots=[],
            status="unavailable",
            message=f"Concession '{mine_id}' not found in database registry.",
            last_updated=now_iso
        )

    mine_name = mine_obj.name
    mine_lat = float(mine_obj.latitude)
    mine_lon = float(mine_obj.longitude)

    # 2. Check in-memory cache
    cache_key = f"{mine_id}_{active_source}_{active_radius}_{active_lookback}"
    if not force_refresh and cache_key in _firms_cache:
        cached_time, cached_res = _firms_cache[cache_key]
        ttl = _LIVE_CACHE_TTL_SECONDS if cached_res.status == "live_observations" else _FALLBACK_CACHE_TTL_SECONDS
        if now - cached_time < ttl:
            return cached_res

    # 3. Compute Bounding Box
    west, south, east, north = calculate_bounding_box(mine_lat, mine_lon, active_radius)
    bbox_dict = {"west": west, "south": south, "east": east, "north": north}

    # 4. Check for NASA MAP_KEY
    map_key = _get_map_key()
    if not map_key:
        fallback_res = FirmsResponse(
            mine_id=mine_id,
            mine_name=mine_name,
            latitude=mine_lat,
            longitude=mine_lon,
            source="NASA FIRMS",
            satellite_source=active_source,
            radius_km=active_radius,
            bounding_box=bbox_dict,
            lookback_days=active_lookback,
            hotspot_count=0,
            hotspots=[],
            status="unavailable",
            message="NASA FIRMS MAP_KEY is not configured in backend environment. Real-time thermal telemetry unavailable.",
            last_updated=now_iso
        )
        _firms_cache[cache_key] = (now, fallback_res)
        return fallback_res

    # 5. Call NASA FIRMS Area API
    api_url = build_firms_area_url(
        map_key=map_key,
        source=active_source,
        west=west,
        south=south,
        east=east,
        north=north,
        day_range=active_lookback
    )

    try:
        raw_csv = fetch_firms_live_raw(api_url, timeout_seconds=5.0)
    except Exception as e:
        logger.warning(f"Error fetching NASA FIRMS: {type(e).__name__}")
        raw_csv = None

    if raw_csv is None:
        err_res = FirmsResponse(
            mine_id=mine_id,
            mine_name=mine_name,
            latitude=mine_lat,
            longitude=mine_lon,
            source="NASA FIRMS",
            satellite_source=active_source,
            radius_km=active_radius,
            bounding_box=bbox_dict,
            lookback_days=active_lookback,
            hotspot_count=0,
            hotspots=[],
            status="unavailable",
            message="NASA FIRMS remote earth observation service is temporarily unreachable or rate-limited.",
            last_updated=now_iso
        )
        _firms_cache[cache_key] = (now, err_res)
        return err_res

    # 6. Parse Observations
    hotspots = parse_firms_csv(raw_csv, mine_lat=mine_lat, mine_lon=mine_lon, default_satellite="VIIRS")

    if not hotspots:
        empty_res = FirmsResponse(
            mine_id=mine_id,
            mine_name=mine_name,
            latitude=mine_lat,
            longitude=mine_lon,
            source="NASA FIRMS",
            satellite_source=active_source,
            radius_km=active_radius,
            bounding_box=bbox_dict,
            lookback_days=active_lookback,
            hotspot_count=0,
            hotspots=[],
            status="no_observations",
            message=f"No active surface thermal anomalies / fires detected within {active_radius:.1f} km radius in the past {active_lookback} day(s).",
            last_updated=now_iso
        )
        _firms_cache[cache_key] = (now, empty_res)
        return empty_res

    live_res = FirmsResponse(
        mine_id=mine_id,
        mine_name=mine_name,
        latitude=mine_lat,
        longitude=mine_lon,
        source="NASA FIRMS",
        satellite_source=active_source,
        radius_km=active_radius,
        bounding_box=bbox_dict,
        lookback_days=active_lookback,
        hotspot_count=len(hotspots),
        hotspots=hotspots,
        status="live_observations",
        message=f"Detected {len(hotspots)} active surface thermal anomal{'ies' if len(hotspots) > 1 else 'y'} within {active_radius:.1f} km of {mine_name}.",
        last_updated=now_iso
    )
    _firms_cache[cache_key] = (now, live_res)
    return live_res


def clear_firms_cache():
    """Utility to clear in-memory FIRMS cache (used in tests and refresh actions)."""
    global _firms_cache
    _firms_cache.clear()
