export default function StatusBanner({ latest }) {
  if (!latest) {
    return <div className="banner__waiting">Waiting for sensor data...</div>;
  }

  const isNormal = latest.status === "normal";

  return (
    <div className={`banner ${isNormal ? "banner--normal" : "banner--fault"}`}>
      <div className="banner__icon">{isNormal ? "🟢" : "🔴"}</div>
      <div>
        <div className={`banner__title ${isNormal ? "banner__title--normal" : "banner__title--fault"}`}>
          {isNormal ? "SYSTEM NORMAL" : "⚠ FAULT DETECTED"}
        </div>
        <div className="banner__subtitle">
          ML Model:&nbsp;
          <span className={latest.ml_status === "normal" ? "text--normal" : "text--warn"}>
            {(latest.ml_status || latest.status)?.toUpperCase()}
          </span>
          {latest.esp_fault_msg ? (
            <>&nbsp;&nbsp;·&nbsp;&nbsp;ESP32:&nbsp;<span className="text--warn">{latest.esp_fault_msg}</span></>
          ) : (
            <>&nbsp;&nbsp;·&nbsp;&nbsp;ESP32:&nbsp;<span className="text--normal">OK</span></>
          )}
        </div>
      </div>
    </div>
  );
}