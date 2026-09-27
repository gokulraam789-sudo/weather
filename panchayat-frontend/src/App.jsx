import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import { SelectionProvider } from "./SelectionContext.jsx";
import { DataProvider } from "./DataContext.jsx";
import SimulatedNotice from "./components/SimulatedNotice.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import MapView from "./pages/MapView.jsx";
import PanchayatForecast from "./pages/PanchayatForecast.jsx";
import ChartsTrends from "./pages/ChartsTrends.jsx";
import Advisories from "./pages/Advisories.jsx";
import HistoricalData from "./pages/HistoricalData.jsx";
import DataPipeline from "./pages/DataPipeline.jsx";
import ModelInfo from "./pages/ModelInfo.jsx";
import Settings from "./pages/Settings.jsx";
import ConnectionTest from "./pages/ConnectionTest.jsx"; // TEMPORARY — remove once backend is wired up


export default function App() {
  return (
    <DataProvider>
      <SelectionProvider>
        <HashRouter>
          <SimulatedNotice />
          <div
            className="w-full flex"
            style={{ background: "#F4F5F2", minHeight: "100vh", fontFamily: "Arial, Helvetica, sans-serif" }}
          >
            <Sidebar />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/map" element={<MapView />} />
              <Route path="/forecast" element={<PanchayatForecast />} />
              <Route path="/charts" element={<ChartsTrends />} />
              <Route path="/advisories" element={<Advisories />} />
              <Route path="/historical" element={<HistoricalData />} />
              <Route path="/pipeline" element={<DataPipeline />} />
              <Route path="/model" element={<ModelInfo />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/test" element={<ConnectionTest />} /> {/* TEMPORARY */}
            </Routes>
          </div>
        </HashRouter>
      </SelectionProvider>
    </DataProvider>
  );
}