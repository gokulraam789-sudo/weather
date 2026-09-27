import React, { useEffect, useState } from "react";
import { fetchBlockWeather, fetchPanchayats, API_BASE_URL } from "../api.js";

/**
 * Temporary page to prove the frontend can reach the backend.
 * Visit it at /#/test once your backend is running.
 * Delete this file (and its route in App.jsx) once you're done wiring things up.
 */
export default function ConnectionTest() {
  const [status, setStatus] = useState("loading"); // loading | ok | error
  const [block, setBlock] = useState(null);
  const [panchayats, setPanchayats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [b, p] = await Promise.all([fetchBlockWeather(), fetchPanchayats()]);
        setBlock(b);
        setPanchayats(p);
        setStatus("ok");
      } catch (e) {
        setError(e.message);
        setStatus("error");
      }
    })();
  }, []);

  return (
    <div style={{ padding: 24, fontFamily: "Arial, sans-serif", fontSize: 13 }}>
      <h2>Backend Connection Test</h2>
      <p>Trying: <code>{API_BASE_URL}</code></p>

      {status === "loading" && <p>Loading…</p>}

      {status === "error" && (
        <div style={{ color: "#A6483A" }}>
          <p><b>Failed to reach the backend.</b></p>
          <p>{error}</p>
          <ul>
            <li>Is <code>uvicorn app.main:app --host 0.0.0.0 --port 8000</code> still running?</li>
            <li>In Codespaces, is port 8000 forwarded and set to Public (or at least reachable)?</li>
            <li>Open the URL above directly in a new browser tab — does it load?</li>
          </ul>
        </div>
      )}

      {status === "ok" && (
        <div style={{ color: "#43714B" }}>
          <p><b>✓ Connected.</b> Real data from the backend:</p>
          <pre style={{ background: "#F1F2ED", padding: 12, overflow: "auto" }}>
            {JSON.stringify({ block, panchayatCount: panchayats.length, firstPanchayat: panchayats[0] }, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}