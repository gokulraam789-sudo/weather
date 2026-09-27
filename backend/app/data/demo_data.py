"""
Central demo dataset for the backend.

This mirrors src/data.js on the frontend so that once the React app is
switched from its local constants to fetch() calls against this API, the
numbers on screen do not change. Replace these in-memory dicts with real
database queries (see database/schema.sql) once IMD / Bhuvan / NASA POWER
integrations are in place.
"""

from datetime import datetime, timedelta

DISTRICT = "Krishnagiri"

BLOCK = {
    "district": "Krishnagiri",
    "block": "Hosur",
    "center": {"lat": 12.7409, "lng": 77.8253},
    "rainfall": 32.0,
    "temp": 28.4,
    "humidity": 78,
    "wind": 12.6,
    "pressure": 1008,
    "cloud_cover": 62,
    "rain_prob": 65,
    "updated": "2026-05-09T10:00:00",
}

# id, name, schematic canvas position (cx/cy, legacy - unused by API consumers),
# lat/lng (used for the real map), seed (used to derive repeatable demo
# variation), and the current predicted values for that panchayat.
PANCHAYATS = [
    {"id": "sundarpur", "name": "Sundarpur", "lat": 12.812, "lng": 77.760, "seed": 0.4,
     "rainfall": 52, "temp": 27.8, "humidity": 80, "wind": 13.1, "rain_prob": 76, "confidence": 79,
     "historical_avg": 47, "elevation": 61, "slope": "Moderate (6-10%)",
     "land_cover": "Mixed forest / cropland", "terrain": "Upland, forest fringe"},
    {"id": "shivnapur", "name": "Shivnapur", "lat": 12.803, "lng": 77.834, "seed": 1.1,
     "rainfall": 28, "temp": 29.1, "humidity": 70, "wind": 11.4, "rain_prob": 48, "confidence": 91,
     "historical_avg": 30, "elevation": 34, "slope": "Flat (0-2%)",
     "land_cover": "Cropland", "terrain": "Flat, cropland"},
    {"id": "anandpur1", "name": "Anandpur", "lat": 12.798, "lng": 77.902, "seed": 2.0,
     "rainfall": 25, "temp": 29.4, "humidity": 66, "wind": 10.8, "rain_prob": 44, "confidence": 95,
     "historical_avg": 27, "elevation": 29, "slope": "Flat (0-2%)",
     "land_cover": "Cropland", "terrain": "Flat, cropland"},
    {"id": "devgaon", "name": "Devgaon", "lat": 12.766, "lng": 77.941, "seed": 2.7,
     "rainfall": 18, "temp": 30.0, "humidity": 58, "wind": 9.6, "rain_prob": 33, "confidence": 66,
     "historical_avg": 24, "elevation": 22, "slope": "Flat (0-2%)",
     "land_cover": "Sparse vegetation", "terrain": "Flat, sparse cover"},
    {"id": "basantpur", "name": "Basantpur", "lat": 12.751, "lng": 77.751, "seed": 3.4,
     "rainfall": 38, "temp": 28.6, "humidity": 73, "wind": 12.0, "rain_prob": 61, "confidence": 84,
     "historical_avg": 36, "elevation": 44, "slope": "Gentle (2-6%)",
     "land_cover": "Mixed cropland", "terrain": "Gentle slope, mixed"},
    {"id": "kariyapatti", "name": "Kariyapatti", "lat": 12.740, "lng": 77.812, "seed": 4.2,
     "rainfall": 45, "temp": 27.2, "humidity": 82, "wind": 10.3, "rain_prob": 72, "confidence": 87,
     "historical_avg": 41, "elevation": 52, "slope": "Moderate (6-10%)",
     "land_cover": "Terraced cropland", "terrain": "Hillside, terraced"},
    {"id": "krishnapur", "name": "Krishnapur", "lat": 12.708, "lng": 77.826, "seed": 5.0,
     "rainfall": 33, "temp": 28.8, "humidity": 69, "wind": 11.7, "rain_prob": 57, "confidence": 90,
     "historical_avg": 34, "elevation": 38, "slope": "Flat (0-2%)",
     "land_cover": "Cropland", "terrain": "Flat, cropland"},
    {"id": "rampur", "name": "Rampur", "lat": 12.716, "lng": 77.874, "seed": 5.7,
     "rainfall": 30, "temp": 29.0, "humidity": 67, "wind": 11.1, "rain_prob": 52, "confidence": 88,
     "historical_avg": 31, "elevation": 33, "slope": "Flat (0-2%)",
     "land_cover": "Cropland", "terrain": "Flat, cropland"},
    {"id": "pratapgarh", "name": "Pratapgarh", "lat": 12.722, "lng": 77.917, "seed": 6.3,
     "rainfall": 41, "temp": 28.3, "humidity": 74, "wind": 12.4, "rain_prob": 66, "confidence": 74,
     "historical_avg": 35, "elevation": 47, "slope": "Moderate (6-10%)",
     "land_cover": "Mixed cover", "terrain": "Slope, mixed cover"},
    {"id": "madhopur", "name": "Madhopur", "lat": 12.678, "lng": 77.769, "seed": 7.0,
     "rainfall": 22, "temp": 29.6, "humidity": 60, "wind": 9.2, "rain_prob": 38, "confidence": 61,
     "historical_avg": 27, "elevation": 20, "slope": "Flat (0-2%)",
     "land_cover": "Low vegetation", "terrain": "Flat, low vegetation"},
    {"id": "bhagwanpur", "name": "Bhagwanpur", "lat": 12.665, "lng": 77.841, "seed": 7.8,
     "rainfall": 55, "temp": 27.5, "humidity": 77, "wind": 13.6, "rain_prob": 80, "confidence": 87,
     "historical_avg": 48, "elevation": 57, "slope": "Moderate (6-10%)",
     "land_cover": "Riparian / mixed", "terrain": "Slope, near stream"},
    {"id": "gopalpur", "name": "Gopalpur", "lat": 12.671, "lng": 77.891, "seed": 8.5,
     "rainfall": 48, "temp": 27.9, "humidity": 75, "wind": 12.9, "rain_prob": 69, "confidence": 77,
     "historical_avg": 43, "elevation": 49, "slope": "Moderate (6-10%)",
     "land_cover": "Mixed cover", "terrain": "Slope, mixed cover"},
]

DEFAULT_PANCHAYAT_ID = "kariyapatti"

CROPS = {
    "Rice (Paddy)": ["Nursery", "Transplanting", "Tillering", "Flowering", "Grain filling"],
    "Groundnut": ["Sowing", "Pegging", "Pod development", "Maturity"],
    "Maize": ["Sowing", "Vegetative", "Tasseling", "Grain filling"],
    "Tomato": ["Transplanting", "Flowering", "Fruit set", "Harvest"],
    "Cotton": ["Sowing", "Squaring", "Boll formation", "Boll opening"],
}

DATA_SOURCES = [
    {"label": "IMD API", "status": "Connected", "detail": "Block-level forecast & warnings"},
    {"label": "Bhuvan (ISRO/NRSC)", "status": "Connected", "detail": "Panchayat boundaries & DEM"},
    {"label": "NASA POWER", "status": "Connected", "detail": "Satellite-derived weather variables"},
    {"label": "Open-Meteo", "status": "Connected", "detail": "Backup weather source"},
    {"label": "data.gov.in", "status": "Connected", "detail": "Historical rainfall & crop datasets"},
]

PIPELINE_STATUS = [
    {"step": "Data Collection", "status": "Completed", "time": "2026-05-09T08:00:00"},
    {"step": "Preprocessing", "status": "Completed", "time": "2026-05-09T08:15:00"},
    {"step": "Model Inference", "status": "Completed", "time": "2026-05-09T08:20:00"},
    {"step": "Database Update", "status": "Completed", "time": "2026-05-09T08:25:00"},
]

MODEL_INFO = {
    "name": "XGBoost Regressor",
    "training_data": "Simulated (Demo)",
    "features": 28,
    "feature_desc": "28 (Weather + Geographic + Historical)",
    "version": "v1.0",
    "last_trained": "2026-05-08",
}

PERFORMANCE_METRICS = {"r2": 0.87, "mae": 4.2, "rmse": 7.8, "accuracy": 87}

FEATURE_IMPORTANCE = [
    {"feature": "Block Rainfall", "value": 0.32},
    {"feature": "Elevation", "value": 0.18},
    {"feature": "Land Cover", "value": 0.16},
    {"feature": "Temperature", "value": 0.13},
    {"feature": "Humidity", "value": 0.11},
    {"feature": "Historical Error", "value": 0.06},
    {"feature": "Slope", "value": 0.04},
]

BASELINE_METRICS = {"mae": 9.8, "rmse": 12.4, "r2": 0.31}
AI_METRICS = {"mae": 3.2, "rmse": 4.6, "r2": 0.87}


def find_panchayat(panchayat_id: str):
    return next((p for p in PANCHAYATS if p["id"] == panchayat_id), None)


def seeded_rand(seed: float):
    """Deterministic pseudo-random generator (mirrors data.js's seededRand),
    so the same seed always reproduces the same series."""
    s = int(abs(seed) * 9301 + 49297) % 233280
    if s <= 0:
        s += 233279
    state = {"s": s}

    def _rand():
        state["s"] = (state["s"] * 9301 + 49297) % 233280
        return state["s"] / 233280

    return _rand


def series(base: float, spread: float, seed: float, n: int):
    rand = seeded_rand(seed)
    out = []
    for i in range(n):
        drift = (rand() - 0.5) * spread
        import math
        wave = math.sin((i + seed) * 0.7) * spread * 0.35
        out.append(base + drift + wave)
    return out


def future_day_labels(n: int):
    weekdays = ["Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu"]  # starting 9 May 2026
    return [weekdays[i % 7] for i in range(n)]


def past_day_labels(n: int):
    end = datetime(2026, 5, 9)
    return [(end - timedelta(days=(n - 1 - i))).strftime("%b %-d") for i in range(n)]
