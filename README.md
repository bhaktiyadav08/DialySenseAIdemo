# DialySenseAI 🏥
 
> IoT + ML Based Predictive Maintenance System for Dialysis Machines
 
[![Python](https://img.shields.io/badge/Python-3.10+-blue?style=flat-square&logo=python)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.0-black?style=flat-square&logo=flask)](https://flask.palletsprojects.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?style=flat-square&logo=mongodb)](https://mongodb.com)
[![XGBoost](https://img.shields.io/badge/XGBoost-2.0-orange?style=flat-square)](https://xgboost.readthedocs.io)
[![ESP32](https://img.shields.io/badge/ESP32-Arduino-red?style=flat-square&logo=arduino)](https://espressif.com)
 
🏆 **3rd Place — Tech Forge Innovation 2K26**
 
---
 
## 📌 The Problem
 
Predictive maintenance has existed for years in industrial equipment. We asked — **why not for medical equipment?**
 
A dialysis machine runs for 3–4 hours per session with a patient's blood circulating through it. A single undetected failure mid-session can be life-threatening. Yet most machines today only alarm **after** failure has already occurred.
 
**DialySenseAI changes that.**
 
---
 
## 💡 What It Does
 
DialySenseAI is a real-time IoT monitoring and ML-based fault detection system that:
 
- Continuously monitors **temperature, flow rate, and outlet fluid level** via ESP32 sensors
- Runs an **XGBoost classifier** to detect faults in real time
- Estimates **Remaining Useful Life (RUL)** as a machine health percentage
- Provides **Explainable AI** — tells technicians not just that something failed, but exactly what and what to do
- Displays everything on a **live React dashboard** with charts, gauges and history
- Triggers **relay shutdown and buzzer alert** on fault detection
---
 
## 🏗️ System Architecture
 
```
┌─────────────────────────────────────┐
│           HARDWARE LAYER            │
│   DS18B20    YF-S201    HC-SR04     │
│   (Temp)    (Flow)     (Level)      │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│           ESP32 MODULE              │
│  Reads sensors every 300ms          │
│  Rule-based fault check             │
│  Updates 16x2 LCD display           │
│  Hosts /json endpoint over WiFi     │
└──────────────┬──────────────────────┘
               ↓ HTTP GET every 2s
┌─────────────────────────────────────┐
│         FLASK BACKEND               │
│  Polls ESP32 /json                  │
│  Runs XGBoost prediction            │
│  Computes RUL + Explanation         │
│  Saves to MongoDB                   │
│  Serves REST API                    │
└──────────────┬──────────────────────┘
               ↓
┌──────────────┴──────────────────────┐
│    MongoDB          React UI        │
│  Stores all      Live Dashboard     │
│  readings        Charts + Status    │
└─────────────────────────────────────┘
```
 
---
 
## 🛠️ Tech Stack
 
| Layer | Technology |
|-------|-----------|
| Firmware | Arduino C++ on ESP32 |
| Backend | Python Flask |
| Database | MongoDB |
| ML Model | XGBoost |
| Frontend | React 18 + Recharts |
| Communication | HTTP over WiFi |
 
---

## 🚀 Getting Started
 
### Prerequisites
 
- Python 3.10+
- Node.js 18+
- MongoDB running locally
- Arduino IDE (for ESP32 upload)
---
 
### 1. Clone the Repository
 
```bash
git clone https://github.com/bhaktiyadav08/DialySenseAI.git
cd DialySenseAI
```
 
---
 
### 2. Backend Setup
 
```bash
cd backend
python -m venv .venv
 
# Windows
.venv\Scripts\activate
 
# Mac/Linux
source .venv/bin/activate
 
pip install flask flask-cors pymongo requests joblib xgboost scikit-learn pandas numpy
```
 
---
 
### 3. Train the Model
 
```bash
python ml/training.py
```
 
This trains XGBoost on the simulated dataset and saves `models/model.pkl`.
 
---
 
### 4. Configure ESP32 IP
 
Open `backend/app.py` and set your ESP32's IP address:
 
 
---
 
### 5. Run Flask Backend
 
```bash
python -m backend.app
```
 
Flask starts on `http://localhost:5000`
 
---
 
### 6. Frontend Setup
 
```bash
cd frontend
npm install
npm run dev
```
 
Open `http://localhost:5173`
 
---
 
### 7. ESP32 Firmware Upload
 
1. Open `esp32/esp32_dialysense.ino` in Arduino IDE
2. Fill in your WiFi credentials:
3. Set static IP matching `app.py`:
4. Select board: **ESP32 Dev Module**
5. Click **Upload**
6. Open Serial Monitor at **115200 baud** — note the IP address printed
---
 
### 8. Offline Testing (No Hardware)
 
Run the simulator to send fake sensor data to Flask:
 
```bash
python ml/simulator.py
```
 
---
 
## 📊 Dashboard Features
 
- **Status Banner** — Live NORMAL / FAULT indicator
- **Sensor Gauges** — Temperature, Flow Rate, Outlet Level with color-coded bars
- **Live Charts** — Real-time line graphs of all 3 sensors (last 30 readings)
- **Stats Row** — Total readings, normal count, fault count, fault rate %
- **History Table** — Last 30 readings with timestamps and ML status
- **Manual Diagnostic** — Enter sensor values manually to get instant ML prediction, RUL score, AI explanation and maintenance action
---
 
## 🤖 ML Model
 
**Algorithm:** XGBoost Classifier
 
**Features:** `temperature`, `flow_rate`, `water_level`
 
**Labels:** `normal (0)`, `blockage (1)`
 
**Parameters:**
```python
XGBClassifier(n_estimators=100, learning_rate=0.1, max_depth=4)
```
 
**Accuracy:** 99.8% on simulated test set
 
---
 
## 📉 Remaining Useful Life (RUL)
 
RUL is a 0–100% health score calculated by penalizing deviation from optimal sensor ranges:
 
| Parameter | Optimal Range | Penalty |
|-----------|-------------|---------|
| Temperature | 20–32 °C | 5% per °C above 32 |
| Flow Rate | 600–1200 L/min | 0.1% per unit deviation |
| Water Level | 10–30 cm | 3% per cm below 10 |
 
---
 
## 💬 Explainable AI
 
Every prediction includes a human-readable explanation:
 
```
Status: FAULT
Explanation: Temperature highly elevated at 37°C. Flow rate critically low at 200 L/min.
Action: Check internal cooling fans. Inspect primary inlet port for blockages.
```
 
---
 
## 🔄 Retraining on Real Data
 
After collecting real sensor data from the prototype:
 
```bash
# Export MongoDB data to CSV
python backend/export_data.py
 
# Retrain model on real data
python backend/ml/training.py
 
# Restart Flask to load new model
python -m backend.app
```
 
---
 
## 🔭 Future Scope
 
- Trend-based early warning before threshold breach
- LSTM model for time-series prediction
- Risk score (0–100%) instead of binary normal/fault
- Cloud deployment for remote monitoring
- Mobile app for technician alerts
- Multi-machine support for hospital-wide monitoring
  
 
