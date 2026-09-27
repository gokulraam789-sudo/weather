import React, { useMemo, useState } from "react";
import { CloudRain, Cloud, Sun, Thermometer, Droplets, Wind, Gauge } from "lucide-react";
import PageShell, { Card } from "../components/PageShell.jsx";
import LocationBar from "../components/LocationBar.jsx";
import { useSelection } from "../SelectionContext.jsx";
import { useLiveData } from "../DataContext.jsx";
import { BLOCK, SEVEN_DAY, confidenceTier } from "../data.js";

const FONT = "Arial, Helvetica, sans-serif";

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const round1 = (v) => Math.round(v * 10) / 10;
// stable number from a panchayat id, so each place keeps its own (repeatable) variation
const hashId = (id) => [...String(id)].reduce((a, ch) => a + ch.charCodeAt(0), 0);
const wobble = (h, i, salt = 13) => 1 + (((h + i * salt) % 9) - 4) * 0.03;

// weather icon chosen from the adjusted numbers for that day
const condFor = (rainfall, rainProb) =>
  rainfall >= 10 || rainProb >= 60 ? "rain" : rainfall >= 2 || rainProb >= 35 ? "cloud" : "sun";

function CondIcon({ cond, size = 22, color }) {
  if (cond === "rain") return <CloudRain size={size} color={color || "#2E6F95"} strokeWidth={1.8} />;
  if (cond === "cloud") return <Cloud size={size} color={color || "#6B7280"} strokeWidth={1.8} />;
  return <Sun size={size} color={color || "#C08A3E"} strokeWidth={1.8} />;
}

function ConfidenceRing({ value }) {
  const r = 44, c = 2 * Math.PI * r;
  const tier = confidenceTier(value);
  return (
    <svg width="112" height="112" viewBox="0 0 112 112">
      <circle cx="56" cy="56" r={r} fill="none" stroke="#EDEBE0" strokeWidth="9" />
      <circle cx="56" cy="56" r={r} fill="none" stroke={tier.color} strokeWidth="9"
        strokeDasharray={`${c * (value / 100)} ${c}`} strokeLinecap="round" transform="rotate(-90 56 56)" />
      <text x="56" y="52" textAnchor="middle" fontSize="18" fontFamily={FONT} fill="#1C2430" fontWeight="500">{value}%</text>
      <text x="56" y="68" textAnchor="middle" fontSize="8.5" fontFamily={FONT} fill="#6B7280">{tier.label}</text>
    </svg>
  );
}

export default function PanchayatForecast() {
  const { selectedId } = useSelection();
  const { liveData } = useLiveData(); // refreshed data shared across pages
  const selected = liveData.find((p) => p.id === selectedId) || liveData[0];

  // 7-day forecast adjusted for the selected panchayat (today's card matches the current values)
  const sevenDay = useMemo(() => {
    const h = hashId(selected.id);
    const rainRatio = BLOCK.rainfall > 0 ? selected.rainfall / BLOCK.rainfall : 1;
    const tempOffset = selected.temp - BLOCK.temp;
    const probOffset = selected.rainProb - BLOCK.rainProb;
    return SEVEN_DAY.map((d, i) => {
      const rainfall = i === 0 ? selected.rainfall : round1(Math.max(0, d.rainfall * rainRatio * wobble(h, i, 7)));
      const rainProb = i === 0
        ? selected.rainProb
        : Math.round(clamp(d.rainProb + probOffset + (wobble(h, i, 3) - 1) * 20, 0, 100));
      return {
        ...d,
        rainfall,
        rainProb,
        tempHi: Math.round(d.tempHi + tempOffset + (wobble(h, i, 5) - 1) * 4),
        tempLo: Math.round(d.tempLo + tempOffset + (wobble(h, i, 11) - 1) * 4),
        cond: condFor(rainfall, rainProb),
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected.id, selected.rainfall, selected.temp, selected.rainProb]);

  // NEW: which forecast day is selected (null = today / current values)
  const [dayIdx, setDayIdx] = useState(null);
  const activeIdx = dayIdx ?? 0;
  const activeDay = sevenDay[activeIdx] || sevenDay[0];

  // Weather details for the selected day. Today matches the current values exactly.
  const detail = useMemo(() => {
    if (activeIdx === 0) {
      return {
        rainfall: selected.rainfall, temp: selected.temp, humidity: selected.humidity,
        wind: selected.wind, rainProb: selected.rainProb, confidence: selected.confidence,
      };
    }
    const h = hashId(selected.id);
    const d = sevenDay[activeIdx];
    const d0 = sevenDay[0];
    const avg = (x) => (x.tempHi + x.tempLo) / 2;
    return {
      rainfall: d.rainfall,
      temp: round1(selected.temp + avg(d) - avg(d0)),
      humidity: Math.round(clamp(selected.humidity + (d.rainProb - d0.rainProb) * 0.3 + (wobble(h, activeIdx, 7) - 1) * 15, 0, 100)),
      wind: Math.round(Math.max(0, selected.wind * wobble(h, activeIdx, 9))),
      rainProb: d.rainProb,
      // confidence drops the further ahead the forecast is, with a small per-day variation
      confidence: Math.round(clamp(selected.confidence - activeIdx * 2 + (((h + activeIdx * 3) % 3) - 1), 20, 99)),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIdx, sevenDay, selected.id, selected.rainfall, selected.temp, selected.humidity, selected.wind, selected.rainProb, selected.confidence]);

  return (
    <PageShell title="Panchayat Forecast" subtitle="Detailed forecast for selected Panchayat">
      <LocationBar />

      <Card style={{ fontFamily: FONT }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[13px] font-medium text-[#1C2430]">{selected.name} — 7 Day Forecast <span className="text-[10.5px] text-[#6B7280]">(Simulated)</span></span>
          <span className="text-[10.5px] text-[#6B7280]">Click a day to see its details below</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {sevenDay.map((d, i) => (
            <button
              type="button"
              key={d.date}
              onClick={() => setDayIdx(i)}
              aria-pressed={i === activeIdx}
              className={"rounded-sm border p-3 flex flex-col items-center gap-1.5 cursor-pointer transition-colors hover:border-[#2E6F95] " + (i === activeIdx ? "border-[#2E6F95]" : "border-[#E4E2D6]")}
              style={i === activeIdx ? { background: "#EAF1F5" } : { background: "white" }}
            >
              <div className="text-[11px] text-[#5B6472]">{d.day}</div>
              <div className="text-[10px] text-[#6B7280]">{d.date}</div>
              <CondIcon cond={d.cond} />
              <div className="text-[13px] text-[#1C2430]">{d.tempHi}°<span className="text-[#6B7280]">/{d.tempLo}°</span></div>
              <div className="text-[11px]" style={{ color: "#2E6F95" }}>{d.rainfall} mm</div>
              <div className="text-[10px] text-[#6B7280]">{d.rainProb}% rain</div>
            </button>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-12 gap-5">
        <Card className="col-span-12 lg:col-span-8" style={{ fontFamily: FONT }}>
          <div className="flex items-center justify-between mb-3">
            <div className="text-[13px] font-medium text-[#1C2430]">
              Weather Details ({dayIdx === null ? "Current" : `${activeDay.day}, ${activeDay.date}`})
            </div>
            {dayIdx !== null && (
              <button onClick={() => setDayIdx(null)} className="text-[11.5px] text-[#2E6F95]">Back to Current</button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: CloudRain, label: "Rainfall", value: `${detail.rainfall} mm`, tone: "#2E6F95" },
              { icon: Thermometer, label: "Temperature", value: `${detail.temp}°C`, tone: "#A6483A" },
              { icon: Droplets, label: "Humidity", value: `${detail.humidity}%`, tone: "#43714B" },
              { icon: Wind, label: "Wind", value: `${detail.wind} km/h`, tone: "#6D5BA6" },
            ].map((m) => (
              <div key={m.label} className="rounded-sm border border-[#E4E2D6] p-3 flex flex-col items-center gap-1.5">
                <m.icon size={20} color={m.tone} strokeWidth={1.8} />
                <div className="text-[11px] text-[#6B7280]">{m.label}</div>
                <div className="text-[15px] text-[#1C2430]">{m.value}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 text-[12.5px]">
            <div className="flex items-center justify-between border-t border-[#EDEBE0] pt-2">
              <span className="text-[#6B7280]">Elevation</span><span className="text-[#1C2430]">{selected.elevation} m</span>
            </div>
            <div className="flex items-center justify-between border-t border-[#EDEBE0] pt-2">
              <span className="text-[#6B7280]">Terrain</span><span className="text-[#1C2430]">{selected.terrain}</span>
            </div>
            <div className="flex items-center justify-between border-t border-[#EDEBE0] pt-2">
              <span className="text-[#6B7280]">Land Cover</span><span className="text-[#1C2430]">{selected.landCover}</span>
            </div>
            <div className="flex items-center justify-between border-t border-[#EDEBE0] pt-2">
              <span className="text-[#6B7280]">Historical Average</span><span className="text-[#1C2430]">{selected.historicalAvg} mm</span>
            </div>
          </div>
        </Card>

        <Card className="col-span-12 lg:col-span-4 flex flex-col items-center" style={{ fontFamily: FONT }}>
          <div className="text-[13px] font-medium text-[#1C2430] self-start mb-2">Confidence Score</div>
          <ConfidenceRing value={detail.confidence} />
          <div className="text-[11px] text-[#6B7280] text-center mt-2 leading-snug">
            Based on data density, terrain complexity, and historical forecast accuracy for {selected.name}.
          </div>
          <div className="w-full flex items-center justify-between text-[11px] text-[#6B7280] mt-3 pt-3 border-t border-[#EDEBE0]">
            <span className="flex items-center gap-1"><Gauge size={12} /> Rain Probability</span>
            <span className="text-[#1C2430]">{detail.rainProb}%</span>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}