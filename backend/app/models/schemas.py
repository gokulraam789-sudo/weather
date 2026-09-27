from typing import Optional, List
from pydantic import BaseModel, Field


class BlockWeather(BaseModel):
    district: str
    block: str
    rainfall: float
    temp: float
    humidity: float
    wind: float
    pressure: Optional[float] = None
    cloud_cover: Optional[float] = None
    rain_prob: float
    updated: str


class PanchayatWeather(BaseModel):
    id: str
    name: str
    lat: float
    lng: float
    rainfall: float
    temp: float
    humidity: float
    wind: float
    rain_prob: float
    confidence: float
    historical_avg: float
    elevation: Optional[float] = None
    slope: Optional[str] = None
    land_cover: Optional[str] = None
    terrain: Optional[str] = None


class PredictionRange(BaseModel):
    low: float
    high: float
    uncertainty: float


class PredictRequest(BaseModel):
    panchayat_id: str = Field(..., description="Panchayat id, e.g. 'kariyapatti'")
    block_rainfall: Optional[float] = Field(
        None, description="Override the current block-level rainfall used as model input (mm)"
    )


class PredictResponse(BaseModel):
    panchayat_id: str
    rainfall: float
    temp: float
    humidity: float
    wind: float
    rain_prob: float
    confidence: float
    range: PredictionRange
    model_version: str


class AdvisoryRequest(BaseModel):
    panchayat_id: str
    crop: str
    stage: str


class AdvisoryResponse(BaseModel):
    panchayat_id: str
    crop: str
    stage: str
    severity: str
    notes: List[str]


class WhatIfRequest(BaseModel):
    panchayat_id: str
    scenario: float = Field(1.0, description="Rainfall multiplier: 1.0 normal, 1.4 moderate, 2.0 extreme")
    crop: Optional[str] = None
    stage: Optional[str] = None


class WhatIfResponse(BaseModel):
    panchayat_id: str
    scenario: float
    rainfall: float
    severity: str
    notes: List[str]


class ForecastPerformancePoint(BaseModel):
    date: str
    predicted: float
    observed: float
    error: float


class ForecastPerformanceResponse(BaseModel):
    panchayat_id: str
    points: List[ForecastPerformancePoint]
    mae: float
    rmse: float
