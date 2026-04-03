import { useState } from "react";

export default function ManualPredict() {
  const [formData, setFormData] = useState({
    temperature: 25,
    flow_rate: 1000,
    water_level: 20,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: Number(e.target.value) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/predict_manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="card form-card">
      <h2 className="header__title" style={{ fontSize: "24px", marginBottom: "20px" }}>
        Manual <span>Prediction</span>
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">TEMPERATURE (°C)</label>
            <input 
              type="number" step="0.1" name="temperature" 
              value={formData.temperature} onChange={handleChange} 
              className="form-input" required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">FLOW RATE (L/min)</label>
            <input 
              type="number" step="0.1" name="flow_rate" 
              value={formData.flow_rate} onChange={handleChange} 
              className="form-input" required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">WATER LEVEL (cm)</label>
            <input 
              type="number" step="0.1" name="water_level" 
              value={formData.water_level} onChange={handleChange} 
              className="form-input" required 
            />
          </div>
        </div>
        <button type="submit" className="form-btn" disabled={loading}>
          {loading ? "PREDICTING..." : "RUN ML DIAGNOSTIC"}
        </button>
      </form>

      {result && (
        <div className="result-card">
          <div className="maint-block">
            <div className="maint-title">PREDICTION STATUS</div>
            <div className={`banner__title banner__title--${result.status === "normal" ? "normal" : "fault"}`}>
              {result.status.toUpperCase()}
            </div>
          </div>
          
          <div className="rul-gauge">
            <div className="maint-title">ESTIMATED RUL (REMAINING USEFUL LIFE)</div>
            <div className="sensor-card__value">{result.rul_percent}%</div>
            <div className="rul-gauge__bar">
              <div className="rul-gauge__fill" style={{ width: `${result.rul_percent}%` }}></div>
            </div>
          </div>

          <div className="maint-block">
            <div className="maint-title">AI EXPLANATION</div>
            <div className="maint-text">{result.explanation}</div>
          </div>

          <div className="maint-block" style={{ marginBottom: 0 }}>
            <div className="maint-title">MAINTENANCE ACTION</div>
            <div className="maint-text" style={{ color: "#f59e0b" }}>{result.maintenance_action}</div>
          </div>
        </div>
      )}
    </div>
  );
}
