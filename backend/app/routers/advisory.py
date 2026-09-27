from fastapi import APIRouter, HTTPException, Query
from app.data import demo_data
from app.models.schemas import AdvisoryResponse
from app.services.advisory import build_advisory

router = APIRouter(prefix="/api/advisory", tags=["advisory"])


@router.get("", response_model=AdvisoryResponse, summary="Get the crop advisory for a Panchayat's current weather")
def get_advisory(
    panchayat_id: str = Query(...),
    crop: str = Query(..., description="e.g. 'Rice (Paddy)'"),
    stage: str = Query(..., description="e.g. 'Flowering'"),
):
    p = demo_data.find_panchayat(panchayat_id)
    if not p:
        raise HTTPException(status_code=404, detail=f"Panchayat '{panchayat_id}' not found")
    if crop not in demo_data.CROPS:
        raise HTTPException(status_code=400, detail=f"Unknown crop '{crop}'. Valid: {list(demo_data.CROPS)}")
    if stage not in demo_data.CROPS[crop]:
        raise HTTPException(status_code=400, detail=f"Unknown stage '{stage}' for {crop}. Valid: {demo_data.CROPS[crop]}")

    severity, notes = build_advisory(p["rainfall"], p["temp"], p["rain_prob"], stage)
    return AdvisoryResponse(panchayat_id=panchayat_id, crop=crop, stage=stage, severity=severity, notes=notes)
