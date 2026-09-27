import React from "react";
import { RefreshCw } from "lucide-react";
import { BLOCK, PANCHAYATS } from "../data.js";
import { useSelection } from "../SelectionContext.jsx";
import { useLiveData } from "../DataContext.jsx";

const FONT = "Arial, Helvetica, sans-serif";

// allSelected: with panchayatAll, whether the "All Panchayats" option is the current choice.
// onSelect: optional callback called with "__all__" or the chosen panchayat id.
export default function LocationBar({ panchayatAll = false, allSelected = true, onSelect = null, extra = null }) {
  const { selectedId, setSelectedId } = useSelection();
  const { refresh, refreshing, lastUpdated } = useLiveData();
  return (
    <div className="bg-white border border-[#E4E2D6] rounded-sm p-4 flex flex-wrap items-end gap-4" style={{ fontFamily: FONT }}>
      <div>
        <div className="text-[11px] text-[#6B7280] mb-1">District</div>
        <div className="text-[13px] border border-[#DEDCD1] rounded-sm px-3 py-1.5 min-w-[150px] text-[#1C2430]">{BLOCK.district}</div>
      </div>
      <div>
        <div className="text-[11px] text-[#6B7280] mb-1">Block</div>
        <div className="text-[13px] border border-[#DEDCD1] rounded-sm px-3 py-1.5 min-w-[150px] text-[#1C2430]">{BLOCK.block}</div>
      </div>
      <div>
        <div className="text-[11px] text-[#6B7280] mb-1">Panchayat</div>
        <select
          value={panchayatAll && allSelected ? "__all__" : selectedId}
          onChange={(e) => {
            const v = e.target.value;
            if (v !== "__all__") setSelectedId(v);
            if (onSelect) onSelect(v);
          }}
          className="text-[13px] border border-[#DEDCD1] rounded-sm px-3 py-1.5 min-w-[150px] text-[#1C2430] bg-white"
        >
          {panchayatAll && <option value="__all__">All Panchayats</option>}
          {PANCHAYATS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      {extra}
      <div className="ml-auto flex items-center gap-3">
        <span className="text-[10.5px] text-[#6B7280]">
          Last updated: {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </span>
        <button
          onClick={refresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 text-[12.5px] px-3 py-1.5 rounded-sm border disabled:opacity-60"
          style={{ borderColor: "#2E6F95", color: "#2E6F95" }}
        >
          <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>
    </div>
  );
}