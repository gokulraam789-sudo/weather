import React, { createContext, useContext, useState } from "react";
import { DEFAULT_PANCHAYAT_ID, CROPS } from "./data.js";

const SelectionContext = createContext(null);

export function SelectionProvider({ children }) {
  const [selectedId, setSelectedId] = useState(DEFAULT_PANCHAYAT_ID);
  const [crop, setCrop] = useState("Rice (Paddy)");
  const [stage, setStage] = useState("Vegetative");

  function setCropSafe(c) {
    setCrop(c);
    setStage(CROPS[c][0]);
  }

  return (
    <SelectionContext.Provider value={{ selectedId, setSelectedId, crop, setCrop: setCropSafe, stage, setStage }}>
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection() {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error("useSelection must be used within SelectionProvider");
  return ctx;
}
