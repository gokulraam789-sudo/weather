from fastapi import APIRouter, HTTPException
from app.data import demo_data
from app.models.schemas import PanchayatWeather

router = APIRouter(prefix="/api/panchayats", tags=["panchayats"])


@router.get("", response_model=list[PanchayatWeather], summary="List all panchayats in the current block")
def list_panchayats():
    return [PanchayatWeather(**p) for p in demo_data.PANCHAYATS]


@router.get("/{panchayat_id}", response_model=PanchayatWeather, summary="Get one panchayat by id")
def get_panchayat(panchayat_id: str):
    p = demo_data.find_panchayat(panchayat_id)
    if not p:
        raise HTTPException(status_code=404, detail=f"Panchayat '{panchayat_id}' not found")
    return PanchayatWeather(**p)
