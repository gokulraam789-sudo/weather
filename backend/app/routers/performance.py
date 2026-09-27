from fastapi import APIRouter, HTTPException, Query
from app.data import demo_data
from app.models.schemas import ForecastPerformanceResponse, ForecastPerformancePoint

router = APIRouter(prefix="/api/forecast-performance", tags=["forecast-performance"])


@router.get(
    "",
    response_model=ForecastPerformanceResponse,
    summary="Predicted vs observed rainfall, and running error, for the last N days",
)
def get_forecast_performance(
    panchayat_id: str = Query(...),
    days: int = Query(7, ge=1, le=30),
):
    p = demo_data.find_panchayat(panchayat_id)
    if not p:
        raise HTTPException(status_code=404, detail=f"Panchayat '{panchayat_id}' not found")

    labels = demo_data.past_day_labels(days)
    predicted_series = demo_data.series(p["rainfall"], 10, p["seed"] * 41 + 3, days)
    observed_series = demo_data.series(p["rainfall"], 14, p["seed"] * 43 + 7, days)

    points = []
    abs_errors = []
    sq_errors = []
    for i, date in enumerate(labels):
        predicted = round(max(0.0, predicted_series[i]), 1)
        observed = round(max(0.0, observed_series[i]), 1)
        error = round(observed - predicted, 1)
        points.append(ForecastPerformancePoint(date=date, predicted=predicted, observed=observed, error=error))
        abs_errors.append(abs(error))
        sq_errors.append(error ** 2)

    mae = round(sum(abs_errors) / len(abs_errors), 2) if abs_errors else 0.0
    rmse = round((sum(sq_errors) / len(sq_errors)) ** 0.5, 2) if sq_errors else 0.0

    return ForecastPerformanceResponse(panchayat_id=panchayat_id, points=points, mae=mae, rmse=rmse)
