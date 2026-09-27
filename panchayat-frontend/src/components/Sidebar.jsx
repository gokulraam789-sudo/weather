import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Map as MapIcon, Sprout, BarChart3, Bell,
  History as HistoryIcon, Database, Cpu, Settings, ChevronRight,
} from "lucide-react";

const NAV = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/map", icon: MapIcon, label: "Map View" },
  { to: "/forecast", icon: Sprout, label: "Panchayat Forecast" },
  { to: "/charts", icon: BarChart3, label: "Charts & Trends" },
  { to: "/advisories", icon: Bell, label: "Advisories" },
  { to: "/historical", icon: HistoryIcon, label: "Historical Data" },
  { to: "/pipeline", icon: Database, label: "Data Pipeline" },
  { to: "/model", icon: Cpu, label: "Model Info" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  return (
    <aside
      className="w-[240px] shrink-0 hidden lg:flex flex-col"
      style={{ background: "#0E2A4A", fontFamily: "Arial, Helvetica, sans-serif" }}
    >
      <div className="px-5 pt-5 pb-4 flex items-start gap-2.5 border-b" style={{ borderColor: "#1C3E60" }}>
        <div>
          <div className="text-[13.5px] font-medium text-white leading-tight">Panchayat Weather<br />Intelligence System</div>
          <div className="text-[10.5px] text-[#8CA9C6] mt-1 leading-tight">AI-powered Panchayat-level weather downscaling</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        {NAV.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              "flex items-center gap-2.5 px-2.5 py-2 rounded-sm mb-0.5 transition-colors " +
              (isActive ? "" : "hover:bg-[#163a5c]")
            }
            style={({ isActive }) => ({ background: isActive ? "#1F4A78" : "transparent" })}
          >
            {({ isActive }) => (
              <>
                <item.icon size={15} color={isActive ? "#A9D2F5" : "#8CA9C6"} strokeWidth={1.8} />
                <span className="text-[12.5px]" style={{ color: isActive ? "white" : "#BBD1E8" }}>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 pb-4">
        <div className="rounded-sm p-3 mb-3" style={{ background: "#153454" }}>
          <div className="text-[11.5px] font-medium text-[#D3E4F5] mb-1">About This System</div>
          <div className="text-[10.5px] text-[#8CA9C6] leading-snug mb-2">AI-powered downscaling from Block-level to Panchayat-level for better agricultural decisions.</div>
        </div>
        <div className="rounded-sm p-3" style={{ background: "#2E210F", border: "1px solid #6B4E23" }}>
          <div className="text-[10.5px] text-[#E4C88C] leading-snug">All data shown here is simulated for demonstration purposes only and should not be used for real-world decisions.</div>
        </div>
      </div>
    </aside>
  );
}