"""
Weather Service: Real-Time Weather Integration via Weatherstack API with Offline SQLite Fallback.
Provides normalized meteorological telemetry for MOIL mining concessions:
- Temperature (°C)
- Humidity (%)
- Precipitation / Rainfall (mm)
- Wind Speed (km/h)
- Pressure (mb)
- Weather Description
- In-memory short-term cache (10 min TTL)
- Graceful offline fallback to SQLite `weather_observations`
"""
import os
import time
import json
import logging
import urllib.request
import urllib.error
from datetime import datetime, timezone
from typing import Dict, Any, Optional, Tuple, List
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database.models import Mine, WeatherObservation

logger = logging.getLogger("weather_service")

# In-memory short-term cache: {mine_id: (timestamp_cached, WeatherData)}
# 10 minutes cache TTL for live data; 60 seconds for fallback
_LIVE_CACHE_TTL_SECONDS = 600
_FALLBACK_CACHE_TTL_SECONDS = 60
_weather_cache: Dict[str, Tuple[float, "WeatherResponse"]] = {}


class WeatherResponse(BaseModel):
    mine_id: str
    mine_name: str
    latitude: float
    longitude: float
    source: str = Field(description="LIVE — Weatherstack or FALLBACK — Local Database")
    data_source_label: str = Field(description="Display label for UI provenance")
    is_live: bool = Field(description="True if live Weatherstack, False if local fallback")
    temperature_c: float
    humidity_pct: float
    precipitation_mm: float
    wind_speed_kmh: float
    pressure_mb: float
    weather_description: str
    weather_icons: List[str] = []
    observation_time: str
    last_updated: str
    soil_moisture_pct: float
    flood_risk_index: str = "LOW"
    weather_trend: str = "Stable Conditions"

    model_config = {"populate_by_name": True}


def _get_api_key() -> Optional[str]:
    """Retrieves Weatherstack API key strictly from environment variable."""
    key = os.getenv("WEATHERSTACK_API_KEY", "").strip()
    return key if key else None


def _calculate_flood_risk(rainfall_mm: float) -> str:
    """Calculates operational flood risk index from precipitation."""
    if rainfall_mm >= 45.0:
        return "HIGH"
    elif rainfall_mm >= 20.0:
        return "MODERATE"
    return "LOW"


def _build_fallback_weather(
    mine_id: str,
    mine_name: str,
    lat: float,
    lng: float,
    db: Optional[Session] = None
) -> WeatherResponse:
    """Builds normalized weather response from local SQLite database."""
    latest_wx = None
    if db is not None:
        try:
            latest_wx = db.query(WeatherObservation).filter(
                WeatherObservation.mine_id == mine_id
            ).order_by(WeatherObservation.observed_at.desc()).first()
        except Exception as e:
            logger.warning(f"Error querying local weather for {mine_id}: {e}")

    now_iso = datetime.now(timezone.utc).isoformat()

    if latest_wx:
        rainfall = float(latest_wx.rainfall_mm) if latest_wx.rainfall_mm is not None else 8.5
        soil_m = float(latest_wx.soil_moisture_pct) if latest_wx.soil_moisture_pct is not None else 32.0
        temp = float(latest_wx.ambient_temp_c) if latest_wx.ambient_temp_c is not None else 29.5
        humidity = float(latest_wx.humidity_pct) if latest_wx.humidity_pct is not None else 65.0
        wind = float(latest_wx.wind_speed_kmh) if latest_wx.wind_speed_kmh is not None else 15.0
        flood = latest_wx.flood_risk_index or _calculate_flood_risk(rainfall)
        obs_time = latest_wx.observed_at.strftime("%H:%M UTC") if latest_wx.observed_at else "18:00 UTC"
        desc = "Monsoon Surge / Rain Event" if rainfall >= 25.0 else "Partly Cloudy / Normal Extraction Conditions"
    else:
        rainfall = 54.2 if mine_id == "MINE_BALAGHAT_01" else 8.5
        soil_m = 58.4 if mine_id == "MINE_BALAGHAT_01" else 30.0
        temp = 34.2 if mine_id == "MINE_BALAGHAT_01" else 29.5
        humidity = 72.0 if mine_id == "MINE_BALAGHAT_01" else 65.0
        wind = 16.0 if mine_id == "MINE_BALAGHAT_01" else 14.0
        flood = "MODERATE_HIGH" if mine_id == "MINE_BALAGHAT_01" else _calculate_flood_risk(rainfall)
        obs_time = "18:00 UTC"
        desc = "Monsoon Front Approaching" if mine_id == "MINE_BALAGHAT_01" else "Partly Cloudy / Normal Extraction Conditions"

    weather_trend = "Monsoon Front Approaching" if (mine_id == "MINE_BALAGHAT_01" or rainfall >= 25.0) else "Stable Conditions"

    return WeatherResponse(
        mine_id=mine_id,
        mine_name=mine_name,
        latitude=lat,
        longitude=lng,
        source="FALLBACK — Local Database",
        data_source_label="Data Source: Local Simulation / Offline Fallback",
        is_live=False,
        temperature_c=temp,
        humidity_pct=humidity,
        precipitation_mm=rainfall,
        wind_speed_kmh=wind,
        pressure_mb=1013.0,
        weather_description=desc,
        weather_icons=[],
        observation_time=obs_time,
        last_updated=now_iso,
        soil_moisture_pct=soil_m,
        flood_risk_index=flood,
        weather_trend=weather_trend
    )


def fetch_weatherstack_live(
    lat: float,
    lng: float,
    api_key: str,
    timeout_seconds: float = 2.5
) -> Optional[Dict[str, Any]]:
    """
    Calls Weatherstack API using mine coordinates.
    Never exposes or logs the API key.
    Uses standard HTTP as required by Weatherstack free tier.
    """
    query_param = f"{lat:.4f},{lng:.4f}"
    url = f"http://api.weatherstack.com/current?access_key={api_key}&query={query_param}&units=m"

    req = urllib.request.Request(
        url,
        headers={"User-Agent": "MOIL-Mining-Platform/1.0", "Accept": "application/json"}
    )

    try:
        with urllib.request.urlopen(req, timeout=timeout_seconds) as response:
            if response.status != 200:
                logger.warning(f"Weatherstack responded with HTTP status {response.status}")
                return None
            raw = response.read().decode("utf-8")
            data = json.loads(raw)

            # Check for Weatherstack application-level error response
            if not data or data.get("success") is False or "error" in data:
                err_info = data.get("error", {}).get("info", "Unknown Weatherstack API error")
                logger.warning(f"Weatherstack API error: {err_info}")
                return None

            if "current" not in data:
                logger.warning("Weatherstack response missing 'current' payload")
                return None

            return data
    except urllib.error.HTTPError as e:
        logger.warning(f"Weatherstack HTTP error: {e.code}")
        return None
    except urllib.error.URLError as e:
        logger.warning(f"Weatherstack network connection error: {e.reason}")
        return None
    except TimeoutError:
        logger.warning(f"Weatherstack request timed out after {timeout_seconds}s")
        return None
    except Exception as e:
        logger.warning(f"Unexpected Weatherstack request error: {type(e).__name__}")
        return None


def get_weather_for_mine(
    mine_id: str,
    db: Optional[Session] = None,
    force_refresh: bool = False
) -> WeatherResponse:
    """
    High-level entrypoint:
    1. Resolves mine coordinates from DB or default registry.
    2. Checks in-memory cache for recent responses.
    3. Attempts live Weatherstack query if WEATHERSTACK_API_KEY is configured.
    4. Automatically falls back to SQLite weather_observations on any failure.
    """
    # 1. Resolve Mine Info
    mine_name = "MOIL Concession"
    lat = 21.8129
    lng = 80.1835

    if db is not None:
        try:
            m = db.query(Mine).filter(Mine.id == mine_id).first()
            if m:
                mine_name = m.name
                lat = float(m.latitude)
                lng = float(m.longitude)
        except Exception as e:
            logger.warning(f"Could not load mine details for {mine_id}: {e}")
    else:
        # Fallback coordinate lookup
        coords_map = {
            "MINE_BALAGHAT_01": ("Balaghat Manganese Concession", 21.8129, 80.1835),
            "MINE_GUMGAON_02": ("Gumgaon Manganese Mine", 21.3854, 78.9812),
            "MINE_TIRODI_03": ("Tirodi Manganese Mine", 21.6836, 79.7247),
            "MINE_DONGRI_04": ("Dongri Buzurg Mine", 21.5500, 79.6833),
            "MINE_KANDRI_05": ("Kandri Manganese Mine", 21.4167, 79.2667),
            "MINE_MANSAR_06": ("Mansar Manganese Mine", 21.4000, 79.2833),
            "MINE_CHIKLA_07": ("Chikla Manganese Mine", 21.5667, 79.7667),
            "MINE_UKWA_08": ("Ukwa Manganese Mine", 21.9667, 80.4667),
        }
        if mine_id in coords_map:
            mine_name, lat, lng = coords_map[mine_id]

    # 2. Check Cache
    now = time.time()
    if not force_refresh and mine_id in _weather_cache:
        cached_time, cached_res = _weather_cache[mine_id]
        ttl = _LIVE_CACHE_TTL_SECONDS if cached_res.is_live else _FALLBACK_CACHE_TTL_SECONDS
        if now - cached_time < ttl:
            return cached_res

    # 3. Attempt Live Weatherstack Call
    api_key = _get_api_key()
    if api_key:
        try:
            live_data = fetch_weatherstack_live(lat=lat, lng=lng, api_key=api_key)
        except Exception as e:
            logger.warning(f"Unexpected error executing fetch_weatherstack_live: {type(e).__name__}")
            live_data = None

        if live_data and "current" in live_data:
            current = live_data["current"]
            temp_c = float(current.get("temperature", 28.0))
            humidity = float(current.get("humidity", 65.0))
            precip_mm = float(current.get("precip", 0.0))
            wind_kmh = float(current.get("wind_speed", 12.0))
            pressure = float(current.get("pressure", 1012.0))
            descriptions = current.get("weather_descriptions", ["Clear"])
            desc_str = ", ".join(descriptions) if isinstance(descriptions, list) else str(descriptions)
            icons = current.get("weather_icons", [])
            obs_time = str(current.get("observation_time", "Live"))
            now_iso = datetime.now(timezone.utc).isoformat()

            # Estimate soil moisture consistent with project feature engineering
            soil_moisture = min(72.0, max(18.0, round(24.0 + (precip_mm * 0.65), 1)))
            flood_risk = _calculate_flood_risk(precip_mm)

            live_res = WeatherResponse(
                mine_id=mine_id,
                mine_name=mine_name,
                latitude=lat,
                longitude=lng,
                source="LIVE — Weatherstack",
                data_source_label="Data Source: Weatherstack",
                is_live=True,
                temperature_c=temp_c,
                humidity_pct=humidity,
                precipitation_mm=precip_mm,
                wind_speed_kmh=wind_kmh,
                pressure_mb=pressure,
                weather_description=desc_str,
                weather_icons=icons,
                observation_time=obs_time,
                last_updated=now_iso,
                soil_moisture_pct=soil_moisture,
                flood_risk_index=flood_risk,
                weather_trend="Live Satellite & Ground Observation"
            )

            _weather_cache[mine_id] = (now, live_res)
            return live_res

    # 4. Fallback to Local Database
    fallback_res = _build_fallback_weather(
        mine_id=mine_id,
        mine_name=mine_name,
        lat=lat,
        lng=lng,
        db=db
    )
    _weather_cache[mine_id] = (now, fallback_res)
    return fallback_res


def clear_weather_cache():
    """Utility to clear cache (used in tests and mine re-indexing)."""
    global _weather_cache
    _weather_cache.clear()
