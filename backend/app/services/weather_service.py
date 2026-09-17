"""
Re-export of weather_service for backend.app module hierarchy.
"""
from services.weather_service import (
    WeatherResponse,
    get_weather_for_mine,
    clear_weather_cache,
    fetch_weatherstack_live,
    _calculate_flood_risk,
    _build_fallback_weather,
)

__all__ = [
    "WeatherResponse",
    "get_weather_for_mine",
    "clear_weather_cache",
    "fetch_weatherstack_live",
    "_calculate_flood_risk",
    "_build_fallback_weather",
]
