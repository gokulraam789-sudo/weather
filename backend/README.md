# Panchayat Weather Intelligence System — Backend

FastAPI backend for the SIH 2026 prototype. Currently serves the **same
demo/simulated numbers already shown in the React frontend** (District:
Krishnagiri, Block: Hosur, 12 demo Panchayats) via a real REST API, so the
frontend can be switched from local constants to `fetch()` calls without the
numbers on screen changing.

There is **no trained ML model yet** — `/api/predict` uses a placeholder
ratio-based function (see `app/services/predictor.py`) that will be replaced
once the XGBoost training pipeline (next step) produces a serialized model.

## Project structure

```
backend/
├── requirements.txt
├── app/
│   ├── main.py              # FastAPI app, CORS, router mounting
│   ├── data/
│   │   └── demo_data.py     # mirrors the frontend's src/data.js
│   ├── models/
│   │   └── schemas.py       # Pydantic request/response models
│   ├── services/
│   │   ├── predictor.py     # downscaling logic (placeholder for XGBoost)
│   │   └── advisory.py      # rule-based crop advisory engine
│   └── routers/
│       ├── blocks.py        # GET /api/blocks
│       ├── panchayats.py    # GET /api/panchayats
│       ├── weather.py       # GET /api/weather/block, /api/weather/panchayat
│       ├── predict.py       # POST /api/predict
│       ├── advisory.py      # GET /api/advisory
│       ├── whatif.py        # POST /api/what-if
│       └── performance.py   # GET /api/forecast-performance
```

## Install & run

Requires Python 3.10+.

```bash
cd backend
pip install -r requirements.txt --break-system-packages   # drop the flag outside a Codespace/managed env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Then open **http://localhost:8000/docs** for interactive Swagger docs (every
endpoint below is listed there with a "Try it out" button), or
**http://localhost:8000/redoc** for a read-only reference view.

In a GitHub Codespace: run the command above, then use the "Ports" tab to
make port 8000 public (or at least visible to your frontend's port), the
same way you did for the Vite dev server.

## Connecting the frontend

CORS is already configured for `http://localhost:5173` and for any
`*.app.github.dev` Codespaces URL. If your frontend runs somewhere else, set
an environment variable before starting the server:

```bash
CORS_ALLOW_ORIGINS="https://your-frontend-url" uvicorn app.main:app --reload
```

In the frontend, add a small fetch wrapper (e.g. `src/api.js`) pointing at
`http://localhost:8000` (or the Codespace-forwarded backend URL) and swap
the frontend's `useLiveData()`/`data.js` constants for calls to it one page
at a time — the response shapes below match the frontend's existing field
names closely (snake_case instead of camelCase; adjust on the frontend side
or add a small mapping layer).

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/blocks` | List blocks (just Hosur, for now) |
| GET | `/api/blocks/{block_name}` | One block's current weather |
| GET | `/api/panchayats` | List all 12 demo Panchayats |
| GET | `/api/panchayats/{panchayat_id}` | One Panchayat's current weather |
| GET | `/api/weather/block` | Current Block-level weather |
| GET | `/api/weather/panchayat?panchayat_id=...` | Current Panchayat-level weather |
| POST | `/api/predict` | Downscale Block → Panchayat (body: `{"panchayat_id": "...", "block_rainfall": optional}`) |
| GET | `/api/advisory?panchayat_id=...&crop=...&stage=...` | Rule-based crop advisory |
| POST | `/api/what-if` | Rainfall scenario simulator (body: `{"panchayat_id", "scenario", "crop", "stage"}`) |
| GET | `/api/forecast-performance?panchayat_id=...&days=7` | Predicted vs observed + error, last N days |
| GET | `/` | Health check |

All Panchayat ids match the frontend exactly: `sundarpur`, `shivnapur`,
`anandpur1`, `devgaon`, `basantpur`, `kariyapatti`, `krishnapur`, `rampur`,
`pratapgarh`, `madhopur`, `bhagwanpur`, `gopalpur`.

Valid crops (for `/api/advisory` and `/api/what-if`): `Rice (Paddy)`,
`Groundnut`, `Maize`, `Tomato`, `Cotton` — each with its own valid growth
stages (see `app/data/demo_data.py::CROPS`).

## Verified working

I ran this server in a container and exercised every endpoint end-to-end
before handing it over — all returned `200 OK` with the expected demo
numbers, and a request for an unknown Panchayat correctly returned `404`.

## Next steps (per the original project roadmap)

1. **ML training pipeline** (`ml/` directory) — build the feature
   engineering + XGBoost training script using Pandas/Scikit-learn, produce
   sample CSVs, and serialize a model with Joblib.
2. Wire the trained model into `app/services/predictor.py`, replacing the
   placeholder ratio logic (the function signature is already set up for
   this — see the comment at the top of that file).
3. Swap the frontend's local `data.js` constants for `fetch()` calls to
   this API, one page at a time.
4. Add PostgreSQL/Supabase (`database/schema.sql`) so weather
   observations, predictions, and forecast errors persist instead of living
   only in memory.
