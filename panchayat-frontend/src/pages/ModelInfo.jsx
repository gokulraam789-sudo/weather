import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChevronDown, ChevronUp } from "lucide-react";
import PageShell, { Card } from "../components/PageShell.jsx";
import {
  MODEL_INFO, PERFORMANCE_METRICS, FEATURE_IMPORTANCE,
  BASELINE_METRICS, AI_METRICS,
} from "../data.js";

const FONT = "Arial, Helvetica, sans-serif";

function R2Gauge({ value }) {
  const r = 46, c = 2 * Math.PI * r;
  return (
    <svg width="116" height="116" viewBox="0 0 116 116">
      <circle cx="58" cy="58" r={r} fill="none" stroke="#EDEBE0" strokeWidth="10" />
      <circle cx="58" cy="58" r={r} fill="none" stroke="#2E6F95" strokeWidth="10"
        strokeDasharray={`${c * value} ${c}`} strokeLinecap="round" transform="rotate(-90 58 58)" />
      <text x="58" y="54" textAnchor="middle" fontSize="19" fontFamily={FONT} fill="#1C2430" fontWeight="500">{value.toFixed(2)}</text>
      <text x="58" y="70" textAnchor="middle" fontSize="8.5" fontFamily={FONT} fill="#6B7280">R² Score</text>
    </svg>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-t border-[#EDEBE0] first:border-t-0">
      <span className="text-[12px] text-[#6B7280]">{label}</span>
      <span className="text-[12.5px] text-[#1C2430]">{value}</span>
    </div>
  );
}

// NEW: % improvement of the AI model over the baseline (lower is better for MAE / RMSE)
function improvement(base, ai) {
  const b = Number(base), a = Number(ai);
  if (!isFinite(b) || !isFinite(a) || b === 0) return "—";
  return `${(((b - a) / b) * 100).toFixed(0)}% lower`;
}

export default function ModelInfo() {
  const [showDetails, setShowDetails] = useState(false); // NEW
  const sortedFeatures = [...FEATURE_IMPORTANCE].sort((a, b) => b.value - a.value);
  const totalImportance = sortedFeatures.reduce((s, f) => s + f.value, 0) || 1;
  const maxImportance = sortedFeatures[0]?.value || 1;

  return (
    <PageShell title="Model Info" subtitle="AI/ML model details and performance">
      <div className="grid grid-cols-12 gap-5">
        <Card className="col-span-12 lg:col-span-7" style={{ fontFamily: FONT }}>
          <div className="text-[13px] font-medium text-[#1C2430] mb-2">Model Overview</div>
          <Row label="Model Name" value={MODEL_INFO.name} />
          <Row label="Training Data" value={MODEL_INFO.trainingData} />
          <Row label="Features" value={MODEL_INFO.featureDesc} />
          <Row label="Model Version" value={MODEL_INFO.version} />
          <Row label="Last Trained" value={MODEL_INFO.lastTrained} />
          <div className="text-[11px] text-[#9AA2AC] mt-3 pt-3 border-t border-[#EDEBE0] leading-relaxed">
            The model infers Panchayat-level rainfall, temperature, humidity and wind from Block-level forecasts
            combined with geographic, historical and (where available) satellite and ground-observation features.
            It is compared against a naive baseline that applies the Block forecast uniformly to every Panchayat.
          </div>
        </Card>

        <Card className="col-span-12 lg:col-span-5 flex flex-col items-center" style={{ fontFamily: FONT }}>
          <div className="text-[13px] font-medium text-[#1C2430] self-start mb-2">Performance Metrics</div>
          <R2Gauge value={PERFORMANCE_METRICS.r2} />
          <div className="grid grid-cols-3 gap-3 w-full mt-4 pt-3 border-t border-[#EDEBE0] text-center">
            <div>
              <div className="text-[10.5px] text-[#6B7280]">MAE</div>
              <div className="text-[14px] text-[#1C2430]">{PERFORMANCE_METRICS.mae} mm</div>
            </div>
            <div>
              <div className="text-[10.5px] text-[#6B7280]">RMSE</div>
              <div className="text-[14px] text-[#1C2430]">{PERFORMANCE_METRICS.rmse} mm</div>
            </div>
            <div>
              <div className="text-[10.5px] text-[#6B7280]">Accuracy</div>
              <div className="text-[14px] text-[#1C2430]">{PERFORMANCE_METRICS.accuracy}%</div>
            </div>
          </div>
        </Card>
      </div>

      <Card style={{ fontFamily: FONT }}>
        <div className="text-[13px] font-medium text-[#1C2430] mb-3">Feature Importance</div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={FEATURE_IMPORTANCE} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="#EDEBE0" horizontal={false} />
            <XAxis type="number" domain={[0, 0.4]} tick={{ fontSize: 10.5, fill: "#6B7280" }} />
            <YAxis type="category" dataKey="feature" width={110} tick={{ fontSize: 11, fill: "#3B4451" }} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 4 }} />
            <Bar dataKey="value" name="Importance" fill="#2E6F95" radius={[0, 3, 3, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <button
          onClick={() => setShowDetails((s) => !s)}
          aria-expanded={showDetails}
          className="mt-2 flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-sm border"
          style={{ borderColor: "#2E6F95", color: "#2E6F95" }}
        >
          {showDetails ? "Hide Technical Details" : "View Technical Details"}
          {showDetails ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>

        {/* NEW: technical details panel */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-[#EDEBE0] grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-6">
              <div className="text-[12.5px] font-medium text-[#1C2430] mb-2">Model vs Baseline</div>
              <div className="grid grid-cols-4 text-[10.5px] text-[#6B7280] pb-1.5 border-b border-[#EDEBE0]">
                <span>Metric</span><span className="text-right">Baseline</span><span className="text-right">AI Model</span><span className="text-right">Change</span>
              </div>
              {[
                { k: "MAE", b: BASELINE_METRICS.mae, a: AI_METRICS.mae, showChange: true },
                { k: "RMSE", b: BASELINE_METRICS.rmse, a: AI_METRICS.rmse, showChange: true },
                { k: "R²", b: BASELINE_METRICS.r2, a: AI_METRICS.r2, showChange: false },
              ].map((r) => (
                <div key={r.k} className="grid grid-cols-4 py-1.5 border-b border-[#EDEBE0] text-[12px]">
                  <span className="text-[#3B4451]">{r.k}</span>
                  <span className="text-right text-[#A6483A]">{r.b}</span>
                  <span className="text-right text-[#43714B]">{r.a}</span>
                  <span className="text-right text-[#5B6472]">{r.showChange ? improvement(r.b, r.a) : "higher is better"}</span>
                </div>
              ))}
              <div className="text-[10.5px] text-[#9AA2AC] mt-2 leading-relaxed">
                Baseline = Block forecast applied uniformly to every Panchayat. Figures are illustrative demo values until real backtest results are added.
              </div>

              <div className="text-[12.5px] font-medium text-[#1C2430] mt-4 mb-1">Model Summary</div>
              <Row label="Algorithm" value={MODEL_INFO.name} />
              <Row label="Version" value={MODEL_INFO.version} />
              <Row label="Last Trained" value={MODEL_INFO.lastTrained} />
              <Row label="Training Data" value={MODEL_INFO.trainingData} />
            </div>

            <div className="col-span-12 lg:col-span-6">
              <div className="text-[12.5px] font-medium text-[#1C2430] mb-2">Feature Contribution (ranked)</div>
              {sortedFeatures.map((f, i) => (
                <div key={f.feature} className="py-1.5 border-t border-[#EDEBE0] first:border-t-0">
                  <div className="flex items-center justify-between text-[12px] mb-1">
                    <span className="text-[#3B4451]">{i + 1}. {f.feature}</span>
                    <span className="text-[#1C2430]">
                      {f.value} <span className="text-[#6B7280]">({((f.value / totalImportance) * 100).toFixed(0)}%)</span>
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#EDEBE0]">
                    <div className="h-1.5 rounded-full" style={{ width: `${(f.value / maxImportance) * 100}%`, background: "#2E6F95" }} />
                  </div>
                </div>
              ))}
              <div className="text-[10.5px] text-[#9AA2AC] mt-2">Percentages show each feature's share of total importance.</div>
            </div>
          </div>
        )}
      </Card>
    </PageShell>
  );
}