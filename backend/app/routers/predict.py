from fastapi import APIRouter, HTTPException
from app.data import demo_data
from app.models.schemas import PredictRequest, PredictResponse
from app.services.predictor import predict_panchayat

router = APIRouter(prefix="/api/predict", tags=["predict"])


@router.post("", response_model=PredictResponse, summary="Downscale Block weather to a specific Panchayat")
def predict(req: PredictRequest):
    panchayat = demo_data.find_panchayat(req.panchayat_id)
    if not panchayat:
        raise HTTPException(status_code=404, detail=f"Panchayat '{req.panchayat_id}' not found")

    result = predict_panchayat(panchayat, demo_data.BLOCK, req.block_rainfall)
    return PredictResponse(**result)
