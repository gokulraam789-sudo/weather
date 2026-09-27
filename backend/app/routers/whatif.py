from fastapi import APIRouter, HTTPException
from app.data import demo_data
from app.models.schemas import WhatIfRequest, WhatIfResponse
from app.services.advisory import build_advisory

router = APIRouter(prefix="/api/what-if", tags=["what-if"])


@router.post("", response_model=WhatIfResponse, summary="Simulate a rainfall scenario (Normal / Moderate / Extreme)")
def what_if(req: WhatIfRequest):
    p = demo_data.find_panchayat(req.panchayat_id)
    if not p:
        raise HTTPException(status_code=404, detail=f"Panchayat '{req.panchayat_id}' not found")

    scenario_rainfall = round(p["rainfall"] * req.scenario)
    stage = req.stage or (demo_data.CROPS[req.crop][0] if req.crop in demo_data.CROPS else "Vegetative")
    severity, notes = build_advisory(scenario_rainfall, p["temp"], p["rain_prob"], stage)

    return WhatIfResponse(
        panchayat_id=req.panchayat_id,
        scenario=req.scenario,
        rainfall=scenario_rainfall,
        severity=severity,
        notes=notes,
    )
