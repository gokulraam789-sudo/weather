# Panchayat Weather Intelligence System — Frontend Prototype

Frontend dashboard for the SIH 2026 project "Downscaling of weather
forecast from Block level to Panchayat level." This is the **frontend
only** — it runs entirely on clearly-labelled demo/simulated data
(there is no backend call yet). District = Krishnagiri, Block = Hosur,
with 12 demo Panchayats.

## What's here

```
panchayat-frontend/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── src/
│   ├── main.jsx                 # React entry point
│   ├── App.jsx                  # router + sidebar layout
│   ├── data.js                  # ALL demo data + shared helpers (single source of truth)
│   ├── SelectionContext.jsx     # shared selected Panchayat / crop / stage state
│   ├── components/
│   │   ├── Sidebar.jsx          # left navigation (9 pages)
│   │   ├── Header.jsx           # top bar (title, status, user)
│   │   ├── PageShell.jsx        # page wrapper + Card/SectionLabel primitives
│   │   └── LocationBar.jsx      # District/Block/Panchayat selector row
│   ├── pages/
│   │   ├── Dashboard.jsx        # home: block vs panchayat cards, schematic map, charts
│   │   ├── MapView.jsx          # real Leaflet + OpenStreetMap map with layers & popups
│   │   ├── PanchayatForecast.jsx# 7-day forecast strip + current weather + confidence
│   │   ├── ChartsTrends.jsx     # rainfall/temp/humidity/confidence charts
│   │   ├── Advisories.jsx       # current advisory + crop-wise advisory tabs
│   │   ├── HistoricalData.jsx   # historical table + forecast-vs-actual comparison
│   │   ├── DataPipeline.jsx     # pipeline flow diagram + status + data sources
│   │   ├── ModelInfo.jsx        # model card, R² gauge, feature importance
│   │   └── Settings.jsx         # profile + system settings + help
│   └── index.css
└── README.md
```

## Install & run

You need Node.js 18+. From inside this folder:

```bash
npm install
npm run dev
```

Open the printed URL (usually `http://localhost:5173`).

Production build:

```bash
npm run build
npm run preview
```

## Design system

- Dark navy sidebar `#101B2D`, cream page background `#F4F5F2`, white cards
  with a hairline border `#E4E2D6`.
- Accent colors: Block/system blue `#2E6F95`, Panchayat/AI green `#43714B`,
  confidence purple `#6D5BA6`, warning amber `#C08A3E`, risk red `#A6483A`.
- Typography: IBM Plex Sans (UI text) + IBM Plex Mono (numeric values),
  loaded from Google Fonts in `index.html`.
- All data is clearly labelled "Simulated / Demo" per the SIH problem
  statement's requirement to never present fabricated data as real.

## What to try

- Navigate the 9 pages from the sidebar — the selected Panchayat, crop and
  growth stage are shared across pages via `SelectionContext`.
- **Map View** uses `react-leaflet` with real OpenStreetMap tiles centered
  on Hosur block, Krishnagiri district. Click a marker for a popup with
  prediction + confidence + risk, or toggle layers (rainfall / risk /
  temperature) in the side panel.
- **Advisories**: change crop + growth stage — the advisory text and the
  "Key Recommendation" box update using the same rule engine as the
  dashboard's What-if simulator.
- **Charts & Trends**: switch Panchayat to see the Block-vs-Panchayat bar
  chart and the humidity/temperature/confidence line charts update.

## Where the backend plugs in

Every constant in `src/data.js` (BLOCK, PANCHAYATS, TREND, MODEL_INFO,
PIPELINE_STATUS, HISTORICAL_RECORDS, etc.) is exactly where real
`fetch()` calls to the FastAPI backend will go:

```
GET  /api/blocks
GET  /api/panchayats
GET  /api/weather/block
GET  /api/weather/panchayat
POST /api/predict
GET  /api/advisory
GET  /api/forecast-performance
POST /api/what-if
```

## Known simplifications (intentional, for this stage)

- Panchayat locations on the Map View are approximate points around Hosur,
  not real GIS boundaries. Swap in real GeoJSON polygons from Bhuvan /
  Survey of India once available (react-leaflet supports `<GeoJSON>` directly).
- The Dashboard's inline SVG map uses procedurally generated organic
  blobs, kept as a fast schematic alternative to the real map.
- Historical "Crop Data" tab and several buttons (Download, Update
  Profile, View Technical Details, Contact Support) are UI placeholders —
  they render but don't yet call a backend.

## Next step

Build the FastAPI backend + XGBoost downscaling pipeline described in the
project spec, then replace the constants in `src/data.js` with real
`fetch()` calls.
