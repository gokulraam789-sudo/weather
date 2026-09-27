from fastapi import APIRouter, HTTPException, Query
from app.data import demo_data
from app.models.schemas import BlockWeather, PanchayatWeather

router = APIRouter(prefix="/api/weather", tags=["weather"])


@router.get("/block", response_model=BlockWeather, summary="Current Block-level weather (IMD, simulated)")
def get_block_weather():
    return BlockWeather(**demo_data.BLOCK)


@router.get("/panchayat", response_model=PanchayatWeather, summary="Current Panchayat-level weather")
def get_panchayat_weather(
    panchayat_id: str = Query(..., description="e.g. 'kariyapatti'"),
):
    p = demo_data.find_panchayat(panchayat_id)
    if not p:
        raise HTTPException(status_code=404, detail=f"Panchayat '{panchayat_id}' not found")
    return PanchayatWeather(**p)
