import React from "react";
import { CloudRain, Thermometer, Droplets, Wind, AlertTriangle, CheckCircle2, Leaf } from "lucide-react";
import PageShell, { Card } from "../components/PageShell.jsx";
import LocationBar from "../components/LocationBar.jsx";
import { useSelection } from "../SelectionContext.jsx";
import { useLiveData } from "../DataContext.jsx";
import { CROPS, buildAdvisory, riskOf } from "../data.js";

const FONT = "Arial, Helvetica, sans-serif";

export default function Advisories() {
  const { selectedId, crop, setCrop, stage, setStage } = useSelection();
  const { liveData } = useLiveData(); // refreshed data shared across pages
  const selected = liveData.find((p) => p.id === selectedId) || liveData[0];
  const advisory = buildAdvisory(selected, crop, stage);
  const risk = riskOf(selected);

  return (
    <PageShell title="Advisories" subtitle="Location-based advisories for better crop management">
      <LocationBar />

      <div className="grid grid-cols-12 gap-5">
        <Card className="col-span-12 lg:col-span-7" style={{ fontFamily: FONT }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] font-medium text-[#1C2430]">Current Advisory</span>
            <span className="text-[10.5px] px-2 py-0.5 rounded-full" style={{ background: risk.bg, color: risk.color }}>{risk.label}</span>
          </div>
          <div className="text-[13px] text-[#1C2430] mb-1">{crop} <span className="text-[#6B7280] text-[11.5px]">· Growth Stage: {stage}</span></div>
          <div className="rounded-sm p-3 mb-1" style={{
            background: advisory.severity === "high" ? "#A6483A0F" : "#43714B0F",
            border: `1px solid ${advisory.severity === "high" ? "#A6483A33" : "#43714B33"}`,
          }}>
            <div className="flex items-center gap-1.5 mb-1.5">
              {advisory.severity === "high" ? <AlertTriangle size={14} color="#A6483A" /> : <CheckCircle2 size={14} color="#43714B" />}
              <span className="text-[12px]" style={{ color: advisory.severity === "high" ? "#A6483A" : "#43714B" }}>
                {advisory.severity === "high" ? "Attention needed" : "Favorable conditions"}
              </span>
            </div>
            {advisory.notes.map((n, i) => (
              <div key={i} className="text-[12px] text-[#3B4451] leading-relaxed py-0.5">• {n}</div>
            ))}
          </div>
          <div className="text-[10.5px] text-[#9AA2AC] pt-2">Decision-support recommendation, not a substitute for on-ground agronomic judgement.</div>
        </Card>

        <Card className="col-span-12 lg:col-span-5" style={{ fontFamily: FONT }}>
          <div className="text-[13px] font-medium text-[#1C2430] mb-3">Weather Summary — {selected.name}</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 rounded-sm border border-[#E4E2D6] p-2.5">
              <CloudRain size={18} color="#2E6F95" /><div><div className="text-[10.5px] text-[#6B7280]">Rainfall</div><div className="text-[13px] text-[#1C2430]">{selected.rainfall} mm</div></div>
            </div>
            <div className="flex items-center gap-2 rounded-sm border border-[#E4E2D6] p-2.5">
              <Thermometer size={18} color="#A6483A" /><div><div className="text-[10.5px] text-[#6B7280]">Temp.</div><div className="text-[13px] text-[#1C2430]">{selected.temp}°C</div></div>
            </div>
            <div className="flex items-center gap-2 rounded-sm border border-[#E4E2D6] p-2.5">
              <Droplets size={18} color="#43714B" /><div><div className="text-[10.5px] text-[#6B7280]">Humidity</div><div className="text-[13px] text-[#1C2430]">{selected.humidity}%</div></div>
            </div>
            <div className="flex items-center gap-2 rounded-sm border border-[#E4E2D6] p-2.5">
              <Wind size={18} color="#6D5BA6" /><div><div className="text-[10.5px] text-[#6B7280]">Wind</div><div className="text-[13px] text-[#1C2430]">{selected.wind} km/h</div></div>
            </div>
          </div>
        </Card>
      </div>

      <Card style={{ fontFamily: FONT }}>
        <div className="text-[13px] font-medium text-[#1C2430] mb-3">Crop-wise Advisory</div>
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.keys(CROPS).map((c) => (
            <button key={c} onClick={() => setCrop(c)}
              className="text-[12px] px-3 py-1.5 rounded-sm border"
              style={{
                background: crop === c ? "#101B2D" : "white",
                color: crop === c ? "white" : "#5B6472",
                borderColor: crop === c ? "#101B2D" : "#DEDCD1",
              }}>{c}</button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {CROPS[crop].map((s) => (
            <button key={s} onClick={() => setStage(s)}
              className="text-[11.5px] px-2.5 py-1 rounded-full border"
              style={{
                background: stage === s ? "#EAF1F5" : "white",
                color: stage === s ? "#2E6F95" : "#6B7280",
                borderColor: stage === s ? "#2E6F95" : "#DEDCD1",
              }}>{s}</button>
          ))}
        </div>
        <div className="rounded-sm p-3 flex items-start gap-2.5" style={{ background: "#EAF3EC", border: "1px solid #43714B33" }}>
          <Leaf size={16} color="#43714B" className="shrink-0 mt-0.5" />
          <div>
            <div className="text-[12px] text-[#43714B] mb-1">Key Recommendation</div>
            <div className="text-[12px] text-[#3B4451] leading-relaxed">{advisory.notes[advisory.notes.length - 1]}</div>
          </div>
        </div>
      </Card>
    </PageShell>
  );
}