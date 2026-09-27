/**
 * Connection layer between the React frontend and the FastAPI backend.
 *
 * Every function here calls a real endpoint on the backend and converts its
 * snake_case response fields (rain_prob, historical_avg, land_cover, ...)
 * into the camelCase shape the frontend already uses (rainProb,
 * historicalAvg, landCover, ...), so nothing else in the app needs to change
 * field names when you switch a page over from data.js to this file.
 */

// ---------------------------------------------------------------------
// Base URL resolution
// ---------------------------------------------------------------------
//
// - If VITE_API_BASE_URL is set (in a .env file, e.g.
//   VITE_API_BASE_URL=http://localhost:8000), that always wins.
// - Otherwise, if the page is served from a GitHub Codespaces forwarded
//   port (hostname ending in -<port>.app.github.dev), we swap the port
//   number in the hostname to 8000 automatically — this is exactly the
//   pattern Codespaces uses (e.g. ...-5173.app.github.dev becomes
//   ...-8000.app.github.dev), so the frontend finds the backend without
//   any manual configuration inside a Codespace.
// - Otherwise, fall back to plain localhost for local dev.
function resolveBaseUrl() {
  const envUrl = import.meta.env?.VITE_API_BASE_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");

  if (typeof window !== "undefined") {
    const { hostname, protocol } = window.location;
    if (hostname.endsWith(".app.github.dev")) {
      const swapped = hostname.replace(/-\d+\.app\.github\.dev$/, "-8000.app.github.dev");
      return `${protocol}//${swapped}`;
    }
  }
  return "http://localhost:8000";
}

export const API_BASE_URL = resolveBaseUrl();

// ---------------------------------------------------------------------
// Low-level request helper
// ---------------------------------------------------------------------

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      /* response wasn't JSON — keep statusText */
    }
    throw new Error(`API ${res.status} on ${path}: ${detail}`);
  }
  return res.json();
}

// ---------------------------------------------------------------------
// Field-name normalizers (backend snake_case -> frontend camelCase)
// ---------------------------------------------------------------------

export function normalizeBlock(b) {
  return {
    district: b.district,
    block: b.block,
    center: b.center ? [b.center.lat, b.center.lng] : undefined,
    rainfall: b.rainfall,
    temp: b.temp,
    humidity: b.humidity,
    wind: b.wind,
    pressure: b.pressure,
    cloudCover: b.cloud_cover,
    rainProb: b.rain_prob,
    updated: b.updated,
  };
}

export function normalizePanchayat(p) {
  return {
    id: p.id,
    name: p.name,
    lat: p.lat,
    lng: p.lng,
    rainfall: p.rainfall,
    temp: p.temp,
    humidity: p.humidity,
    wind: p.wind,
    rainProb: p.rain_prob,
    confidence: p.confidence,
    historicalAvg: p.historical_avg,
    elevation: p.elevation,
    slope: p.slope,
    landCover: p.land_cover,
    terrain: p.terrain,
  };
}

// ---------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------

export async function fetchBlockWeather() {
  return normalizeBlock(await request("/api/weather/block"));
}

export async function fetchPanchayats() {
  const list = await request("/api/panchayats");
  return list.map(normalizePanchayat);
}

export async function fetchPanchayat(panchayatId) {
  return normalizePanchayat(await request(`/api/panchayats/${panchayatId}`));
}

export async function predictPanchayat(panchayatId, blockRainfall) {
  const body = { panchayat_id: panchayatId };
  if (blockRainfall != null) body.block_rainfall = blockRainfall;

  const r = await request("/api/predict", { method: "POST", body: JSON.stringify(body) });
  return {
    panchayatId: r.panchayat_id,
    rainfall: r.rainfall,
    temp: r.temp,
    humidity: r.humidity,
    wind: r.wind,
    rainProb: r.rain_prob,
    confidence: r.confidence,
    range: { low: r.range.low, high: r.range.high, uncertainty: r.range.uncertainty },
    modelVersion: r.model_version,
  };
}

export async function fetchAdvisory(panchayatId, crop, stage) {
  const params = new URLSearchParams({ panchayat_id: panchayatId, crop, stage });
  const r = await request(`/api/advisory?${params.toString()}`);
  return { panchayatId: r.panchayat_id, crop: r.crop, stage: r.stage, severity: r.severity, notes: r.notes };
}

export async function runWhatIf(panchayatId, scenario, crop, stage) {
  const body = { panchayat_id: panchayatId, scenario };
  if (crop) body.crop = crop;
  if (stage) body.stage = stage;

  const r = await request("/api/what-if", { method: "POST", body: JSON.stringify(body) });
  return {
    panchayatId: r.panchayat_id,
    scenario: r.scenario,
    rainfall: r.rainfall,
    severity: r.severity,
    notes: r.notes,
  };
}

export async function fetchForecastPerformance(panchayatId, days = 7) {
  const params = new URLSearchParams({ panchayat_id: panchayatId, days: String(days) });
  const r = await request(`/api/forecast-performance?${params.toString()}`);
  return {
    panchayatId: r.panchayat_id,
    points: r.points.map((pt) => ({ date: pt.date, predicted: pt.predicted, observed: pt.observed, error: pt.error })),
    mae: r.mae,
    rmse: r.rmse,
  };
}