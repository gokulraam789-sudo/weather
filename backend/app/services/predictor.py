"""
Downscaling "model" service.

IMPORTANT: This module does NOT contain a trained ML model yet. It's a
placeholder that reproduces the same demo numbers the frontend already
shows, structured so the real model can be dropped in without changing any
router or schema. Once ml/training/train_model.py produces a serialized
XGBoost model (see ml/ directory, to be built next), replace the body of
`predict_panchayat()` below with:

    import joblib
    _model = joblib.load("ml/models/downscaling_model.joblib")

    def predict_panchayat(panchayat, block, block_rainfall_override=None):
        features = build_feature_vector(panchayat, block, block_rainfall_override)
        rainfall, temp, humidity, wind = _model.predict([features])[0]
        confidence = estimate_confidence(features)
        ...

For now, prediction = each panchayat's demo baseline, proportionally
rescaled if the caller supplies a different block_rainfall (so /predict
still responds sensibly to input changes even before the real model exists).
"""

from typing import Dict, Optional


def predict_panchayat(panchayat: Dict, block: Dict, block_rainfall_override: Optional[float] = None) -> Dict:
    block_rainfall = block["rainfall"] if block_rainfall_override is None else block_rainfall_override

    # Ratio-based stand-in for the real model: how much this panchayat's demo
    # rainfall differs from the demo block rainfall, applied to whatever
    # block rainfall was supplied. This is NOT the naive baseline described
    # in the project brief (which applies the block value unmodified to
    # every panchayat) — it is a slightly-smarter placeholder so the /predict
    # endpoint responds proportionally to changed inputs during development.
    ratio = panchayat["rainfall"] / block["rainfall"] if block["rainfall"] else 1.0
    rainfall = round(block_rainfall * ratio, 1)

    confidence = panchayat["confidence"]
    uncertainty = max(3, round(rainfall * (1 - confidence / 100) * 1.5))

    return {
        "panchayat_id": panchayat["id"],
        "rainfall": rainfall,
        "temp": panchayat["temp"],
        "humidity": panchayat["humidity"],
        "wind": panchayat["wind"],
        "rain_prob": panchayat["rain_prob"],
        "confidence": confidence,
        "range": {
            "low": max(0, rainfall - uncertainty),
            "high": rainfall + uncertainty,
            "uncertainty": uncertainty,
        },
        "model_version": "placeholder-v0 (no trained model yet)",
    }


def naive_baseline(panchayat: Dict, block: Dict) -> float:
    """The actual naive baseline from the project spec: block value applied
    uniformly to every panchayat. Used only for the model-vs-baseline
    comparison, never as the panchayat's own prediction."""
    return block["rainfall"]
