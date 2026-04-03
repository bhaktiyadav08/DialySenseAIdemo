import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const tsLabel = (iso) => {
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}:${d.getSeconds().toString().padStart(2,"0")}`;
};

function MiniChart({ data, dataKey, color, label, unit }) {
  return (
    <div className="card chart-card">
      <div className="chart-card__label">
        {label} <span className="chart-card__unit">({unit})</span>
      </div>
      <ResponsiveContainer width="100%" height={100}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="ts" tick={{ fontSize: 9, fill: "#475569" }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 9, fill: "#475569" }} />
          <Tooltip
            contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: "#94a3b8" }}
            itemStyle={{ color }}
          />
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function LiveCharts({ history }) {
  if (!history || history.length < 2) return null;

  const data = history.map(r => ({
    ts:          tsLabel(r.timestamp),
    temperature: parseFloat(r.temperature),
    flow_rate:   parseFloat(r.flow_rate),
    water_level: parseFloat(r.water_level),
  }));

  return (
    <div className="grid-3">
      <MiniChart data={data} dataKey="temperature" color="#f59e0b" label="TEMPERATURE" unit="°C"    />
      <MiniChart data={data} dataKey="flow_rate"   color="#38bdf8" label="FLOW RATE"   unit="L/min" />
      <MiniChart data={data} dataKey="water_level" color="#818cf8" label="OUTLET LEVEL" unit="cm"  />
    </div>
  );
}