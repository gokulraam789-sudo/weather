import React, { useState, useMemo } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { Download } from "lucide-react";
import PageShell, { Card } from "../components/PageShell.jsx";
import { useSelection } from "../SelectionContext.jsx";
import { useLiveData } from "../DataContext.jsx";
import { BLOCK, PANCHAYATS, TREND, TEMP_TREND, HUMIDITY_TREND, CONFIDENCE_TREND } from "../data.js";

const FONT = "Arial, Helvetica, sans-serif";

const RANGES = ["Last 7 Days", "Last 14 Days", "Last 30 Days"];
const RANGE_DAYS = { "Last 7 Days": 7, "Last 14 Days": 14, "Last 30 Days": 30 };

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const round1 = (v) => Math.round(v * 10) / 10;
// stable number from a panchayat id, so each place keeps its own (repeatable) variation
const hashId = (id) => [...String(id)].reduce((a, ch) => a + ch.charCodeAt(0), 0);
const wobble = (h, i, salt = 13) => 1 + (((h + i * salt) % 9) - 4) * 0.03;

// Date labels ending on the last day of the demo period (May 4, 2026)
const dateLabel = (i, n) =>
  new Date(2026, 4, 4 - (n - 1 - i)).toLocaleDateString("en-US", { month: "short", day: "numeric" });

// Builds an n-day series by cycling through the 7-day base series.
// For 7 days the original labels are kept; for 14/30 days date labels are used.
function build(base, n, mapFn) {
  if (!base || base.length === 0) return [];
  return Array.from({ length: n }, (_, i) => {
    const src = base[i % base.length];
    return { ...src, d: n === 7 ? src.d : dateLabel(i, n), ...mapFn(src, i) };
  });
}

export default function ChartsTrends() {
  const { selectedId, setSelectedId } = useSelection();
  const { liveData, blockLive } = useLiveData();
  const [range, setRange] = useState("Last 7 Days");

  const selected = liveData.find((p) => p.id === selectedId) || liveData[0];
  const baseSelected = PANCHAYATS.find((p) => p.id === selected.id) || PANCHAYATS[0];
  const n = RANGE_DAYS[range];

  const rainTrend = useMemo(() => {
    const h = hashId(selected.id);
    const pScale = baseSelected.rainfall > 0 ? selected.rainfall / baseSelected.rainfall : 1;
    const bScale = BLOCK.rainfall > 0 ? blockLive.rainfall / BLOCK.rainfall : 1;
    return build(TREND[selected.id], n, (t, i) => ({
      block: round1(Math.max(0, t.block * bScale * (n > 7 ? wobble(0, i, 7) : 1))),
      p: round1(Math.max(0, t.p * pScale * (n > 7 ? wobble(h, i, 7) : 1))),
    }));
  }, [selected.id, selected.rainfall, baseSelected.rainfall, blockLive.rainfall, n]);

  const tempTrend = useMemo(() => {
    const h = hashId(selected.id);
    const blockShift = blockLive.temp - BLOCK.temp;
    const placeShift = selected.temp - blockLive.temp;
    return build(TEMP_TREND, n, (t, i) => {
      const block = t.block + blockShift + (n > 7 ? (wobble(0, i, 5) - 1) * 4 : 0);
      const w = i === 0 ? 0 : (((h + i * 7) % 5) - 2) * 0.15;
      return { block: round1(block), p: round1(block + placeShift + w) };
    });
  }, [selected.id, selected.temp, blockLive.temp, n]);

  const humidityTrend = useMemo(() => {
    const h = hashId(selected.id);
    const blockShift = blockLive.humidity - BLOCK.humidity;
    const placeShift = selected.humidity - blockLive.humidity;
    return build(HUMIDITY_TREND, n, (t, i) => {
      const block = clamp(t.block + blockShift + (n > 7 ? (wobble(0, i, 3) - 1) * 15 : 0), 0, 100);
      const w = i === 0 ? 0 : (((h + i * 5) % 7) - 3) * 0.8;
      return { block: round1(block), p: round1(clamp(block + placeShift + w, 0, 100)) };
    });
  }, [selected.id, selected.humidity, blockLive.humidity, n]);

  const confTrend = useMemo(() => {
    const h = hashId(selected.id);
    const shift = selected.confidence - CONFIDENCE_TREND[0].confidence;
    return build(CONFIDENCE_TREND, n, (c, i) => {
      const w = i === 0 ? 0 : ((h + i * 3) % 5) - 2;
      return { confidence: Math.round(clamp(c.confidence + shift + w, 20, 99)) };
    });
  }, [selected.id, selected.confidence, n]);

  // chart display settings that depend on how many points are shown
  const xInterval = n > 14 ? 4 : n > 7 ? 1 : 0;
  const dotR = n > 14 ? 1.5 : 3;
  const tempDomain = [(min) => Math.floor(min - 1), (max) => Math.ceil(max + 1)];
  const humDomain = [(min) => Math.max(0, Math.floor(min - 3)), (max) => Math.min(100, Math.ceil(max + 3))];

  // Download the currently displayed data as a CSV file
  const handleDownload = () => {
    const header = [
      "Date", "Block Rainfall (mm)", "Panchayat Rainfall (mm)",
      "Block Temp (C)", "Panchayat Temp (C)",
      "Block Humidity (%)", "Panchayat Humidity (%)", "Confidence (%)",
    ];
    const rows = rainTrend.map((r, i) => [
      r.d, r.block, r.p,
      tempTrend[i]?.block, tempTrend[i]?.p,
      humidityTrend[i]?.block, humidityTrend[i]?.p,
      confTrend[i]?.confidence,
    ]);
    const csv = [header, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${String(selected.name).replace(/\s+/g, "_")}_${range.replace(/\s+/g, "_")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <PageShell title="Charts & Trends" subtitle="Visual comparison and historical trends">
      <Card className="flex flex-wrap items-end gap-4" style={{ fontFamily: FONT }}>
        <div>
          <div className="text-[11px] text-[#6B7280] mb-1">Panchayat</div>
          <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}
            className="text-[13px] border border-[#DEDCD1] rounded-sm px-3 py-1.5 min-w-[170px] text-[#1C2430] bg-white">
            {PANCHAYATS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <div className="text-[11px] text-[#6B7280] mb-1">Date Range</div>
          <select value={range} onChange={(e) => setRange(e.target.value)}
            className="text-[13px] border border-[#DEDCD1] rounded-sm px-3 py-1.5 min-w-[150px] text-[#1C2430] bg-white">
            {RANGES.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
        <button onClick={handleDownload} className="ml-auto flex items-center gap-1.5 text-[12.5px] px-3 py-1.5 rounded-sm border" style={{ borderColor: "#2E6F95", color: "#2E6F95" }}>
          <Download size={13} /> Download
        </button>
      </Card>

      <div className="grid grid-cols-12 gap-5">
        <Card className="col-span-12 lg:col-span-6" style={{ fontFamily: FONT }}>
          <div className="text-[12.5px] text-[#1C2430] mb-2">Block vs Panchayat Rainfall (mm) — {selected.name}</div>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={rainTrend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#EDEBE0" vertical={false} />
              <XAxis dataKey="d" tick={{ fontSize: 10.5, fill: "#6B7280" }} interval={xInterval} />
              <YAxis tick={{ fontSize: 10.5, fill: "#6B7280" }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 4 }} />
              <Legend wrapperStyle={{ fontSize: 10.5 }} />
              <Bar dataKey="block" name="Block Forecast" fill="#2E6F95" radius={[2, 2, 0, 0]} />
              <Bar dataKey="p" name="Panchayat Prediction" fill="#43714B" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="col-span-12 lg:col-span-6" style={{ fontFamily: FONT }}>
          <div className="text-[12.5px] text-[#1C2430] mb-2">Temperature Trend (°C) — {selected.name}</div>
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={tempTrend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#EDEBE0" vertical={false} />
              <XAxis dataKey="d" tick={{ fontSize: 10.5, fill: "#6B7280" }} interval={xInterval} />
              <YAxis tick={{ fontSize: 10.5, fill: "#6B7280" }} domain={tempDomain} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 4 }} />
              <Legend wrapperStyle={{ fontSize: 10.5 }} />
              <Line type="monotone" dataKey="block" name="Block Forecast" stroke="#A6483A" strokeWidth={2} dot={{ r: dotR }} />
              <Line type="monotone" dataKey="p" name="Panchayat Prediction" stroke="#C08A3E" strokeWidth={2} dot={{ r: dotR }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="col-span-12 lg:col-span-6" style={{ fontFamily: FONT }}>
          <div className="text-[12.5px] text-[#1C2430] mb-2">Humidity Trend (%) — {selected.name}</div>
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={humidityTrend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#EDEBE0" vertical={false} />
              <XAxis dataKey="d" tick={{ fontSize: 10.5, fill: "#6B7280" }} interval={xInterval} />
              <YAxis tick={{ fontSize: 10.5, fill: "#6B7280" }} domain={humDomain} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 4 }} />
              <Legend wrapperStyle={{ fontSize: 10.5 }} />
              <Line type="monotone" dataKey="block" name="Block Forecast" stroke="#2E6F95" strokeWidth={2} dot={{ r: dotR }} />
              <Line type="monotone" dataKey="p" name="Panchayat Prediction" stroke="#6D5BA6" strokeWidth={2} dot={{ r: dotR }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="col-span-12 lg:col-span-6" style={{ fontFamily: FONT }}>
          <div className="text-[12.5px] text-[#1C2430] mb-2">Confidence Trend (%) — {selected.name}</div>
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={confTrend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="#EDEBE0" vertical={false} />
              <XAxis dataKey="d" tick={{ fontSize: 10.5, fill: "#6B7280" }} interval={xInterval} />
              <YAxis tick={{ fontSize: 10.5, fill: "#6B7280" }} domain={[0, 100]} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 4 }} />
              <Legend wrapperStyle={{ fontSize: 10.5 }} />
              <Line type="monotone" dataKey="confidence" name="Confidence (%)" stroke="#6D5BA6" strokeWidth={2} dot={{ r: dotR }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </PageShell>
  );
}