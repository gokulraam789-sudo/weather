import React, { useEffect, useState } from "react";
import { X, AlertTriangle } from "lucide-react";

// Shows once when the app first loads (per browser tab session), on top of
// everything else. Dismissing it does not delete anything — it stays closed
// only for the current tab; a fresh visit (new tab/window) shows it again.
export default function SimulatedNotice() {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(16, 27, 45, 0.55)" }}
      onClick={() => setOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="simulated-notice-title"
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "#FDF3E9" }}>
            <AlertTriangle size={17} color="#C08A3E" strokeWidth={2} />
          </div>
          <div id="simulated-notice-title" className="text-[15px] font-semibold text-[#1C2430]">
            Demo Data Notice
          </div>
        </div>

        <p className="text-[13.5px] text-[#3B4451] leading-relaxed mb-4">
          Everything shown in the app right now is simulated, not real.
        </p>

        <button
          onClick={() => setOpen(false)}
          className="w-full text-[13px] py-2 rounded-lg text-white"
          style={{ background: "#101B2D" }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}