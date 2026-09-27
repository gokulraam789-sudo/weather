import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { BLOCK, PANCHAYATS } from "./data.js";
import { fetchBlockWeather, fetchPanchayats, predictPanchayat } from "./api.js";

/**
 * Shared "live" weather data for the whole app, now backed by the FastAPI
 * backend instead of local demo math.
 *
 * Behavior:
 * - On first mount, the UI shows the static demo constants from data.js
 *   immediately (so nothing ever renders blank), then swaps to real data
 *   from the backend as soon as the first fetch completes.
 * - refresh() re-fetches the block weather and panchayat list from the
 *   backend, then also calls POST /api/predict for every panchayat with a
 *   small random jitter applied to the block rainfall — this exercises the
 *   real downscaling endpoint on every refresh, so rainfall/confidence
 *   visibly change each time you click "Refresh Data", the same way the app
 *   behaved before. Temperature/humidity/wind currently come straight from
 *   the panchayat record (the placeholder model in predictor.py doesn't
 *   yet recompute those) — they'll start varying too once a real trained
 *   model is wired in on the backend.
 * - If the backend is unreachable, the app quietly falls back to showing
 *   the static demo data instead of crashing, and exposes `error` in case
 *   any page wants to surface that.
 *
 * Also tracks "Add Panchayat" requests submitted from AddPanchayatModal.
 * There's no backend endpoint for these yet, so they're kept in this
 * browser's localStorage — see addPanchayatRequest below for where to
 * swap in a real POST once that endpoint exists.
 */

const DataContext = createContext(null);

const REQUESTS_KEY = "panchayat_requests_v1";

function loadStoredRequests() {
  try {
    const raw = window.localStorage.getItem(REQUESTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function jitteredBlockRainfall(baseRainfall) {
  // +/- ~20% random jitter, so refreshing produces a visibly different
  // (but still plausible) block reading to feed into /api/predict.
  const factor = 0.8 + Math.random() * 0.4;
  return Math.max(0, Math.round(baseRainfall * factor * 10) / 10);
}

export function DataProvider({ children }) {
  const [liveData, setLiveData] = useState(PANCHAYATS);
  const [blockLive, setBlockLive] = useState(BLOCK);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [refreshCount, setRefreshCount] = useState(0);
  const [error, setError] = useState(null);
  const [panchayatRequests, setPanchayatRequests] = useState(loadStoredRequests);
  const hasLoadedOnce = useRef(false);

  const loadFromBackend = useCallback(async (withPrediction) => {
    const block = await fetchBlockWeather();
    const panchayats = await fetchPanchayats();

    let merged = panchayats;
    if (withPrediction) {
      const rainfallForPredict = jitteredBlockRainfall(block.rainfall);
      const predictions = await Promise.all(
        panchayats.map((p) => predictPanchayat(p.id, rainfallForPredict))
      );
      merged = panchayats.map((p, i) => ({
        ...p,
        rainfall: predictions[i].rainfall,
        confidence: predictions[i].confidence,
      }));
      block.rainfall = rainfallForPredict;
    }

    setBlockLive(block);
    setLiveData(merged);
    setLastUpdated(new Date());
    setError(null);
  }, []);

  // Initial load: try the backend once; keep showing static demo data if it fails.
  useEffect(() => {
    loadFromBackend(false)
      .catch((e) => setError(e.message))
      .finally(() => {
        hasLoadedOnce.current = true;
      });
  }, [loadFromBackend]);

  const refresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await loadFromBackend(true);
      setRefreshCount((c) => c + 1);
    } catch (e) {
      setError(e.message);
      // Keep whatever data was already on screen rather than clearing it.
    } finally {
      setRefreshing(false);
    }
  }, [loadFromBackend, refreshing]);

  // Keep localStorage in sync whenever the request list changes.
  useEffect(() => {
    try {
      window.localStorage.setItem(REQUESTS_KEY, JSON.stringify(panchayatRequests));
    } catch {
      // ignore write failures (e.g. private browsing storage limits)
    }
  }, [panchayatRequests]);

  // Adds a new "missing Panchayat" request submitted from AddPanchayatModal.
  // No backend endpoint exists yet — once one does (e.g. POST /api/panchayat-requests),
  // call it here and keep this local list as an offline fallback if you want.
  const addPanchayatRequest = useCallback((fields) => {
    const entry = {
      id: `${Date.now()}-${Math.round(Math.random() * 1000)}`,
      name: fields.name.trim(),
      nearTo: fields.nearTo?.trim() || "",
      reason: fields.reason?.trim() || "",
      requesterName: fields.requesterName?.trim() || "",
      requesterContact: fields.requesterContact?.trim() || "",
      submittedAt: new Date().toISOString(),
      status: "Pending Review",
    };
    setPanchayatRequests((prev) => [entry, ...prev]);
    return entry;
  }, []);

  const removePanchayatRequest = useCallback((id) => {
    setPanchayatRequests((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return (
    <DataContext.Provider value={{
      liveData, blockLive, refreshing, refresh, lastUpdated, refreshCount, error,
      panchayatRequests, addPanchayatRequest, removePanchayatRequest,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useLiveData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useLiveData must be used within a DataProvider");
  return ctx;
}