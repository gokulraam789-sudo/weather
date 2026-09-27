/* ------------------------------------------------------------------ */
/* CENTRAL DEMO DATASET                                                 */
/* Everything here is clearly-labelled simulated/demo data standing in  */
/* for the real IMD / Bhuvan / NASA POWER / data.gov.in feeds described */
/* in the project spec. Swap these constants for fetch() calls to the   */
/* FastAPI backend (see comments) when that layer exists.               */
/* ------------------------------------------------------------------ */

export const DISTRICT = "Krishnagiri";

export const BLOCK = {
  district: "Krishnagiri",
  block: "Hosur",
  center: [12.7409, 77.8253], // approx. Hosur, Krishnagiri district, TN
  rainfall: 32.0,
  temp: 28.4,
  humidity: 78,
  wind: 12.6,
  pressure: 1008,
  cloudCover: 62,
  rainProb: 65,
  updated: "9 May 2026, 10:00 AM",
};

// cx/cy = schematic canvas position (760x480) used by the dashboard's
// inline SVG map. lat/lng = approximate geographic position used by the
// Leaflet map on the Map View page (small offsets around Hosur).
export const PANCHAYATS = [
  { id: "sundarpur", name: "Sundarpur", cx: 150, cy: 105, lat: 12.812, lng: 77.760, seed: 0.4, rainfall: 52, temp: 27.8, humidity: 80, wind: 13.1, rainProb: 76, confidence: 79, historicalAvg: 47, elevation: 61, slope: "Moderate (6-10%)", landCover: "Mixed forest / cropland", terrain: "Upland, forest fringe" },
  { id: "shivnapur", name: "Shivnapur", cx: 340, cy: 88, lat: 12.803, lng: 77.834, seed: 1.1, rainfall: 28, temp: 29.1, humidity: 70, wind: 11.4, rainProb: 48, confidence: 91, historicalAvg: 30, elevation: 34, slope: "Flat (0-2%)", landCover: "Cropland", terrain: "Flat, cropland" },
  { id: "anandpur1", name: "Anandpur", cx: 500, cy: 95, lat: 12.798, lng: 77.902, seed: 2.0, rainfall: 25, temp: 29.4, humidity: 66, wind: 10.8, rainProb: 44, confidence: 95, historicalAvg: 27, elevation: 29, slope: "Flat (0-2%)", landCover: "Cropland", terrain: "Flat, cropland" },
  { id: "devgaon", name: "Devgaon", cx: 620, cy: 145, lat: 12.766, lng: 77.941, seed: 2.7, rainfall: 18, temp: 30.0, humidity: 58, wind: 9.6, rainProb: 33, confidence: 66, historicalAvg: 24, elevation: 22, slope: "Flat (0-2%)", landCover: "Sparse vegetation", terrain: "Flat, sparse cover" },
  { id: "basantpur", name: "Basantpur", cx: 105, cy: 235, lat: 12.751, lng: 77.751, seed: 3.4, rainfall: 38, temp: 28.6, humidity: 73, wind: 12.0, rainProb: 61, confidence: 84, historicalAvg: 36, elevation: 44, slope: "Gentle (2-6%)", landCover: "Mixed cropland", terrain: "Gentle slope, mixed" },
  { id: "kariyapatti", name: "Kariyapatti", cx: 290, cy: 225, lat: 12.740, lng: 77.812, seed: 4.2, rainfall: 45, temp: 27.2, humidity: 82, wind: 10.3, rainProb: 72, confidence: 87, historicalAvg: 41, elevation: 52, slope: "Moderate (6-10%)", landCover: "Terraced cropland", terrain: "Hillside, terraced" },
  { id: "krishnapur", name: "Krishnapur", cx: 345, cy: 315, lat: 12.708, lng: 77.826, seed: 5.0, rainfall: 33, temp: 28.8, humidity: 69, wind: 11.7, rainProb: 57, confidence: 90, historicalAvg: 34, elevation: 38, slope: "Flat (0-2%)", landCover: "Cropland", terrain: "Flat, cropland" },
  { id: "rampur", name: "Rampur", cx: 450, cy: 278, lat: 12.716, lng: 77.874, seed: 5.7, rainfall: 30, temp: 29.0, humidity: 67, wind: 11.1, rainProb: 52, confidence: 88, historicalAvg: 31, elevation: 33, slope: "Flat (0-2%)", landCover: "Cropland", terrain: "Flat, cropland" },
  { id: "pratapgarh", name: "Pratapgarh", cx: 585, cy: 255, lat: 12.722, lng: 77.917, seed: 6.3, rainfall: 41, temp: 28.3, humidity: 74, wind: 12.4, rainProb: 66, confidence: 74, historicalAvg: 35, elevation: 47, slope: "Moderate (6-10%)", landCover: "Mixed cover", terrain: "Slope, mixed cover" },
  { id: "madhopur", name: "Madhopur", cx: 175, cy: 365, lat: 12.678, lng: 77.769, seed: 7.0, rainfall: 22, temp: 29.6, humidity: 60, wind: 9.2, rainProb: 38, confidence: 61, historicalAvg: 27, elevation: 20, slope: "Flat (0-2%)", landCover: "Low vegetation", terrain: "Flat, low vegetation" },
  { id: "bhagwanpur", name: "Bhagwanpur", cx: 390, cy: 395, lat: 12.665, lng: 77.841, seed: 7.8, rainfall: 55, temp: 27.5, humidity: 77, wind: 13.6, rainProb: 80, confidence: 87, historicalAvg: 48, elevation: 57, slope: "Moderate (6-10%)", landCover: "Riparian / mixed", terrain: "Slope, near stream" },
  { id: "gopalpur", name: "Gopalpur", cx: 540, cy: 380, lat: 12.671, lng: 77.891, seed: 8.5, rainfall: 48, temp: 27.9, humidity: 75, wind: 12.9, rainProb: 69, confidence: 77, historicalAvg: 43, elevation: 49, slope: "Moderate (6-10%)", landCover: "Mixed cover", terrain: "Slope, mixed cover" },
];

export const DEFAULT_PANCHAYAT_ID = "kariyapatti";

export const TREND = {
  sundarpur: [{ d: "Mon", block: 34, p: 48 }, { d: "Tue", block: 30, p: 55 }, { d: "Wed", block: 29, p: 44 }, { d: "Thu", block: 36, p: 58 }, { d: "Fri", block: 31, p: 50 }, { d: "Sat", block: 33, p: 52 }, { d: "Sun", block: 32, p: 52 }],
  shivnapur: [{ d: "Mon", block: 34, p: 25 }, { d: "Tue", block: 30, p: 31 }, { d: "Wed", block: 29, p: 22 }, { d: "Thu", block: 36, p: 33 }, { d: "Fri", block: 31, p: 26 }, { d: "Sat", block: 33, p: 29 }, { d: "Sun", block: 32, p: 28 }],
  anandpur1: [{ d: "Mon", block: 34, p: 22 }, { d: "Tue", block: 30, p: 28 }, { d: "Wed", block: 29, p: 20 }, { d: "Thu", block: 36, p: 29 }, { d: "Fri", block: 31, p: 24 }, { d: "Sat", block: 33, p: 26 }, { d: "Sun", block: 32, p: 25 }],
  devgaon: [{ d: "Mon", block: 34, p: 15 }, { d: "Tue", block: 30, p: 20 }, { d: "Wed", block: 29, p: 14 }, { d: "Thu", block: 36, p: 22 }, { d: "Fri", block: 31, p: 16 }, { d: "Sat", block: 33, p: 19 }, { d: "Sun", block: 32, p: 18 }],
  basantpur: [{ d: "Mon", block: 34, p: 33 }, { d: "Tue", block: 30, p: 40 }, { d: "Wed", block: 29, p: 31 }, { d: "Thu", block: 36, p: 43 }, { d: "Fri", block: 31, p: 35 }, { d: "Sat", block: 33, p: 38 }, { d: "Sun", block: 32, p: 38 }],
  kariyapatti: [{ d: "Mon", block: 34, p: 40 }, { d: "Tue", block: 30, p: 47 }, { d: "Wed", block: 29, p: 38 }, { d: "Thu", block: 36, p: 50 }, { d: "Fri", block: 31, p: 42 }, { d: "Sat", block: 33, p: 44 }, { d: "Sun", block: 32, p: 45 }],
  krishnapur: [{ d: "Mon", block: 34, p: 28 }, { d: "Tue", block: 30, p: 35 }, { d: "Wed", block: 29, p: 27 }, { d: "Thu", block: 36, p: 37 }, { d: "Fri", block: 31, p: 30 }, { d: "Sat", block: 33, p: 32 }, { d: "Sun", block: 32, p: 33 }],
  rampur: [{ d: "Mon", block: 34, p: 26 }, { d: "Tue", block: 30, p: 32 }, { d: "Wed", block: 29, p: 24 }, { d: "Thu", block: 36, p: 34 }, { d: "Fri", block: 31, p: 27 }, { d: "Sat", block: 33, p: 29 }, { d: "Sun", block: 32, p: 30 }],
  pratapgarh: [{ d: "Mon", block: 34, p: 36 }, { d: "Tue", block: 30, p: 43 }, { d: "Wed", block: 29, p: 34 }, { d: "Thu", block: 36, p: 46 }, { d: "Fri", block: 31, p: 38 }, { d: "Sat", block: 33, p: 40 }, { d: "Sun", block: 32, p: 41 }],
  madhopur: [{ d: "Mon", block: 34, p: 18 }, { d: "Tue", block: 30, p: 24 }, { d: "Wed", block: 29, p: 16 }, { d: "Thu", block: 36, p: 26 }, { d: "Fri", block: 31, p: 20 }, { d: "Sat", block: 33, p: 22 }, { d: "Sun", block: 32, p: 22 }],
  bhagwanpur: [{ d: "Mon", block: 34, p: 47 }, { d: "Tue", block: 30, p: 54 }, { d: "Wed", block: 29, p: 45 }, { d: "Thu", block: 36, p: 58 }, { d: "Fri", block: 31, p: 50 }, { d: "Sat", block: 33, p: 53 }, { d: "Sun", block: 32, p: 55 }],
  gopalpur: [{ d: "Mon", block: 34, p: 41 }, { d: "Tue", block: 30, p: 47 }, { d: "Wed", block: 29, p: 39 }, { d: "Thu", block: 36, p: 50 }, { d: "Fri", block: 31, p: 44 }, { d: "Sat", block: 33, p: 46 }, { d: "Sun", block: 32, p: 48 }],
};

export const TEMP_TREND = [
  { d: "Mon", block: 29.1, p: 27.6 }, { d: "Tue", block: 28.7, p: 27.1 },
  { d: "Wed", block: 29.4, p: 27.9 }, { d: "Thu", block: 28.2, p: 26.8 },
  { d: "Fri", block: 28.9, p: 27.4 }, { d: "Sat", block: 28.5, p: 27.0 },
  { d: "Sun", block: 28.4, p: 27.2 },
];

export const HUMIDITY_TREND = [
  { d: "Mon", block: 74, p: 80 }, { d: "Tue", block: 71, p: 84 },
  { d: "Wed", block: 76, p: 79 }, { d: "Thu", block: 69, p: 85 },
  { d: "Fri", block: 73, p: 81 }, { d: "Sat", block: 75, p: 83 },
  { d: "Sun", block: 78, p: 82 },
];

export const CONFIDENCE_TREND = [
  { d: "Mon", confidence: 82 }, { d: "Tue", confidence: 85 }, { d: "Wed", confidence: 80 },
  { d: "Thu", confidence: 88 }, { d: "Fri", confidence: 84 }, { d: "Sat", confidence: 86 },
  { d: "Sun", confidence: 87 },
];

// 7-day forecast strip used on the Panchayat Forecast page (matches the
// "May 9 - May 15" style shown in the SIH mockup).
export const SEVEN_DAY = [
  { date: "May 9", day: "Fri", rainfall: 45, tempHi: 28, tempLo: 21, rainProb: 82, cond: "rain" },
  { date: "May 10", day: "Sat", rainfall: 38, tempHi: 29, tempLo: 22, rainProb: 76, cond: "rain" },
  { date: "May 11", day: "Sun", rainfall: 22, tempHi: 29, tempLo: 22, rainProb: 68, cond: "cloud" },
  { date: "May 12", day: "Mon", rainfall: 12, tempHi: 31, tempLo: 23, rainProb: 65, cond: "cloud" },
  { date: "May 13", day: "Tue", rainfall: 8, tempHi: 32, tempLo: 23, rainProb: 63, cond: "sun" },
  { date: "May 14", day: "Wed", rainfall: 8, tempHi: 32, tempLo: 24, rainProb: 62, cond: "sun" },
  { date: "May 15", day: "Thu", rainfall: 5, tempHi: 33, tempLo: 24, rainProb: 62, cond: "sun" },
];

export const CROPS = {
  "Rice (Paddy)": ["Nursery", "Transplanting", "Tillering", "Flowering", "Grain filling"],
  Groundnut: ["Sowing", "Pegging", "Pod development", "Maturity"],
  Maize: ["Sowing", "Vegetative", "Tasseling", "Grain filling"],
  Tomato: ["Transplanting", "Flowering", "Fruit set", "Harvest"],
  Cotton: ["Sowing", "Squaring", "Boll formation", "Boll opening"],
};

export const DATA_SOURCES = [
  { label: "IMD API", status: "Connected", detail: "Block-level forecast & warnings" },
  { label: "Bhuvan (ISRO/NRSC)", status: "Connected", detail: "Panchayat boundaries & DEM" },
  { label: "NASA POWER", status: "Connected", detail: "Satellite-derived weather variables" },
  { label: "Open-Meteo", status: "Connected", detail: "Backup weather source" },
  { label: "data.gov.in", status: "Connected", detail: "Historical rainfall & crop datasets" },
];

export const PIPELINE_STAGES = [
  { key: "sources", label: "Data Sources", detail: "IMD, Satellite, GIS, Historical" },
  { key: "processing", label: "Data Processing", detail: "Cleaning, Feature Engineering" },
  { key: "model", label: "ML Model", detail: "Downscaling (XGBoost)" },
  { key: "prediction", label: "Prediction", detail: "Panchayat-level Weather" },
  { key: "output", label: "Output", detail: "Dashboard + Advisories" },
];

export const PIPELINE_STATUS = [
  { step: "Data Collection", status: "Completed", time: "9 May 2026, 08:00 AM" },
  { step: "Preprocessing", status: "Completed", time: "9 May 2026, 08:15 AM" },
  { step: "Model Inference", status: "Completed", time: "9 May 2026, 08:20 AM" },
  { step: "Database Update", status: "Completed", time: "9 May 2026, 08:25 AM" },
];

export const MODEL_INFO = {
  name: "XGBoost Regressor",
  trainingData: "Simulated (Demo)",
  features: 28,
  featureDesc: "28 (Weather + Geographic + Historical)",
  version: "v1.0",
  lastTrained: "8 May 2026",
};

export const PERFORMANCE_METRICS = { r2: 0.87, mae: 4.2, rmse: 7.8, accuracy: 87 };

export const FEATURE_IMPORTANCE = [
  { feature: "Block Rainfall", value: 0.32 },
  { feature: "Elevation", value: 0.18 },
  { feature: "Land Cover", value: 0.16 },
  { feature: "Temperature", value: 0.13 },
  { feature: "Humidity", value: 0.11 },
  { feature: "Historical Error", value: 0.06 },
  { feature: "Slope", value: 0.04 },
];

export const BASELINE_METRICS = { mae: 9.8, rmse: 12.4, r2: 0.31 };
export const AI_METRICS = { mae: 3.2, rmse: 4.6, r2: 0.87 };

// Historical daily records (Apr 28 - May 4, 2026) for the Historical Data page.
export const HISTORICAL_RECORDS = [
  { date: "Apr 28", rainfall: 12.4, temp: 27.8, humidity: 76, wind: 8.2, rainProb: 45 },
  { date: "Apr 29", rainfall: 8.7, temp: 28.1, humidity: 74, wind: 9.1, rainProb: 38 },
  { date: "Apr 30", rainfall: 25.3, temp: 27.0, humidity: 82, wind: 10.5, rainProb: 68 },
  { date: "May 1", rainfall: 18.6, temp: 26.5, humidity: 85, wind: 9.8, rainProb: 72 },
  { date: "May 2", rainfall: 20.9, temp: 26.9, humidity: 80, wind: 8.7, rainProb: 57 },
  { date: "May 3", rainfall: 14.8, temp: 27.6, humidity: 77, wind: 10.2, rainProb: 48 },
  { date: "May 4", rainfall: 22.7, temp: 26.8, humidity: 83, wind: 11.3, rainProb: 65 },
];

export const HISTORICAL_COMPARISON = [
  { label: "Apr 28", forecast: 14, thisPeriod: 12.4, lastYear: 20 },
  { label: "Apr 29", forecast: 10, thisPeriod: 8.7, lastYear: 15 },
  { label: "Apr 30", forecast: 22, thisPeriod: 25.3, lastYear: 18 },
  { label: "May 1", forecast: 20, thisPeriod: 18.6, lastYear: 24 },
  { label: "May 2", forecast: 19, thisPeriod: 20.9, lastYear: 16 },
  { label: "May 3", forecast: 16, thisPeriod: 14.8, lastYear: 19 },
  { label: "May 4", forecast: 20, thisPeriod: 22.7, lastYear: 21 },
];

export const AVG_TEMP_COMPARISON = { thisPeriod: 27.4, lastYear: 28.1 };

/* ------------------------------------------------------------------ */
/* Small shared helpers                                                */
/* ------------------------------------------------------------------ */

export function rainfallColor(mm) {
  if (mm >= 60) return "#123A54";
  if (mm >= 45) return "#1B587F";
  if (mm >= 30) return "#2E6F95";
  if (mm >= 15) return "#6FA3BE";
  return "#C3DBE5";
}

export function riskOf(p) {
  if (p.rainfall > 50 || (p.rainfall < 15 && p.temp > 32)) return { label: "High Risk", color: "#A6483A", bg: "#A6483A18" };
  if (p.rainfall > 40 || p.confidence < 70) return { label: "Moderate Risk", color: "#C08A3E", bg: "#C08A3E18" };
  return { label: "Low Risk", color: "#43714B", bg: "#43714B18" };
}

export function confidenceTier(c) {
  if (c >= 80) return { label: "High Confidence", color: "#6D5BA6" };
  if (c >= 65) return { label: "Medium Confidence", color: "#C08A3E" };
  return { label: "Low Confidence", color: "#A6483A" };
}

export function buildAdvisory(p, crop, stage) {
  const notes = [];
  let severity = "normal";
  if (p.rainfall > 50) {
    severity = "high";
    notes.push("Heavy rainfall expected — avoid irrigation and confirm field drainage is clear.");
    notes.push("Postpone fertilizer application until rainfall subsides.");
  } else if (p.rainfall < 15 && p.temp > 32) {
    severity = "high";
    notes.push("Low rainfall with high temperature — irrigation likely needed within 24–48 hours.");
  } else if (p.rainfall > 38) {
    notes.push("Suitable moisture for transplanting; ensure drainage in low-lying fields.");
  }
  if (p.rainProb > 70) {
    notes.push("High rain probability — postpone pesticide spraying to avoid wash-off.");
  }
  if (notes.length === 0) {
    notes.push("Conditions are within a normal range for the coming period. Routine field operations can proceed.");
  }
  const stageNote = {
    Flowering: "Flowering stage is sensitive to waterlogging and moisture stress alike — monitor closely.",
    "Grain filling": "Grain filling benefits from steady moisture; avoid both drought stress and waterlogging.",
    Nursery: "Nursery beds are vulnerable to both heavy rain damage and drying out.",
    Transplanting: "Avoid transplanting into waterlogged or heavily saturated beds.",
    Tillering: "Adequate but not excess moisture supports tiller development.",
    Sowing: "Field conditions should be workable and not waterlogged before sowing.",
    Pegging: "Pegging needs friable, moist (not saturated) soil.",
    "Pod development": "Consistent soil moisture supports pod fill; avoid moisture stress.",
    Maturity: "Reduce irrigation ahead of harvest; heavy rain risks lodging.",
    Vegetative: "Vegetative growth tolerates moderate moisture variation.",
    Tasseling: "Tasseling is a critical moisture-sensitive window.",
    "Fruit set": "Fruit set is sensitive to sudden moisture swings — irrigate evenly if dry.",
    Harvest: "Avoid harvest operations during heavy rain risk windows.",
    Squaring: "Squaring stage responds well to steady, moderate moisture.",
    "Boll formation": "Boll formation needs consistent moisture; heavy rain risks boll rot.",
    "Boll opening": "Heavy rain during boll opening can degrade lint quality — plan harvest timing accordingly.",
  }[stage];
  if (stageNote) notes.push(stageNote);
  return { severity, notes };
}

// Smooth organic blob outline for the dashboard's schematic SVG map.
export function makeBlobPath(cx, cy, base, seed, n = 16) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const ang = (i / n) * 2 * Math.PI - Math.PI / 2;
    const wobble =
      Math.sin(ang * 2 + seed * 1.7) * base * 0.12 +
      Math.sin(ang * 3 + seed * 2.3) * base * 0.06;
    const r = base + wobble;
    pts.push([cx + r * Math.cos(ang), cy + r * Math.sin(ang)]);
  }
  let d = `M ${(pts[0][0] + pts[n - 1][0]) / 2} ${(pts[0][1] + pts[n - 1][1]) / 2} `;
  for (let i = 0; i < n; i++) {
    const cur = pts[i];
    const next = pts[(i + 1) % n];
    const mid = [(cur[0] + next[0]) / 2, (cur[1] + next[1]) / 2];
    d += `Q ${cur[0]} ${cur[1]} ${mid[0]} ${mid[1]} `;
  }
  return d + "Z";
}
