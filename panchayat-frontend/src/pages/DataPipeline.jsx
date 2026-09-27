import React from "react";
import { Database, Settings2, Cpu, Sparkles, LayoutGrid, ArrowRight, CheckCircle2 } from "lucide-react";
import PageShell, { Card } from "../components/PageShell.jsx";
import { PIPELINE_STATUS, DATA_SOURCES } from "../data.js";

const FONT = "Arial, Helvetica, sans-serif";

const STAGES = [
  { icon: Database, label: "Data Sources", detail: "IMD, Satellite, GIS, Historical" },
  { icon: Settings2, label: "Data Processing", detail: "Cleaning, Feature Engineering" },
  { icon: Cpu, label: "ML Model", detail: "Downscaling (XGBoost)" },
  { icon: Sparkles, label: "Prediction", detail: "Panchayat-level Weather" },
  { icon: LayoutGrid, label: "Output", detail: "Dashboard + Advisories" },
];

export default function DataPipeline() {
  return (
    <PageShell title="Data Pipeline" subtitle="Data flow and model processing">
      <Card style={{ fontFamily: FONT }}>
        <div className="text-[13px] font-medium text-[#1C2430] mb-4">How Downscaling Works</div>
        <div className="flex flex-wrap items-stretch justify-between gap-3">
          {STAGES.map((s, i) => (
            <React.Fragment key={s.label}>
              <div className="flex-1 min-w-[130px] rounded-sm border border-[#E4E2D6] p-3.5 flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#EAF1F5" }}>
                  <s.icon size={18} color="#2E6F95" strokeWidth={1.8} />
                </div>
                <div className="text-[12px] text-[#1C2430] font-medium">{s.label}</div>
                <div className="text-[10.5px] text-[#6B7280] leading-snug">{s.detail}</div>
              </div>
              {i < STAGES.length - 1 && (
                <div className="flex items-center justify-center shrink-0">
                  <ArrowRight size={16} color="#C7C4B4" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-12 gap-5">
        <Card className="col-span-12 lg:col-span-6" style={{ fontFamily: FONT }}>
          <div className="text-[13px] font-medium text-[#1C2430] mb-3">Pipeline Status</div>
          {PIPELINE_STATUS.map((s) => (
            <div key={s.step} className="flex items-center justify-between py-2 border-t border-[#EDEBE0] first:border-t-0">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} color="#43714B" />
                <span className="text-[12.5px] text-[#1C2430]">{s.step}</span>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-[#43714B]">{s.status}</div>
                <div className="text-[10px] text-[#9AA2AC]">{s.time}</div>
              </div>
            </div>
          ))}
        </Card>

        <Card className="col-span-12 lg:col-span-6" style={{ fontFamily: FONT }}>
          <div className="text-[13px] font-medium text-[#1C2430] mb-3">Data Sources</div>
          {DATA_SOURCES.map((s) => (
            <div key={s.label} className="flex items-center justify-between py-2 border-t border-[#EDEBE0] first:border-t-0">
              <div>
                <div className="text-[12.5px] text-[#1C2430]">{s.label}</div>
                <div className="text-[10.5px] text-[#6B7280]">{s.detail}</div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EAF3EC] text-[#43714B] shrink-0">{s.status}</span>
            </div>
          ))}
        </Card>
      </div>

      <Card style={{ fontFamily: FONT }}>
        <div className="text-[12px] text-[#5B6472] leading-relaxed">
          This is a demonstration pipeline. In the production system, each stage above corresponds to a real
          FastAPI service: <code className="text-[11px] bg-[#F1F2ED] px-1 rounded-sm">GET /api/weather/block</code>,{" "}
          <code className="text-[11px] bg-[#F1F2ED] px-1 rounded-sm">POST /api/predict</code>,{" "}
          <code className="text-[11px] bg-[#F1F2ED] px-1 rounded-sm">GET /api/advisory</code>, backed by the
          XGBoost downscaling model and a PostgreSQL/PostGIS database.
        </div>
      </Card>
    </PageShell>
  );
}