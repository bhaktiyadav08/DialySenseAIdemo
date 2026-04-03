const tsLabel = (iso) => {
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}:${d.getSeconds().toString().padStart(2,"0")}`;
};

export default function HistoryTable({ history }) {
  if (!history || history.length === 0) return null;

  const rows = [...history].reverse();

  return (
    <div className="card history">
      <div className="history__header">RECENT READINGS</div>
      <div className="history__scroll">
        <table className="history__table">
          <thead>
            <tr>
              {["TIME", "TEMP (°C)", "FLOW (L/min)", "LEVEL (cm)", "ML STATUS", "ESP32"].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const isNormal = r.status === "normal";
              return (
                <tr key={r._id || i}>
                  <td className="history__time">{tsLabel(r.timestamp)}</td>
                  <td>{Number(r.temperature).toFixed(1)}</td>
                  <td>{Number(r.flow_rate).toFixed(1)}</td>
                  <td>{Number(r.water_level).toFixed(1)}</td>
                  <td>
                    <span className={`badge ${isNormal ? "badge--normal" : "badge--fault"}`}>
                      {(r.ml_status || r.status)?.toUpperCase()}
                    </span>
                  </td>
                  <td className={r.esp_fault ? "text--warn" : "text--normal"}>
                    {r.esp_fault ? (r.esp_fault_msg || "FAULT") : "OK"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}