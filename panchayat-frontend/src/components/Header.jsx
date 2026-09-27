import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, MapPin, Building2, Clock, Database, ShieldCheck } from "lucide-react";
import { BLOCK } from "../data.js";
import { useLiveData } from "../DataContext.jsx";

const FONT = "Arial, Helvetica, sans-serif";

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5 py-2 border-t border-[#EDEBE0] first:border-t-0">
      <Icon size={14} color="#6B7280" strokeWidth={1.8} className="mt-0.5" />
      <div className="leading-tight">
        <div className="text-[10.5px] text-[#6B7280]">{label}</div>
        <div className="text-[12.5px] text-[#1C2430]">{value}</div>
      </div>
    </div>
  );
}

export default function Header({ title, subtitle }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const { lastUpdated, refreshCount } = useLiveData();
  const updatedLabel = refreshCount > 0
    ? lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : BLOCK.updated;

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className="flex items-center gap-4 px-7 py-4 bg-white border-b border-[#E4E2D6]" style={{ fontFamily: FONT }}>
      <div>
        <div className="text-[19px] text-[#1C2430] font-medium">{title}</div>
        <div className="text-[12px] text-[#6B7280]">{subtitle}</div>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <span className="text-[11.5px] px-2.5 py-1 rounded-full hidden md:inline" style={{ background: "#EAF3EC", color: "#43714B" }}>Data Status: Simulated (Demo)</span>
        <span className="text-[12px] text-[#5B6472] hidden md:inline">{updatedLabel}</span>

        <div className="relative pl-3 border-l border-[#E4E2D6]" ref={menuRef}>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-haspopup="true"
            aria-expanded={open}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-medium" style={{ background: "#2E6F95" }}>AO</div>
            <div className="leading-tight hidden sm:block text-left">
              <div className="text-[12.5px] text-[#1C2430]">Agri Officer</div>
              <div className="text-[10.5px] text-[#6B7280]">Demo User</div>
            </div>
            <ChevronDown
              size={14}
              color="#6B7280"
              style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}
            />
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-3 w-64 bg-white border border-[#E4E2D6] rounded-sm shadow-lg z-50 p-3">
              <div className="flex items-center gap-2.5 pb-3 mb-1 border-b border-[#EDEBE0]">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[13px] font-medium" style={{ background: "#2E6F95" }}>AO</div>
                <div className="leading-tight">
                  <div className="text-[13px] text-[#1C2430] font-medium">Agri Officer</div>
                  <div className="text-[11px] text-[#6B7280]">Demo User</div>
                </div>
              </div>
              <DetailRow icon={MapPin} label="District" value={BLOCK.district} />
              <DetailRow icon={Building2} label="Block" value={BLOCK.block} />
              <DetailRow icon={Clock} label="Last data update" value={updatedLabel} />
              <DetailRow icon={Database} label="Data status" value="Simulated (Demo)" />
              <DetailRow icon={ShieldCheck} label="Model" value="XGBoost downscaling" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}