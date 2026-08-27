from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import ml.predict as predictor
from pymongo import MongoClient
from datetime import datetime
import threading
import requests
import time
import os

# ── Paths ─────────────────────────────────────────────────────────────────────
BASE_DIR      = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIST = os.path.join(BASE_DIR, '..', 'frontend', 'dist')

app = Flask(__name__, static_folder=FRONTEND_DIST, static_url_path='')
CORS(app)

# ── MongoDB ──────────────────────────────────────────────────────────────────
client = MongoClient("mongodb://localhost:27017/")
db = client["dialysense"]
collection = db["sensor_data"]

# ── ESP32 Config ─────────────────────────────────────────────────────────────
ESP32_IP = os.environ.get("ESP32_IP", "10.81.254.246")   # change or set env var
ESP32_URL = f"http://{ESP32_IP}/json"
POLL_INTERVAL = 2   # seconds


# ── In-memory cache for latest reading ───────────────────────────────────────
latest_reading = {}

# ── Background Poller ─────────────────────────────────────────────────────────
def poll_esp32():
    global latest_reading
    while True:
        try:
            resp = requests.get(ESP32_URL, timeout=3)
            if resp.status_code == 200:
                data = resp.json()

                temperature  = float(data.get("temperature", 0))
                flow_rate    = float(data.get("flow_rate", 0))
                water_level  = float(data.get("water_level", 0))

                # Run ML prediction
                ml_status = predictor.predict_status(temperature, flow_rate, water_level)

                # Combine ESP32 fault + ML prediction
                esp_fault   = data.get("fault", False)
                esp_msg     = data.get("fault_msg", "").strip()
                final_status = ml_status if ml_status != "error" else ("fault" if esp_fault else "normal")

                rul = predictor.estimate_rul(temperature, flow_rate, water_level)
                xai = predictor.explain_status(temperature, flow_rate, water_level, final_status)

                record = {
                    "temperature":  temperature,
                    "flow_rate":    flow_rate,
                    "water_level":  water_level,
                    "esp_fault":    esp_fault,
                    "esp_fault_msg": esp_msg,
                    "ml_status":    ml_status,
                    "status":       final_status,
                    "rul_percent":  rul,
                    "explanation":  xai["explanation"],
                    "maintenance_action": xai["maintenance_action"],
                    "timestamp":    datetime.now()
                }

                collection.insert_one(record)
                record["_id"] = str(record["_id"])
                record["timestamp"] = record["timestamp"].isoformat()
                latest_reading = record

        except requests.exceptions.ConnectionError:
            print(f"[Poller] ESP32 not reachable at {ESP32_URL}")
        except Exception as e:
            print(f"[Poller] Error: {e}")

        time.sleep(POLL_INTERVAL)


# Start poller in background
poller_thread = threading.Thread(target=poll_esp32, daemon=True)
poller_thread.start()

# ── Routes ────────────────────────────────────────────────────────────────────

@app.route('/')
def serve_react():
    return send_from_directory(app.static_folder, 'index.html')

@app.errorhandler(404)
def not_found(e):
    # Let React Router handle client-side routes
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/latest', methods=['GET'])
def get_latest():
    if not latest_reading:
        return jsonify({"error": "No data yet"}), 503
    return jsonify(latest_reading)

@app.route('/api/history', methods=['GET'])
def get_history():
    limit = int(request.args.get('limit', 20))
    records = list(collection.find().sort("timestamp", -1).limit(limit))
    for r in records:
        r['_id'] = str(r['_id'])
        r['timestamp'] = r['timestamp'].isoformat() if hasattr(r['timestamp'], 'isoformat') else str(r['timestamp'])
    return jsonify(records[::-1])   # oldest → newest for chart

@app.route('/api/stats', methods=['GET'])
def get_stats():
    total   = collection.count_documents({})
    faults  = collection.count_documents({"status": {"$ne": "normal"}})
    normal  = total - faults
    return jsonify({
        "total": total,
        "faults": faults,
        "normal": normal,
        "fault_rate": round((faults / total * 100), 1) if total else 0
    })

# Legacy manual predict (keep for testing)
@app.route('/predict', methods=['POST'])
def predict():
    global latest_reading
    data        = request.json
    temperature = float(data['temperature'])
    flow_rate   = float(data['flow_rate'])
    water_level = float(data['water_level'])
    result      = predictor.predict_status(temperature, flow_rate, water_level)
    
    rul = predictor.estimate_rul(temperature, flow_rate, water_level)
    xai = predictor.explain_status(temperature, flow_rate, water_level, result)
    
    record = {
        "temperature": temperature, "flow_rate": flow_rate,
        "water_level": water_level, "status": result,
        "esp_fault": False, "esp_fault_msg": "Simulator data",
        "ml_status": result,
        "rul_percent": rul,
        "explanation": xai["explanation"],
        "maintenance_action": xai["maintenance_action"],
        "timestamp": datetime.now()
    }
    collection.insert_one(record)
    record["_id"] = str(record["_id"])
    record["timestamp"] = record["timestamp"].isoformat()
    latest_reading = record
    return jsonify({"status": result, "rul_percent": rul, "explanation": xai["explanation"], "maintenance_action": xai["maintenance_action"]})

@app.route('/api/predict_manual', methods=['POST'])
def predict_manual():
    data = request.json
    temperature = float(data.get('temperature', 25))
    flow_rate = float(data.get('flow_rate', 1000))
    water_level = float(data.get('water_level', 20))
    
    ml_status = predictor.predict_status(temperature, flow_rate, water_level)
    rul = predictor.estimate_rul(temperature, flow_rate, water_level)
    xai = predictor.explain_status(temperature, flow_rate, water_level, ml_status)
    
    return jsonify({
        "status": ml_status,
        "rul_percent": rul,
        "explanation": xai["explanation"],
        "maintenance_action": xai["maintenance_action"]
    })

@app.route('/data', methods=['GET'])
def get_data():
    records = list(collection.find().sort("timestamp", -1).limit(20))
    for r in records:
        r['_id'] = str(r['_id'])
    return jsonify(records)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)