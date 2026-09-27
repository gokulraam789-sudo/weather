"""
Transparent, rule-based advisory engine.

Deliberately simple and inspectable (per the project spec: "Initially use a
transparent rule-based advisory engine"). Each rule is a plain if/elif, so a
judge or agriculture officer can read exactly why a recommendation was made.
"""

from typing import Dict, List, Tuple

STAGE_NOTES: Dict[str, str] = {
    "Flowering": "Flowering stage is sensitive to waterlogging and moisture stress alike — monitor closely.",
    "Grain filling": "Grain filling benefits from steady moisture; avoid both drought stress and waterlogging.",
    "Nursery": "Nursery beds are vulnerable to both heavy rain damage and drying out.",
    "Transplanting": "Avoid transplanting into waterlogged or heavily saturated beds.",
    "Tillering": "Adequate but not excess moisture supports tiller development.",
    "Sowing": "Field conditions should be workable and not waterlogged before sowing.",
    "Pegging": "Pegging needs friable, moist (not saturated) soil.",
    "Pod development": "Consistent soil moisture supports pod fill; avoid moisture stress.",
    "Maturity": "Reduce irrigation ahead of harvest; heavy rain risks lodging.",
    "Vegetative": "Vegetative growth tolerates moderate moisture variation.",
    "Tasseling": "Tasseling is a critical moisture-sensitive window.",
    "Fruit set": "Fruit set is sensitive to sudden moisture swings — irrigate evenly if dry.",
    "Harvest": "Avoid harvest operations during heavy rain risk windows.",
    "Squaring": "Squaring stage responds well to steady, moderate moisture.",
    "Boll formation": "Boll formation needs consistent moisture; heavy rain risks boll rot.",
    "Boll opening": "Heavy rain during boll opening can degrade lint quality — plan harvest timing accordingly.",
}


def build_advisory(rainfall: float, temp: float, rain_prob: float, stage: str) -> Tuple[str, List[str]]:
    """Returns (severity, notes) for the given weather + crop growth stage.
    severity is 'high' or 'normal'."""
    notes: List[str] = []
    severity = "normal"

    if rainfall > 50:
        severity = "high"
        notes.append("Heavy rainfall expected — avoid irrigation and confirm field drainage is clear.")
        notes.append("Postpone fertilizer application until rainfall subsides.")
    elif rainfall < 15 and temp > 32:
        severity = "high"
        notes.append("Low rainfall with high temperature — irrigation likely needed within 24–48 hours.")
    elif rainfall > 38:
        notes.append("Suitable moisture for transplanting; ensure drainage in low-lying fields.")

    if rain_prob > 70:
        notes.append("High rain probability — postpone pesticide spraying to avoid wash-off.")

    if not notes:
        notes.append("Conditions are within a normal range for the coming period. Routine field operations can proceed.")

    stage_note = STAGE_NOTES.get(stage)
    if stage_note:
        notes.append(stage_note)

    return severity, notes


def risk_of(rainfall: float, temp: float, confidence: float) -> Dict[str, str]:
    """Matches the frontend's riskOf() thresholds exactly."""
    if rainfall > 50 or (rainfall < 15 and temp > 32):
        return {"label": "High Risk", "color": "#A6483A"}
    if rainfall > 40 or confidence < 70:
        return {"label": "Moderate Risk", "color": "#C08A3E"}
    return {"label": "Low Risk", "color": "#43714B"}
