import React, { useState, useMemo, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";
import { MapContainer, TileLayer, Polygon, Tooltip as LeafletTooltip, ZoomControl, useMap } from "react-leaflet";
import { Delaunay } from "d3-delaunay";
import L from "leaflet";
import {
  CloudRain, Map as MapIcon, Sprout, Database, History as HistoryIcon,
  ChevronRight, Thermometer, Droplets, Wind, Gauge,
  AlertTriangle, CheckCircle2, RadioTower, SlidersHorizontal,
  X, Info, Cpu, RefreshCw, MapPinPlus
} from "lucide-react";
import PageShell, { Card } from "../components/PageShell.jsx";
import AddPanchayatModal from "../components/AddPanchayatModal.jsx";
import { useSelection } from "../SelectionContext.jsx";
import { useLiveData } from "../DataContext.jsx";
import {
  BLOCK, PANCHAYATS, TREND, TEMP_TREND, CONFIDENCE_TREND, CROPS,
  BASELINE_METRICS, AI_METRICS, rainfallColor, riskOf, confidenceTier,
  buildAdvisory,
} from "../data.js";

const FONT = "Arial, Helvetica, sans-serif";

const DATA_SOURCES = [
  { icon: CloudRain, label: "IMD Block Forecast" },
  { icon: Database, label: "Satellite Data (Cloud & Rain)" },
  { icon: MapIcon, label: "DEM & Terrain Data" },
  { icon: HistoryIcon, label: "Historical Weather Data" },
  { icon: Sprout, label: "Land Use / Land Cover" },
  { icon: MapIcon, label: "Panchayat Boundaries" },
];

// ---- helpers ----
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const round1 = (v) => Math.round(v * 10) / 10;
// stable number derived from a panchayat id (used so each place gets its own trend shape)
const hashId = (id) => [...String(id)].reduce((a, ch) => a + ch.charCodeAt(0), 0);

// Builds Voronoi cell polygons from each Panchayat's lat/lng so neighbouring
// regions share real borders — a stand-in for actual GeoJSON boundaries.
function computeVoronoiCells(points, padding = 0.025) {
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  const bounds = [
    Math.min(...lngs) - padding, // xmin
    Math.min(...lats) - padding, // ymin
    Math.max(...lngs) + padding, // xmax
    Math.max(...lats) + padding, // ymax
  ];
  const delaunay = Delaunay.from(points, (p) => p.lng, (p) => p.lat);
  const voronoi = delaunay.voronoi(bounds);
  return points.map((_, i) => {
    const cell = voronoi.cellPolygon(i);
    if (!cell) return null;
    return cell.map(([lng, lat]) => [lat, lng]); // Leaflet wants [lat, lng]
  });
}

// Adds Leaflet's real distance scale bar (replaces the old fake "X km" label)
function ScaleControl() {
  const map = useMap();
  useEffect(() => {
    const scale = L.control.scale({ position: "bottomleft", metric: true, imperial: false, maxWidth: 100 });
    scale.addTo(map);
    return () => scale.remove();
  }, [map]);
  return null;
}

// The whole metric — icon, label, and value — sits inside one colored card
// so each metric reads as a distinct block, not just a tinted icon.
// bg = card background, accent = icon/label accent color for that metric.
function MetricRow({ icon: Icon, label, value, unit, bg, accent }) {
  return (
    <div
      className="flex flex-col items-center gap-1 rounded-xl py-2.5 px-1.5"
      style={{ background: bg || "#F1F2ED" }}
    >
      <Icon size={17} style={{ color: accent || "#5B6472" }} strokeWidth={1.9} />
      <span className="text-[10.5px]" style={{ color: accent || "#6B7280" }}>{label}</span>
      <span className="text-[14px] text-[#1C2430]">{value}<span className="text-[#6B7280] text-[10.5px]">{unit}</span></span>
    </div>
  );
}

function ConfidenceGauge({ value }) {
  const r = 46, c = 2 * Math.PI * r;
  const pct = value / 100;
  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      <circle cx="60" cy="60" r={r} fill="none" stroke="#EDEBE0" strokeWidth="10" />
      <circle
        cx="60" cy="60" r={r} fill="none" stroke="#6D5BA6" strokeWidth="10"
        strokeDasharray={`${c * pct} ${c}`} strokeLinecap="round"
        transform="rotate(-90 60 60)"
      />
      <text x="60" y="56" textAnchor="middle" fontSize="20" fontFamily={FONT} fill="#1C2430" fontWeight="500">{value}%</text>
      <text x="60" y="72" textAnchor="middle" fontSize="9" fontFamily={FONT} fill="#6B7280">Confidence</text>
    </svg>
  );
}

const TABS = ["Overview", "Weather", "History", "Advisory", "Risk"];

function Row({ label, value, valueNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[#6B7280]">{label}</span>
      {valueNode || <span className="text-[#1C2430]">{value}</span>}
    </div>
  );
}

export default function Dashboard() {
  const { selectedId, setSelectedId, crop, setCrop, stage, setStage } = useSelection();
  const [panelOpen, setPanelOpen] = useState(true);
  const [tab, setTab] = useState("Overview");
  const [scenario, setScenario] = useState(1);
  const [addPanchayatOpen, setAddPanchayatOpen] = useState(false);

  // shared, refreshable data (also used by other pages)
  const { liveData, blockLive, refreshing, lastUpdated, refresh: handleRefresh } = useLiveData();

  const selected = liveData.find((p) => p.id === selectedId) || liveData[0];
  const baseSelected = PANCHAYATS.find((p) => p.id === selected.id) || PANCHAYATS[0];
  const risk = riskOf(selected);
  const range = Math.max(3, Math.round(selected.rainfall * (1 - selected.confidence / 100) * 1.5));
  const rangeLow = Math.max(0, selected.rainfall - range);
  const rangeHigh = selected.rainfall + range;
  const advisory = buildAdvisory(selected, crop, stage);
  const scenarioRainfall = Math.round(selected.rainfall * scenario);
  const scenarioAdvisory = buildAdvisory({ ...selected, rainfall: scenarioRainfall }, crop, stage);
  const lowConfidence = liveData.filter((p) => p.confidence < 70);

  // Voronoi cells only depend on each Panchayat's fixed lat/lng, so compute once.
  const voronoiCells = useMemo(() => computeVoronoiCells(PANCHAYATS), []);

  // ---------- per-panchayat trend series ----------
  const rainTrend = useMemo(() => {
    const pScale = baseSelected.rainfall > 0 ? selected.rainfall / baseSelected.rainfall : 1;
    const bScale = BLOCK.rainfall > 0 ? blockLive.rainfall / BLOCK.rainfall : 1;
    return (TREND[selected.id] || []).map((t) => ({
      ...t,
      p: round1(t.p * pScale),
      block: round1(t.block * bScale),
    }));
  }, [selected.id, selected.rainfall, baseSelected.rainfall, blockLive.rainfall]);

  const tempTrend = useMemo(() => {
    const h = hashId(selected.id);
    const blockShift = blockLive.temp - BLOCK.temp;
    const placeShift = selected.temp - blockLive.temp;
    return TEMP_TREND.map((t, i) => {
      const wobble = i === 0 ? 0 : (((h + i * 7) % 5) - 2) * 0.15;
      const block = t.block + blockShift;
      return { ...t, block: round1(block), p: round1(block + placeShift + wobble) };
    });
  }, [selected.id, selected.temp, blockLive.temp]);

  const confTrend = useMemo(() => {
    const h = hashId(selected.id);
    const shift = selected.confidence - CONFIDENCE_TREND[0].confidence;
    return CONFIDENCE_TREND.map((c, i) => {
      const wobble = i === 0 ? 0 : ((h + i * 3) % 5) - 2;
      return { ...c, confidence: Math.round(clamp(c.confidence + shift + wobble, 20, 99)) };
    });
  }, [selected.id, selected.confidence]);

  return (
    <PageShell title="Dashboard" subtitle="AI-powered Panchayat-level weather downscaling">
      {/* selectors */}
      <Card className="flex flex-wrap items-end gap-4" style={{ fontFamily: FONT }}>
        <div>
          <div className="text-[11px] text-[#6B7280] mb-1">District </div>
          <div className="text-[13px] border border-[#DEDCD1] rounded-sm px-3 py-1.5 min-w-[170px] text-[#1C2430]">{BLOCK.district}</div>
        </div>
        <div>
          <div className="text-[11px] text-[#6B7280] mb-1">Block</div>
          <div className="text-[13px] border border-[#DEDCD1] rounded-sm px-3 py-1.5 min-w-[170px] text-[#1C2430]">{BLOCK.block}</div>
        </div>
        <div>
          <div className="text-[11px] text-[#6B7280] mb-1">Panchayat</div>
          <select value={selectedId} onChange={(e) => { setSelectedId(e.target.value); setPanelOpen(true); }}
            className="text-[13px] border border-[#DEDCD1] rounded-sm px-3 py-1.5 min-w-[170px] text-[#1C2430] bg-white">
            {PANCHAYATS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <button
          onClick={() => setAddPanchayatOpen(true)}
          className="flex items-center gap-1.5 text-[12.5px] px-3 py-1.5 rounded-sm border"
          style={{ borderColor: "#0F8074", color: "#0F8074" }}
        >
          <MapPinPlus size={13} /> Add Panchayat
        </button>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-[10.5px] text-[#6B7280]">
            Last updated: {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-[12.5px] px-3 py-1.5 rounded-sm border disabled:opacity-60"
            style={{ borderColor: "#2E6F95", color: "#2E6F95" }}
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh Data"}
          </button>
        </div>
      </Card>

      {/* three top cards */}
      <div className="grid grid-cols-12 gap-5">
        <Card className="col-span-12 lg:col-span-5 border-l-4" style={{ borderLeftColor: "#2E6F95", fontFamily: FONT }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] font-medium" style={{ color: "#2E6F95" }}>Block-level Forecast ({BLOCK.block})</span>
            <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-[#EAF1F5] text-[#2E6F95]">Next 24 Hours</span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            <MetricRow icon={CloudRain} label="Rainfall" value={blockLive.rainfall.toFixed(1)} unit=" mm" bg="#DCEEF9" accent="#1D6FA6" />
            <MetricRow icon={Thermometer} label="Temp." value={blockLive.temp} unit="°C" bg="#FDECD3" accent="#C2760B" />
            <MetricRow icon={Droplets} label="Humidity" value={blockLive.humidity} unit="%" bg="#D7F2EA" accent="#0F8074" />
            <MetricRow icon={Wind} label="Wind" value={blockLive.wind} unit=" km/h" bg="#EAE0F7" accent="#7A4FC9" />
            <MetricRow icon={Gauge} label="Rain Prob." value={blockLive.rainProb} unit="%" bg="#FBE1EC" accent="#C23B6B" />
          </div>
          <div className="text-[15.5px] text-[#6B7280] mt-3 pt-2 border-t border-[#EDEBE0]">Source: IMD Block Forecast (Simulated)</div>
        </Card>

        <Card className="col-span-12 lg:col-span-5 border-l-4" style={{ borderLeftColor: "#43714B", fontFamily: FONT }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] font-medium" style={{ color: "#43714B" }}>Panchayat-level Prediction ({selected.name})</span>
            <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-[#EAF3EC] text-[#43714B]">Next 24 Hours</span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            <MetricRow icon={CloudRain} label="Rainfall" value={selected.rainfall.toFixed(1)} unit=" mm" bg="#DCEEF9" accent="#1D6FA6" />
            <MetricRow icon={Thermometer} label="Temp." value={selected.temp} unit="°C" bg="#FDECD3" accent="#C2760B" />
            <MetricRow icon={Droplets} label="Humidity" value={selected.humidity} unit="%" bg="#D7F2EA" accent="#0F8074" />
            <MetricRow icon={Wind} label="Wind" value={selected.wind} unit=" km/h" bg="#EAE0F7" accent="#7A4FC9" />
            <MetricRow icon={Gauge} label="Rain Prob." value={selected.rainProb} unit="%" bg="#FBE1EC" accent="#C23B6B" />
          </div>
          <div className="text-[15.5px] text-[#6B7280] mt-3 pt-2 border-t border-[#EDEBE0] flex items-center gap-1">
            Downscaled using AI Model (XGBoost) <Cpu size={11} />
          </div>
        </Card>

        <Card className="col-span-12 lg:col-span-2 flex flex-col items-center" style={{ fontFamily: FONT }}>
          <span className="text-[12px] font-medium text-[#6D5BA6] mb-1 self-start">Model Confidence</span>
          <ConfidenceGauge value={selected.confidence} />
          <div className="text-[10px] text-[#6B7280] text-center mt-1">Range {rangeLow}–{rangeHigh} mm<br />Uncertainty ±{range} mm</div>
        </Card>
      </div>

      {/* map + detail panel */}
      <div className="grid grid-cols-12 gap-5">
        <Card className="col-span-12 lg:col-span-8 relative" style={{ fontFamily: FONT }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] font-medium text-[#1C2430]">Panchayat-wise Predicted Rainfall (Next 24 Hours)</span>
              <Info size={12} color="#6B7280" />
            </div>
            <span className="text-[12px] border border-[#DEDCD1] rounded-sm px-2.5 py-1 text-[#5B6472]">Rainfall (mm)</span>
          </div>

          <div className="relative rounded-sm overflow-hidden">
            <div className="absolute top-3 left-3 z-[1000] bg-white/95 border border-[#DEDCD1] rounded-sm px-3 py-2 text-[10.5px]">
              <div className="text-[#5B6472] mb-1.5">Rainfall (mm)</div>
              {[["#123A54", "> 60 mm"], ["#1B587F", "45 – 60 mm"], ["#2E6F95", "30 – 45 mm"], ["#6FA3BE", "15 – 30 mm"], ["#C3DBE5", "< 15 mm"]].map(([c, l]) => (
                <div key={l} className="flex items-center gap-1.5 py-0.5">
                  <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: c }} />
                  <span className="text-[#5B6472]">{l}</span>
                </div>
              ))}
            </div>

            <MapContainer
              center={BLOCK.center}
              zoom={12}
              style={{ height: 480, width: "100%" }}
              zoomControl={false}
              scrollWheelZoom
            >
              <TileLayer
  attribution="Tiles &copy; Esri &mdash; Esri, HERE, Garmin, FAO, NOAA, USGS"
  url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
  maxZoom={16}
/>
              <ZoomControl position="bottomleft" />
              <ScaleControl />
              {liveData.map((p, i) => {
                const cell = voronoiCells[i];
                if (!cell) return null;
                const isSel = p.id === selectedId;
                return (
                  <Polygon
                    key={p.id}
                    positions={cell}
                    pathOptions={{
                      fillColor: rainfallColor(p.rainfall),
                      fillOpacity: 0.82,
                      color: isSel ? "#101B2D" : "white",
                      weight: isSel ? 3 : 1.5,
                    }}
                    eventHandlers={{ click: () => { setSelectedId(p.id); setPanelOpen(true); } }}
                  >
                    <LeafletTooltip permanent direction="center" className="panchayat-label" opacity={1}>
                      <div style={{ textAlign: "center", lineHeight: 1.3 }}>
                        <div>{p.name}</div>
                        <div>{p.rainfall} mm</div>
                      </div>
                    </LeafletTooltip>
                  </Polygon>
                );
              })}
            </MapContainer>
          </div>
        </Card>

        {/* detail panel */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          {panelOpen ? (
            <Card style={{ fontFamily: FONT }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[12px] text-[#6B7280]">Panchayat Details</span>
                <button onClick={() => setPanelOpen(false)}><X size={14} color="#6B7280" /></button>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[15px] text-[#1C2430]">{selected.name} <span className="text-[11px] text-[#6B7280]">(Demo Panchayat)</span></span>
                <span className="text-[10.5px] px-2 py-0.5 rounded-full" style={{ background: risk.bg, color: risk.color }}>{risk.label}</span>
              </div>

              <div className="flex gap-3 mb-3 border-b border-[#EDEBE0] text-[11.5px]">
                {TABS.map((t) => (
                  <button key={t} onClick={() => setTab(t)}
                    className="pb-2 -mb-px"
                    style={{ color: tab === t ? "#2E6F95" : "#6B7280", borderBottom: tab === t ? "2px solid #2E6F95" : "2px solid transparent" }}>{t}</button>
                ))}
              </div>

              {tab === "Overview" && (
                <div className="space-y-2 text-[12.5px]">
                  <Row label="Predicted Rainfall (24H)" value={`${selected.rainfall.toFixed(1)} mm`} />
                  <Row label="Expected Range" value={`${rangeLow}–${rangeHigh} mm`} />
                  <Row label="Confidence" value={`${selected.confidence}%`} />
                  <Row label="Rain Probability" value={`${selected.rainProb}%`} />
                  <Row label="Risk Level" valueNode={<span style={{ color: risk.color }}>{risk.label}</span>} />
                  <button onClick={() => setTab("Advisory")} className="text-[11.5px] text-[#2E6F95] flex items-center gap-1 pt-1">View Full Advisory <ChevronRight size={12} /></button>
                </div>
              )}

              {tab === "Weather" && (
                <div className="space-y-2 text-[12.5px]">
                  <Row label="Temperature" value={`${selected.temp} °C`} />
                  <Row label="Humidity" value={`${selected.humidity}%`} />
                  <Row label="Wind" value={`${selected.wind} km/h`} />
                  <Row label="Elevation" value={`${selected.elevation} m`} />
                  <Row label="Terrain" value={selected.terrain} />
                  <div className="text-[10.5px] text-[#9AA2AC] pt-1">Block reference: {blockLive.rainfall}mm · {blockLive.temp}°C · {blockLive.humidity}%</div>
                </div>
              )}

              {tab === "History" && (
                <div>
                  <Row label="Historical Average" value={`${selected.historicalAvg} mm`} />
                  <ResponsiveContainer width="100%" height={110}>
                    <LineChart data={rainTrend} margin={{ top: 8, right: 5, left: -25, bottom: 0 }}>
                      <XAxis dataKey="d" tick={{ fontSize: 9, fill: "#6B7280" }} />
                      <YAxis tick={{ fontSize: 9, fill: "#6B7280" }} />
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 4 }} />
                      <Line type="monotone" dataKey="p" name="Predicted" stroke="#43714B" strokeWidth={2} dot={{ r: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {tab === "Advisory" && (
                <div>
                  <div className="flex gap-2 mb-2">
                    <select value={crop} onChange={(e) => setCrop(e.target.value)}
                      className="flex-1 text-[12px] border border-[#DEDCD1] rounded-sm px-2 py-1 bg-white text-[#1C2430]">
                      {Object.keys(CROPS).map((c) => <option key={c}>{c}</option>)}
                    </select>
                    <select value={stage} onChange={(e) => setStage(e.target.value)}
                      className="flex-1 text-[12px] border border-[#DEDCD1] rounded-sm px-2 py-1 bg-white text-[#1C2430]">
                      {CROPS[crop].map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="rounded-sm p-2.5 mb-2" style={{
                    background: advisory.severity === "high" ? "#A6483A0F" : "#43714B0F",
                    border: `1px solid ${advisory.severity === "high" ? "#A6483A33" : "#43714B33"}`,
                  }}>
                    <div className="flex items-center gap-1.5 mb-1">
                      {advisory.severity === "high" ? <AlertTriangle size={13} color="#A6483A" /> : <CheckCircle2 size={13} color="#43714B" />}
                      <span className="text-[11.5px]" style={{ color: advisory.severity === "high" ? "#A6483A" : "#43714B" }}>
                        {advisory.severity === "high" ? "Attention needed" : "Favorable conditions"}
                      </span>
                    </div>
                    {advisory.notes.map((n, i) => <div key={i} className="text-[11.5px] text-[#3B4451] leading-snug">· {n}</div>)}
                  </div>
                  <div className="border-t border-[#EDEBE0] pt-2">
                    <div className="flex items-center gap-1.5 mb-1.5 text-[10.5px] text-[#6B7280]"><SlidersHorizontal size={11} /> What-if scenario (simulation)</div>
                    <div className="flex gap-1.5 mb-1.5">
                      {[{ l: "Normal", v: 1 }, { l: "Moderate", v: 1.4 }, { l: "Extreme", v: 2 }].map((s) => (
                        <button key={s.l} onClick={() => setScenario(s.v)} className="px-2 py-0.5 rounded-sm text-[10.5px]"
                          style={{ background: scenario === s.v ? "#101B2D" : "#F1F2ED", color: scenario === s.v ? "white" : "#5B6472" }}>{s.l}</button>
                      ))}
                    </div>
                    <div className="text-[11.5px]">{scenarioRainfall} mm → <span style={{ color: scenarioAdvisory.severity === "high" ? "#A6483A" : "#43714B" }}>{scenarioAdvisory.severity === "high" ? "Elevated risk" : "Normal risk"}</span></div>
                  </div>
                </div>
              )}

              {tab === "Risk" && (
                <div className="space-y-2 text-[12.5px]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10.5px] px-2 py-0.5 rounded-full" style={{ background: risk.bg, color: risk.color }}>{risk.label}</span>
                  </div>
                  <div className="text-[11.5px] text-[#3B4451]">· Rainfall {selected.rainfall}mm {selected.rainfall > 50 ? "(above heavy-rain threshold)" : selected.rainfall < 15 ? "(below dry threshold)" : "(within normal range)"}</div>
                  <div className="text-[11.5px] text-[#3B4451]">· Confidence {selected.confidence}% ({confidenceTier(selected.confidence).label.toLowerCase()})</div>
                  <div className="text-[11.5px] text-[#3B4451]">· {selected.confidence < 70 ? "Sparse nearby observations reduce certainty" : "Adequate nearby observation coverage"}</div>
                </div>
              )}
            </Card>
          ) : (
            <button onClick={() => setPanelOpen(true)} className="bg-white border border-[#E4E2D6] rounded-sm p-3 text-[12px] text-[#2E6F95]" style={{ fontFamily: FONT }}>Show Panchayat Details →</button>
          )}

          <Card style={{ fontFamily: FONT }}>
            <div className="text-[12.5px] text-[#1C2430] mb-2">Data Sources <span className="text-[10.5px] text-[#6B7280]">(Simulated)</span></div>
            {DATA_SOURCES.map((s) => (
              <div key={s.label} className="flex items-center gap-2 py-1 border-t border-[#EDEBE0] first:border-t-0">
                <s.icon size={13} color="#6B7280" strokeWidth={1.8} />
                <span className="text-[12px] text-[#3B4451] flex-1">{s.label}</span>
                <span className="text-[9.5px] px-1.5 py-0.5 rounded-full bg-[#F1F2ED] text-[#5B6472]">Simulated</span>
              </div>
            ))}
          </Card>

          {lowConfidence.length > 0 && (
            <Card style={{ fontFamily: FONT }}>
              <div className="flex items-center gap-1.5 mb-2">
                <RadioTower size={13} color="#A6483A" />
                <span className="text-[12.5px] text-[#1C2430]">Observation Gap</span>
              </div>
              {lowConfidence.map((p) => (
                <div key={p.id} className="text-[11.5px] text-[#5B6472] py-1 border-t border-[#EDEBE0] first:border-t-0">
                  <span className="text-[#293240]">{p.name}</span> — {p.confidence}% confidence, additional station recommended.
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>

      {/* bottom trend charts */}
      <div className="grid grid-cols-12 gap-5">
        <Card className="col-span-12 lg:col-span-4" style={{ fontFamily: FONT }}>
          <div className="text-[12.5px] text-[#1C2430] mb-2">Block vs Panchayat Rainfall (Next 7 Days)</div>
          <ResponsiveContainer width="100%" height={190}>
            <LineChart data={rainTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#EDEBE0" vertical={false} />
              <XAxis dataKey="d" tick={{ fontSize: 10, fill: "#6B7280" }} />
              <YAxis tick={{ fontSize: 10, fill: "#6B7280" }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 4 }} />
              <Legend wrapperStyle={{ fontSize: 10.5 }} />
              <Line type="monotone" dataKey="block" name="Block Forecast" stroke="#2E6F95" strokeWidth={2} dot={{ r: 2.5 }} />
              <Line type="monotone" dataKey="p" name="Panchayat Prediction" stroke="#43714B" strokeWidth={2} dot={{ r: 2.5 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card className="col-span-12 lg:col-span-4" style={{ fontFamily: FONT }}>
          <div className="text-[12.5px] text-[#1C2430] mb-2">Temperature Trend (Next 7 Days) — {selected.name}</div>
          <ResponsiveContainer width="100%" height={190}>
            <LineChart data={tempTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#EDEBE0" vertical={false} />
              <XAxis dataKey="d" tick={{ fontSize: 10, fill: "#6B7280" }} />
              <YAxis tick={{ fontSize: 10, fill: "#6B7280" }} domain={[(min) => Math.floor(min - 1), (max) => Math.ceil(max + 1)]} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 4 }} />
              <Legend wrapperStyle={{ fontSize: 10.5 }} />
              <Line type="monotone" dataKey="block" name="Block Forecast (°C)" stroke="#2E6F95" strokeWidth={2} dot={{ r: 2.5 }} />
              <Line type="monotone" dataKey="p" name="Panchayat Prediction (°C)" stroke="#43714B" strokeWidth={2} dot={{ r: 2.5 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card className="col-span-12 lg:col-span-4" style={{ fontFamily: FONT }}>
          <div className="text-[12.5px] text-[#1C2430] mb-2">Model Confidence Trend (Next 7 Days) — {selected.name}</div>
          <ResponsiveContainer width="100%" height={190}>
            <LineChart data={confTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#EDEBE0" vertical={false} />
              <XAxis dataKey="d" tick={{ fontSize: 10, fill: "#6B7280" }} />
              <YAxis tick={{ fontSize: 10, fill: "#6B7280" }} domain={[0, 100]} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 4 }} />
              <Legend wrapperStyle={{ fontSize: 10.5 }} />
              <Line type="monotone" dataKey="confidence" name="Confidence (%)" stroke="#6D5BA6" strokeWidth={2} dot={{ r: 2.5 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* model evaluation strip */}
      <Card className="flex flex-wrap items-center gap-6" style={{ fontFamily: FONT }}>
        <span className="text-[12.5px] text-[#1C2430]">Model Evaluation (vs. baseline = Block value applied to every panchayat)</span>
        <div className="flex items-center gap-4 text-[12px]">
          <span className="text-[#5B6472]">Baseline — MAE {BASELINE_METRICS.mae}, RMSE {BASELINE_METRICS.rmse}, R² {BASELINE_METRICS.r2}</span>
          <span className="text-[#43714B]">AI Model — MAE {AI_METRICS.mae}, RMSE {AI_METRICS.rmse}, R² {AI_METRICS.r2}</span>
        </div>
        <span className="text-[10.5px] text-[#9AA2AC] ml-auto">Illustrative demo figures — replace with real backtest results.</span>
      </Card>

      <AddPanchayatModal open={addPanchayatOpen} onClose={() => setAddPanchayatOpen(false)} />
    </PageShell>
  );
}