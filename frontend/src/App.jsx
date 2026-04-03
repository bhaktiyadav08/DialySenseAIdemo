import { useState } from "react";
import "./index.css";

import Header       from "./components/Header";
import HistoryTable from "./components/HistoryTable";
import LiveCharts   from "./components/Livecharts";
import SensorCard   from "./components/SensorCard";
import StatsRow     from "./components/StatsRow";
import StatusBanner from "./components/StatusBanner";
import ManualPredict from "./components/ManualPredict";
import Maintenance  from "./components/Maintenance";
import { useDashboard } from "./hooks/useDashboard";

export default function App() {
  const { latest, history, stats, online, lastPoll } = useDashboard();
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="dashboard">
      <Header online={online} lastPoll={lastPoll} />

      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === "dashboard" ? "tab-btn--active" : ""}`}
          onClick={() => setActiveTab("dashboard")}
        >
          LIVE DASHBOARD
        </button>
        <button 
          className={`tab-btn ${activeTab === "manual" ? "tab-btn--active" : ""}`}
          onClick={() => setActiveTab("manual")}
        >
          MANUAL PREDICTION
        </button>
        <button 
          className={`tab-btn ${activeTab === "maintenance" ? "tab-btn--active" : ""}`}
          onClick={() => setActiveTab("maintenance")}
        >
          MAINTENANCE & DIAGNOSTICS
        </button>
      </div>

      {activeTab === "dashboard" && (
        <>
          <StatusBanner latest={latest} />
          <StatsRow stats={stats} />

          <div className="grid-3">
            <SensorCard
              label="TEMPERATURE" icon="🌡️"
              value={latest?.temperature} unit="°C"
              min={20} max={50} color="#f59e0b" warnAt={35}
              subtitle="Fault threshold: 35 °C"
            />
            <SensorCard
              label="FLOW RATE" icon="💧"
              value={latest?.flow_rate} unit="L/min"
              min={0} max={1500} color="#38bdf8" warnAt={1244}
              subtitle="Fault zone: 300–600 or >1244"
            />
            <SensorCard
              label="OUTLET LEVEL" icon="📡"
              value={latest?.water_level} unit="cm"
              min={0} max={30} color="#818cf8"
              subtitle="Critical below: 5 cm"
            />
          </div>

          <LiveCharts history={history} />
          <HistoryTable history={history} />
        </>
      )}

      {activeTab === "manual" && <ManualPredict />}
      
      {activeTab === "maintenance" && <Maintenance latest={latest} />}

      <div className="footer">
        DIALYSENSE AI · ESP32 + XGBOOST · POLLING EVERY 2s
      </div>
    </div>
  );
}