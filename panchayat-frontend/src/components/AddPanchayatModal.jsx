import React, { useState, useEffect } from "react";
import { X, MapPinPlus, CheckCircle2 } from "lucide-react";
import { useLiveData } from "../DataContext.jsx";

const FONT = "Arial, Helvetica, sans-serif";

function Field({ label, required, children }) {
  return (
    <div className="mb-3">
      <div className="text-[11px] text-[#6B7280] mb-1">
        {label} {required && <span style={{ color: "#A6483A" }}>*</span>}
      </div>
      {children}
    </div>
  );
}

const inputClass = "w-full text-[13px] border border-[#DEDCD1] rounded-sm px-3 py-1.5 text-[#1C2430] bg-white";

export default function AddPanchayatModal({ open, onClose }) {
  const { addPanchayatRequest } = useLiveData();

  const [name, setName] = useState("");
  const [nearTo, setNearTo] = useState("");
  const [reason, setReason] = useState("");
  const [requesterName, setRequesterName] = useState("");
  const [requesterContact, setRequesterContact] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Reset the form each time the modal is freshly opened.
  useEffect(() => {
    if (open) {
      setName(""); setNearTo(""); setReason("");
      setRequesterName(""); setRequesterContact("");
      setError(""); setSubmitted(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Panchayat name is required.");
      return;
    }
    addPanchayatRequest({ name, nearTo, reason, requesterName, requesterContact });
    setSubmitted(true);
  };

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
      style={{ background: "rgba(16, 27, 45, 0.55)" }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
        style={{ fontFamily: FONT }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 text-[#8A93A0] hover:text-[#1C2430]">
          <X size={18} />
        </button>

        {!submitted ? (
          <>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "#DCEEF9" }}>
                <MapPinPlus size={17} color="#1D6FA6" strokeWidth={2} />
              </div>
              <div className="text-[15px] font-semibold text-[#1C2430]">Add a Missing Panchayat</div>
            </div>
            <p className="text-[12px] text-[#6B7280] mb-4">
              Don't see your Panchayat listed? Submit a request and it'll be reviewed for the next update.
            </p>

            <form onSubmit={handleSubmit}>
              <Field label="Panchayat Name" required>
                <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Vellampatti" />
              </Field>
              <Field label="Nearest known Panchayat or landmark">
                <input className={inputClass} value={nearTo} onChange={(e) => setNearTo(e.target.value)} placeholder="e.g. Near Kariyapatti" />
              </Field>
              <Field label="Additional notes">
                <textarea className={inputClass} rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Anything that helps locate or verify it" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Your name">
                  <input className={inputClass} value={requesterName} onChange={(e) => setRequesterName(e.target.value)} placeholder="Optional" />
                </Field>
                <Field label="Contact (phone/email)">
                  <input className={inputClass} value={requesterContact} onChange={(e) => setRequesterContact(e.target.value)} placeholder="Optional" />
                </Field>
              </div>

              {error && <div className="text-[12px] mb-2" style={{ color: "#A6483A" }}>{error}</div>}

              <div className="text-[10.5px] text-[#9AA2AC] mb-4">
                This is a demo prototype — requests are saved on this device only, not sent to a server yet.
              </div>

              <button type="submit" className="w-full text-[13px] py-2 rounded-lg text-white" style={{ background: "#101B2D" }}>
                Submit Request
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "#D7F2EA" }}>
              <CheckCircle2 size={22} color="#0F8074" strokeWidth={2} />
            </div>
            <div className="text-[15px] font-semibold text-[#1C2430] mb-1">Request Submitted</div>
            <p className="text-[12.5px] text-[#6B7280] mb-4">
              Thanks — "{name}" has been added to the pending list. You can see it under Settings.
            </p>
            <button onClick={onClose} className="w-full text-[13px] py-2 rounded-lg text-white" style={{ background: "#101B2D" }}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}