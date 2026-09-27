import React, { useState, useEffect } from "react";
import { BookOpen, LifeBuoy, Info, ChevronRight, X, MapPinPlus, Trash2 } from "lucide-react";
import PageShell, { Card } from "../components/PageShell.jsx";
import { useLiveData } from "../DataContext.jsx";
import { DISTRICT } from "../data.js";

const FONT = "Arial, Helvetica, sans-serif";

function Toggle({ checked, onChange }) {
  return (
    <button onClick={() => onChange(!checked)} className="w-9 h-5 rounded-full relative transition-colors shrink-0"
      style={{ background: checked ? "#2E6F95" : "#D9D6C9" }}>
      <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all" style={{ left: checked ? 18 : 2 }} />
    </button>
  );
}

function Field({ label, value }) {
  return (
    <div className="mb-3">
      <div className="text-[11px] text-[#6B7280] mb-1">{label}</div>
      <div className="text-[13px] border border-[#DEDCD1] rounded-sm px-3 py-1.5 text-[#1C2430] bg-white">{value}</div>
    </div>
  );
}

// NEW: simple popup shown for features that are not built yet
function ComingSoonModal({ title, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(16, 27, 45, 0.45)" }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="bg-white border border-[#E4E2D6] rounded-sm shadow-lg w-[90%] max-w-sm p-5"
        style={{ fontFamily: FONT }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-[14px] font-medium text-[#1C2430]">{title}</span>
          <button onClick={onClose} aria-label="Close"><X size={15} color="#6B7280" /></button>
        </div>
        <div className="text-[13px] text-[#3B4451] py-3">Will get added soon</div>
        <div className="flex justify-end">
          <button onClick={onClose} className="text-[12.5px] px-3 py-1.5 rounded-sm text-white" style={{ background: "#101B2D" }}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Settings() {
  const [notif, setNotif] = useState(true);
  const [demoData, setDemoData] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [modalTitle, setModalTitle] = useState(null); // NEW: which popup is open (null = none)
  const { panchayatRequests, removePanchayatRequest } = useLiveData();

  return (
    <PageShell title="Settings" subtitle="Configure your application">
      <div className="flex gap-2 border-b border-[#E4E2D6]">
        <button className="px-3 py-2 text-[12.5px] -mb-px border-b-2" style={{ color: "#2E6F95", borderColor: "#2E6F95" }}>Profile</button>
      </div>

      <div className="grid grid-cols-12 gap-5">
        <Card className="col-span-12 lg:col-span-5" style={{ fontFamily: FONT }}>
          <div className="text-[13px] font-medium text-[#1C2430] mb-3">User Profile</div>
          <Field label="Name" value="Demo User" />
          <Field label="Role" value="Agriculture Officer" />
          <Field label="Email" value="demo@panchayatweather.in" />
          <Field label="District" value={DISTRICT} />
        </Card>

        <Card className="col-span-12 lg:col-span-7" style={{ fontFamily: FONT }}>
          <div className="text-[13px] font-medium text-[#1C2430] mb-3">System Settings</div>
          <div className="flex items-center justify-between py-2 border-t border-[#EDEBE0] first:border-t-0">
            <span className="text-[12.5px] text-[#3B4451]">Data Refresh Interval</span>
            <select className="text-[12px] border border-[#DEDCD1] rounded-sm px-2 py-1 bg-white text-[#1C2430]">
              <option>15 minutes</option><option>1 hour</option><option>6 hours</option>
            </select>
          </div>
          <div className="flex items-center justify-between py-2 border-t border-[#EDEBE0]">
            <span className="text-[12.5px] text-[#3B4451]">Show Demo Data</span>
            <Toggle checked={demoData} onChange={setDemoData} />
          </div>
          <div className="flex items-center justify-between py-2 border-t border-[#EDEBE0]">
            <span className="text-[12.5px] text-[#3B4451]">Enable Notifications</span>
            <Toggle checked={notif} onChange={setNotif} />
          </div>
          <div className="flex items-center justify-between py-2 border-t border-[#EDEBE0]">
            <span className="text-[12.5px] text-[#3B4451]">Dark Mode</span>
            <Toggle checked={darkMode} onChange={setDarkMode} />
          </div>
          <div className="flex items-center justify-between py-2 border-t border-[#EDEBE0]">
            <span className="text-[12.5px] text-[#3B4451]">Data Privacy</span>
            <button onClick={() => setModalTitle("Data Privacy Policy")} className="text-[11.5px] text-[#2E6F95]">View Policy</button>
          </div>
          <div className="flex items-center justify-between py-2 border-t border-[#EDEBE0]">
            <span className="text-[12.5px] text-[#3B4451]">Language</span>
            <select className="text-[12px] border border-[#DEDCD1] rounded-sm px-2 py-1 bg-white text-[#1C2430]">
              <option>English</option><option>Tamil</option><option>Hindi</option>
            </select>
          </div>
        </Card>
      </div>

      <Card style={{ fontFamily: FONT }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <MapPinPlus size={15} color="#0F8074" />
            <span className="text-[13px] font-medium text-[#1C2430]">Panchayat Requests</span>
          </div>
          {panchayatRequests.length > 0 && (
            <span className="text-[10.5px] px-2 py-0.5 rounded-full" style={{ background: "#D7F2EA", color: "#0F8074" }}>
              {panchayatRequests.length} pending
            </span>
          )}
        </div>

        {panchayatRequests.length === 0 ? (
          <div className="text-[12px] text-[#8A93A0]">
            No requests yet. Use "Add Panchayat" on the Dashboard to submit one.
          </div>
        ) : (
          panchayatRequests.map((r) => (
            <div key={r.id} className="flex items-start justify-between gap-3 py-2.5 border-t border-[#EDEBE0] first:border-t-0">
              <div className="min-w-0">
                <div className="text-[12.5px] text-[#1C2430] font-medium">{r.name}</div>
                {r.nearTo && <div className="text-[11px] text-[#6B7280]">Near: {r.nearTo}</div>}
                {r.reason && <div className="text-[11px] text-[#6B7280]">{r.reason}</div>}
                {(r.requesterName || r.requesterContact) && (
                  <div className="text-[10.5px] text-[#9AA2AC]">
                    Submitted by {r.requesterName || "Anonymous"}{r.requesterContact ? ` · ${r.requesterContact}` : ""}
                  </div>
                )}
                <div className="text-[10px] text-[#9AA2AC] mt-0.5">
                  {new Date(r.submittedAt).toLocaleString()}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10.5px] px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: "#FDECD3", color: "#C2760B" }}>
                  {r.status}
                </span>
                <button onClick={() => removePanchayatRequest(r.id)} aria-label="Dismiss request">
                  <Trash2 size={13} color="#9AA2AC" />
                </button>
              </div>
            </div>
          ))
        )}
        <div className="text-[10.5px] text-[#9AA2AC] mt-2 pt-2 border-t border-[#EDEBE0]">
          Stored on this device only (no backend yet) — see the About the System note for how this connects once the API is built.
        </div>
      </Card>

      <Card style={{ fontFamily: FONT }}>
        <div className="text-[13px] font-medium text-[#1C2430] mb-3">Help & Support</div>
        {[
          { icon: BookOpen, label: "User Guide" },
          { icon: LifeBuoy, label: "Contact Support" },
          { icon: Info, label: "About the System" },
        ].map((s) => (
          <button key={s.label} onClick={() => setModalTitle(s.label)} className="w-full flex items-center gap-2.5 py-2.5 border-t border-[#EDEBE0] first:border-t-0 text-left">
            <s.icon size={15} color="#5B6472" />
            <span className="text-[12.5px] text-[#3B4451] flex-1">{s.label}</span>
            <ChevronRight size={14} color="#9AA2AC" />
          </button>
        ))}
      </Card>

      {modalTitle && <ComingSoonModal title={modalTitle} onClose={() => setModalTitle(null)} />}
    </PageShell>
  );
}