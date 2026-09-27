import React, { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import PageShell, { Card } from "../components/PageShell.jsx";
import LocationBar from "../components/LocationBar.jsx";
import { useSelection } from "../SelectionContext.jsx";
import { useLiveData } from "../DataContext.jsx";
import { BLOCK, HISTORICAL_RECORDS, HISTORICAL_COMPARISON, AVG_TEMP_COMPARISON } from "../data.js";

const FONT = "Arial, Helvetica, sans-serif";

const TABS = ["Weather Data", "Crop Data", "Comparison"];

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const round1 = (v) => Math.round(v * 10) / 10;
// stable number from a panchayat id, so each place always gets its own (repeatable) variation
const hashId = (id) => [...String(id)].reduce((a, ch) => a + ch.charCodeAt(0), 0);
// small repeatable variation factor around 1 (about ±12%)
const wobble = (h, i, salt = 13) => 1 + (((h + i * salt) % 9) - 4) * 0.03;

export default function HistoricalData() {
  const [tab, setTab] = useState("Weather Data");
  const { selectedId } = useSelection();
  const { liveData } = useLiveData();

  const selected = liveData.find((p) => p.id === selectedId) || liveData[0];

  // How this panchayat differs from the block-level reference values.
  const rainRatio = BLOCK.rainfall > 0 ? selected.rainfall / BLOCK.rainfall : 1;
  const tempOffset = selected.temp - BLOCK.temp;
  const humOffset = selected.humidity - BLOCK.humidity;
  const windRatio = BLOCK.wind > 0 ? selected.wind / BLOCK.wind : 1;
  const probOffset = selected.rainProb - BLOCK.rainProb;

  // Weather Data table, adjusted for the selected panchayat
  const records = useMemo(() => {
    const h = hashId(selected.id);
    return HISTORICAL_RECORDS.map((r, i) => ({
      ...r,
      rainfall: round1(Math.max(0, r.rainfall * rainRatio * wobble(h, i))),
      temp: round1(r.temp + tempOffset + (wobble(h, i, 5) - 1) * 4),
      humidity: Math.round(clamp(r.humidity + humOffset + (wobble(h, i, 7) - 1) * 20, 0, 100)),
      wind: Math.round(Math.max(0, r.wind * windRatio * wobble(h, i, 11))),
      rainProb: Math.round(clamp(r.rainProb + probOffset + (wobble(h, i, 3) - 1) * 20, 0, 100)),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected.id, selected.rainfall, selected.temp, selected.humidity, selected.wind, selected.rainProb]);

  // Comparison bar chart, adjusted for the selected panchayat
  const comparison = useMemo(() => {
    const h = hashId(selected.id);
    return HISTORICAL_COMPARISON.map((c, i) => ({
      ...c,
      forecast: round1(Math.max(0, c.forecast * rainRatio)),
      thisPeriod: round1(Math.max(0, c.thisPeriod * rainRatio * wobble(h, i, 7))),
      lastYear: round1(Math.max(0, c.lastYear * rainRatio * wobble(h, i, 17))),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected.id, selected.rainfall]);

  // Average temperature comparison
  const avgTemp = useMemo(() => {
    const h = hashId(selected.id);
    const lastYearShift = (((h % 7) - 3) * 0.2);
    return {
      thisPeriod: round1(AVG_TEMP_COMPARISON.thisPeriod + tempOffset),
      lastYear: round1(AVG_TEMP_COMPARISON.lastYear + tempOffset + lastYearShift),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected.id, selected.temp]);

  const tempDiff = round1(avgTemp.lastYear - avgTemp.thisPeriod);

  return (
    <PageShell title="Historical Data" subtitle="Past weather data and comparison">
      <LocationBar
        extra={
          <div>
            <div className="text-[11px] text-[#6B7280] mb-1">Date Range</div>
            <div className="text-[13px] border border-[#DEDCD1] rounded-sm px-3 py-1.5 text-[#1C2430]">Apr 28, 2026 – May 4, 2026</div>
          </div>
        }
      />

      <div className="flex gap-2 border-b border-[#E4E2D6]">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className="px-3 py-2 text-[12.5px] -mb-px"
            style={{ color: tab === t ? "#2E6F95" : "#6B7280", borderBottom: tab === t ? "2px solid #2E6F95" : "2px solid transparent" }}>{t}</button>
        ))}
      </div>

      {tab === "Weather Data" && (
        <Card className="p-0 overflow-hidden" style={{ fontFamily: FONT }}>
          <div className="px-4 py-2.5 text-[12.5px] text-[#1C2430] border-b border-[#EDEBE0]">
            Weather records — {selected.name} <span className="text-[10.5px] text-[#6B7280]">(demo data)</span>
          </div>
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="text-left text-[#6B7280] border-b border-[#EDEBE0]">
                <th className="py-2.5 px-4 font-normal">Date</th>
                <th className="py-2.5 px-4 font-normal">Rainfall (mm)</th>
                <th className="py-2.5 px-4 font-normal">Temp. (°C)</th>
                <th className="py-2.5 px-4 font-normal">Humidity (%)</th>
                <th className="py-2.5 px-4 font-normal">Wind (km/h)</th>
                <th className="py-2.5 px-4 font-normal">Rain Prob. (%)</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.date} className="border-b border-[#EDEBE0] last:border-b-0">
                  <td className="py-2 px-4 text-[#1C2430]">{r.date}</td>
                  <td className="py-2 px-4 text-[#1C2430]">{r.rainfall}</td>
                  <td className="py-2 px-4 text-[#1C2430]">{r.temp}</td>
                  <td className="py-2 px-4 text-[#1C2430]">{r.humidity}</td>
                  <td className="py-2 px-4 text-[#1C2430]">{r.wind}</td>
                  <td className="py-2 px-4 text-[#1C2430]">{r.rainProb}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {tab === "Crop Data" && (
        <Card style={{ fontFamily: FONT }}>
          <div className="text-[12.5px] text-[#1C2430] mb-3">Historical Crop Calendar (Demo) — {selected.name}</div>
          <div className="text-[12px] text-[#5B6472] leading-relaxed">
            Crop-stage-wise historical yield and sowing/harvest data will be sourced from data.gov.in and state
            agriculture department records. This section is a placeholder in the current prototype — the
            production version will show sowing dates, historical yield per hectare, and stage-wise weather
            sensitivity for each supported crop in this Panchayat.
          </div>
        </Card>
      )}

      {tab === "Comparison" && (
        <div className="grid grid-cols-12 gap-5">
          <Card className="col-span-12 lg:col-span-8" style={{ fontFamily: FONT }}>
            <div className="text-[12.5px] text-[#1C2430] mb-2">Rainfall Comparison — Forecast vs This Period vs Last Year — {selected.name}</div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={comparison} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="#EDEBE0" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10.5, fill: "#6B7280" }} />
                <YAxis tick={{ fontSize: 10.5, fill: "#6B7280" }} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 4 }} />
                <Legend wrapperStyle={{ fontSize: 10.5 }} />
                <Bar dataKey="forecast" name="Forecast" fill="#2E6F95" radius={[2, 2, 0, 0]} />
                <Bar dataKey="thisPeriod" name="This Period" fill="#43714B" radius={[2, 2, 0, 0]} />
                <Bar dataKey="lastYear" name="Last Year" fill="#C08A3E" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card className="col-span-12 lg:col-span-4" style={{ fontFamily: FONT }}>
            <div className="text-[12.5px] text-[#1C2430] mb-3">Average Temperature (°C) — {selected.name}</div>
            <div className="flex items-center justify-between border-b border-[#EDEBE0] pb-3 mb-3">
              <span className="text-[12px] text-[#6B7280]">This Period</span>
              <span className="text-[20px] text-[#1C2430]">{avgTemp.thisPeriod}°C</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-[#6B7280]">Last Year</span>
              <span className="text-[20px] text-[#1C2430]">{avgTemp.lastYear}°C</span>
            </div>
            <div className="text-[10.5px] text-[#9AA2AC] mt-4 pt-3 border-t border-[#EDEBE0]">
              {tempDiff === 0
                ? "This period is about the same as the same week last year (demo figures)."
                : `This period is ${Math.abs(tempDiff).toFixed(1)}°C ${tempDiff > 0 ? "cooler" : "warmer"} than the same week last year (demo figures).`}
            </div>
          </Card>
        </div>
      )}
    </PageShell>
  );
}