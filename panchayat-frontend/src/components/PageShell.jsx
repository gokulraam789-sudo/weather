import React from "react";
import Header from "./Header.jsx";

const FONT = "Arial, Helvetica, sans-serif";

export default function PageShell({ title, subtitle, children }) {
  return (
    <div className="flex-1 min-w-0" style={{ fontFamily: FONT }}>
      <Header title={title} subtitle={subtitle} />
      <div className="p-6 flex flex-col gap-5">{children}</div>
    </div>
  );
}

export function Card({ children, className = "", style = {} }) {
  return (
    <div className={"bg-white border border-[#E4E2D6] rounded-sm p-4 " + className} style={{ fontFamily: FONT, ...style }}>
      {children}
    </div>
  );
}

export function SectionLabel({ children, tag }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <span className="text-[13px] font-medium text-[#1C2430]">{children}</span>
      {tag && <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-[#F1F2ED] text-[#5B6472]">{tag}</span>}
    </div>
  );
}