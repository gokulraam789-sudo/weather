import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import blocks, panchayats, weather, predict, advisory, whatif, performance

app = FastAPI(
    title="Panchayat Weather Intelligence System API",
    description=(
        "Backend for the SIH 2026 prototype: downscales Block-level weather "
        "forecasts to Panchayat-level predictions and serves agro-meteorological "
        "advisories. All data is currently simulated/demo — see app/data/demo_data.py."
    ),
    version="0.1.0",
)

# Allow the React dev server (Vite on :5173, or a Codespaces forwarded port)
# to call this API from the browser. Tighten this list before any real deployment.
default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
extra_origins = os.getenv("CORS_ALLOW_ORIGINS", "")
allow_origins = default_origins + [o.strip() for o in extra_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_origin_regex=r"https://.*\.app\.github\.dev",  # GitHub Codespaces forwarded ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(blocks.router)
app.include_router(panchayats.router)
app.include_router(weather.router)
app.include_router(predict.router)
app.include_router(advisory.router)
app.include_router(whatif.router)
app.include_router(performance.router)


@app.get("/", tags=["health"], summary="Health check")
def root():
    return {"status": "ok", "service": "panchayat-weather-intelligence-backend", "docs": "/docs"}
