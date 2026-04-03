export default function Maintenance({ latest }) {
  if (!latest) {
    return (
      <div className="banner__waiting">
        Waiting for initial system diagnostics to process maintenance report...
      </div>
    );
  }

  const rul = latest.rul_percent || 100;
  
  return (
    <div className="card" style={{ padding: "32px", maxWidth: "800px", margin: "0 auto" }}>
      <div className="header__eyebrow" style={{ marginBottom: "20px" }}>DIAGNOSTICS REPORT</div>
      <h2 className="header__title" style={{ fontSize: "28px", marginBottom: "32px" }}>
        System <span>Health</span> & Actions
      </h2>

      <div className="rul-gauge" style={{ background: "#0a0f1a" }}>
        <div className="maint-title">SYSTEM HEALTH (RUL)</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
          <div className="sensor-card__value">{rul}%</div>
          <div className="sensor-card__subtitle">Remaining Useful Life</div>
        </div>
        <div className="rul-gauge__bar">
          <div className="rul-gauge__fill" style={{ width: `${rul}%` }}></div>
        </div>
      </div>

      <div className="grid-3" style={{ gridTemplateColumns: "1fr" }}>
        <div className="stat-pill" style={{ textAlign: "left", padding: "24px" }}>
          <div className="maint-title">EXPLAINABLE AI INSIGHTS</div>
          <div className="maint-text">
            {latest.explanation || "System operating within optimal parameters."}
          </div>
        </div>

        <div className="stat-pill" style={{ textAlign: "left", padding: "24px", border: "1px solid rgba(245, 158, 11, 0.4)" }}>
          <div className="maint-title" style={{ color: "#f59e0b" }}>REQUIRED MAINTENANCE</div>
          <div className="maint-text">
            {latest.maintenance_action || "None required at this time."}
          </div>
        </div>
      </div>
    </div>
  );
}
