function StatPill({ label, value, color }) {
  return (
    <div className="stat-pill">
      <div className="stat-pill__value" style={{ color: color ?? "#f1f5f9" }}>
        {value ?? "—"}
      </div>
      <div className="stat-pill__label">{label}</div>
    </div>
  );
}

export default function StatsRow({ stats }) {
  if (!stats) return null;

  const faultColor = stats.fault_rate > 20 ? "#ef4444"
    : stats.fault_rate > 5 ? "#f59e0b"
    : "#10b981";

  return (
    <div className="grid-4">
      <StatPill label="TOTAL READINGS" value={stats.total} />
      <StatPill label="NORMAL"         value={stats.normal}           color="#10b981" />
      <StatPill label="FAULTS"         value={stats.faults}           color="#ef4444" />
      <StatPill label="FAULT RATE"     value={`${stats.fault_rate}%`} color={faultColor} />
    </div>
  );
}