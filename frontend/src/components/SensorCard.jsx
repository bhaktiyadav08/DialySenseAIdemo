function GaugeBar({ value, min, max, color, warnAt }) {
  const pct    = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  const isWarn = warnAt !== undefined && value >= warnAt;
  return (
    <div className="gauge">
      <div className="gauge__track">
        <div
          className="gauge__fill"
          style={{ width: `${pct}%`, background: isWarn ? "#ef4444" : color }}
        />
      </div>
      <div className="gauge__labels">
        <span>{min}</span><span>{max}</span>
      </div>
    </div>
  );
}

export default function SensorCard({ label, icon, value, unit, min, max, color, warnAt, subtitle }) {
  const display = value != null ? Number(value).toFixed(1) : "—";

  return (
    <div className="card sensor-card">
      <div className="sensor-card__label">
        <span className="sensor-card__icon">{icon}</span>
        {label}
      </div>
      <div className="sensor-card__value-row">
        <span className="sensor-card__value">{display}</span>
        <span className="sensor-card__unit">{unit}</span>
      </div>
      {subtitle && <div className="sensor-card__subtitle">{subtitle}</div>}
      <GaugeBar value={value ?? 0} min={min} max={max} color={color} warnAt={warnAt} />
    </div>
  );
}