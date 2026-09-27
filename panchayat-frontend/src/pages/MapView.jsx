import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip as LeafletTooltip, useMap } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import PageShell, { Card } from "../components/PageShell.jsx";
import LocationBar from "../components/LocationBar.jsx";
import { useSelection } from "../SelectionContext.jsx";
import { useLiveData } from "../DataContext.jsx";
import { BLOCK, rainfallColor, riskOf } from "../data.js";

const FONT = "Arial, Helvetica, sans-serif";

// Data layers colour the markers, so only one can be active at a time (like radio buttons).
const DATA_LAYERS = ["rainfall", "temperature", "risk"];
const NEUTRAL_COLOR = "#7C8796"; // marker colour when no data layer is selected

const LAYER_OPTIONS = [
  { key: "boundaries", label: "Panchayat Boundaries" },
  { key: "rainfall", label: "Rainfall (Predicted)" },
  { key: "temperature", label: "Temperature" },
  { key: "risk", label: "Risk Level" },
  { key: "satellite", label: "Satellite Layer" },
];

const TEMP_LOW = [46, 111, 149];  // cool end of the temperature scale
const TEMP_HIGH = [166, 72, 58];  // warm end of the temperature scale
const mixTemp = (t) => `rgb(${TEMP_LOW.map((c, i) => Math.round(c + (TEMP_HIGH[i] - c) * t)).join(",")})`;

function riskColor(p) {
  const r = riskOf(p);
  if (r.label === "High Risk") return "#A6483A";
  if (r.label === "Moderate Risk") return "#C08A3E";
  return "#43714B";
}

// Moves the map to the chosen panchayat (or back to the whole block)
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 0.8 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, center[0], center[1], zoom]);
  return null;
}

export default function MapView() {
  const { selectedId, setSelectedId } = useSelection();
  const { liveData } = useLiveData(); // refreshed data shared across pages
  const navigate = useNavigate();
  const [layers, setLayers] = useState({ boundaries: true, satellite: false });
  const [dataLayer, setDataLayer] = useState("rainfall"); // rainfall | temperature | risk | null (none)
  const [showAll, setShowAll] = useState(true); // true = "All Panchayats", false = only the selected one

  const isChecked = (key) => (DATA_LAYERS.includes(key) ? dataLayer === key : layers[key]);

  const toggleLayer = (key) => {
    if (DATA_LAYERS.includes(key)) {
      // selecting a data layer replaces the previous one; unticking it shows plain markers
      setDataLayer((prev) => (prev === key ? null : key));
    } else {
      setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
    }
  };

  const selected = liveData.find((p) => p.id === selectedId) || liveData[0];
  const visible = showAll ? liveData : liveData.filter((p) => p.id === selected.id);
  const mapCenter = showAll ? BLOCK.center : [selected.lat, selected.lng];
  const mapZoom = showAll ? 12 : 14;

  // temperature colour scale spans the coolest to the warmest panchayat currently shown
  const temps = liveData.map((p) => p.temp);
  const tMin = Math.min(...temps);
  const tMax = Math.max(...temps);

  function colorFor(p) {
    if (dataLayer === "risk") return riskColor(p);
    if (dataLayer === "temperature") {
      const t = tMax > tMin ? (p.temp - tMin) / (tMax - tMin) : 0.5;
      return mixTemp(Math.min(1, Math.max(0, t)));
    }
    if (dataLayer === "rainfall") return rainfallColor(p.rainfall);
    return NEUTRAL_COLOR;
  }

  // hover / label text follows the active data layer
  function labelFor(p) {
    if (dataLayer === "temperature") return `${p.name} — ${p.temp}°C`;
    if (dataLayer === "risk") return `${p.name} — ${riskOf(p).label}`;
    if (dataLayer === "rainfall") return `${p.name} — ${p.rainfall} mm`;
    return p.name;
  }

  return (
    <PageShell title="Map View" subtitle="Interactive map with Panchayat boundaries and weather data">
      <LocationBar panchayatAll allSelected={showAll} onSelect={(v) => setShowAll(v === "__all__")} />

      <div className="grid grid-cols-12 gap-5">
        <Card className="col-span-12 lg:col-span-9 p-0 overflow-hidden relative">
          <div style={{ height: 560 }}>
            <MapContainer center={BLOCK.center} zoom={12} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
              <MapController center={mapCenter} zoom={mapZoom} />
              {layers.satellite ? (
                <TileLayer
                  key="satellite"
                  attribution="Tiles &copy; Esri"
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
              ) : (
                <>
                  <TileLayer
                    key="esri-gray-base"
                    attribution="Tiles &copy; Esri &mdash; Esri, HERE, Garmin, FAO, NOAA, USGS"
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
                    maxZoom={16}
                  />
                  <TileLayer
                    key="esri-gray-reference"
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
                    maxZoom={16}
                  />
                </>
              )}
              {layers.boundaries && visible.map((p) => {
                const isSel = p.id === selectedId;
                return (
                  <CircleMarker
                    key={`${p.id}-${showAll}`}
                    center={[p.lat, p.lng]}
                    radius={dataLayer === "rainfall" ? 14 + Math.min(p.rainfall, 60) / 6 : 16}
                    pathOptions={{
                      color: isSel ? "#101B2D" : "white",
                      weight: isSel ? 3 : 1.5,
                      fillColor: colorFor(p),
                      fillOpacity: 0.85,
                    }}
                    eventHandlers={{ click: () => setSelectedId(p.id) }}
                  >
                    <LeafletTooltip direction="top" offset={[0, -6]} opacity={1} permanent={!showAll}>
                      {labelFor(p)}
                    </LeafletTooltip>
                    <Popup>
                      <div style={{ fontFamily: FONT, fontSize: 12.5, minWidth: 160 }}>
                        <div style={{ fontWeight: 600, marginBottom: 4, color: "#1C2430" }}>{p.name}</div>
                        <div style={{ color: "#5B6472" }}>Predicted Rainfall: <b style={{ color: "#1C2430" }}>{p.rainfall} mm</b></div>
                        <div style={{ color: "#5B6472" }}>Temp: <b style={{ color: "#1C2430" }}>{p.temp}°C</b> · Humidity: <b style={{ color: "#1C2430" }}>{p.humidity}%</b></div>
                        <div style={{ color: "#5B6472" }}>Confidence: <b style={{ color: "#1C2430" }}>{p.confidence}%</b></div>
                        <div style={{ color: "#5B6472", marginBottom: 6 }}>Risk: <b style={{ color: riskColor(p) }}>{riskOf(p).label.replace(" Risk", "")}</b></div>
                        <button
                          onClick={() => { setSelectedId(p.id); navigate("/forecast"); }}
                          style={{ background: "#101B2D", color: "white", border: "none", borderRadius: 3, padding: "4px 10px", fontSize: 11.5, cursor: "pointer" }}
                        >View Details</button>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>
        </Card>

        {/* side panel: legend + layers + selected detail */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
          {/* legend for the active data layer */}
          <Card style={{ fontFamily: FONT }}>
            {dataLayer === "rainfall" && (
              <>
                <div className="text-[12.5px] text-[#1C2430] mb-2">Predicted Rainfall (mm)</div>
                {[["#123A54", "≥ 60"], ["#1B587F", "45 – 60"], ["#2E6F95", "30 – 45"], ["#6FA3BE", "15 – 30"], ["#C3DBE5", "< 15"]].map(([c, l]) => (
                  <div key={l} className="flex items-center gap-2 py-0.5 text-[11.5px] text-[#5B6472]">
                    <span className="w-3 h-3 rounded-full inline-block" style={{ background: c }} /> {l} mm
                  </div>
                ))}
                <div className="text-[10.5px] text-[#9AA2AC] mt-2">Marker size also grows with rainfall.</div>
              </>
            )}
            {dataLayer === "temperature" && (
              <>
                <div className="text-[12.5px] text-[#1C2430] mb-2">Temperature (°C)</div>
                <div className="h-2.5 rounded-full" style={{ background: `linear-gradient(to right, ${mixTemp(0)}, ${mixTemp(1)})` }} />
                <div className="flex justify-between text-[11px] text-[#5B6472] mt-1">
                  <span>{tMin.toFixed(1)}°C</span><span>{tMax.toFixed(1)}°C</span>
                </div>
                <div className="flex justify-between text-[10.5px] text-[#9AA2AC]">
                  <span>Cooler</span><span>Warmer</span>
                </div>
              </>
            )}
            {dataLayer === "risk" && (
              <>
                <div className="text-[12.5px] text-[#1C2430] mb-2">Risk Level</div>
                {[["#43714B", "Low"], ["#C08A3E", "Moderate"], ["#A6483A", "High"]].map(([c, l]) => (
                  <div key={l} className="flex items-center gap-2 py-0.5 text-[11.5px] text-[#5B6472]">
                    <span className="w-3 h-3 rounded-full inline-block" style={{ background: c }} /> {l}
                  </div>
                ))}
              </>
            )}
            {dataLayer === null && (
              <>
                <div className="text-[12.5px] text-[#1C2430] mb-2">No data layer selected</div>
                <div className="text-[11.5px] text-[#5B6472]">Tick Rainfall, Temperature or Risk Level in Layers to colour the markers.</div>
              </>
            )}
          </Card>

          <Card style={{ fontFamily: FONT }}>
            <div className="text-[12.5px] text-[#1C2430] mb-2">Layers</div>
            {LAYER_OPTIONS.map((l) => (
              <label key={l.key} className="flex items-center gap-2 py-1 text-[12px] text-[#3B4451] cursor-pointer">
                <input type="checkbox" checked={isChecked(l.key)} onChange={() => toggleLayer(l.key)} className="accent-[#2E6F95]" />
                {l.label}
              </label>
            ))}
            <div className="text-[10.5px] text-[#9AA2AC] mt-1.5">Rainfall, Temperature and Risk Level colour the markers, so one is active at a time.</div>
          </Card>

          <Card style={{ fontFamily: FONT }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12.5px] text-[#1C2430]">{selected.name}</span>
              <span className="text-[10.5px] px-2 py-0.5 rounded-full" style={{ background: riskOf(selected).bg, color: riskOf(selected).color }}>{riskOf(selected).label}</span>
            </div>
            <div className="text-[11.5px] text-[#5B6472] space-y-1">
              <div>Predicted Rainfall: <b className="text-[#1C2430]">{selected.rainfall} mm</b></div>
              <div>Temp / Humidity: <b className="text-[#1C2430]">{selected.temp}°C / {selected.humidity}%</b></div>
              <div>Confidence: <b className="text-[#1C2430]">{selected.confidence}%</b></div>
            </div>
            <a href="#/forecast" className="text-[11.5px] text-[#2E6F95] flex items-center gap-1 pt-2">View Full Forecast <ChevronRight size={12} /></a>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}