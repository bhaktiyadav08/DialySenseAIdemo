import joblib
import numpy as np
import os

# Get correct path to model
current_dir = os.path.dirname(__file__)
model_path = os.path.join(current_dir, '../models/model.pkl')

# Load model once (important for performance)
model = joblib.load(model_path)

def predict_status(temperature, flow_rate, water_level):
    
        
        
    try:
        # Convert to float to be safe
        t, f, l = float(temperature), float(flow_rate), float(water_level)
                # DS18B20 returns -127 on sensor failure
        if t < -50:
            return "sensor_error"

        data = np.array([[t, f, l]])
        
        prediction = model.predict(data)[0]
       
        # THIS PRINT IS CRITICAL - CHECK YOUR TERMINAL FOR THIS:
        print(f"\n--- ML DEBUG ---")
        print(f"Inputs: Temp={t}, Flow={f}, Level={l}")
        print(f"Model raw output: {prediction}")
        print(f"----------------\n")

        # In your training.py: normal=0, blockage=1
        if int(prediction) == 1:
            return "blockage"
        else:
            return "normal"
    except Exception as e:
        print("Error in predict_status:", e)
        return "error"

def estimate_rul(temperature, flow_rate, water_level):
    # Base RUL is 100%
    rul = 100.0
    
    # Penalize based on deviation from optimal baseline.
    # Optimal temp = 25-32, Flow rate = 800-1000, Water level = 15-25
    
    if temperature > 32:
        rul -= (temperature - 32) * 5
    elif temperature < 20:
        rul -= (20 - temperature) * 2

    if flow_rate < 600:
        rul -= (600 - flow_rate) * 0.1
    elif flow_rate > 1200:
        rul -= (flow_rate - 1200) * 0.1

    if water_level < 10:
        rul -= (10 - water_level) * 3
    elif water_level > 30:
        rul -= (water_level - 30) * 2
        
    rul = max(0.0, min(100.0, rul))
    return round(rul, 1)

def explain_status(temperature, flow_rate, water_level, status):
    explanation = []
    actions = []

    if status == "normal":
        explanation.append("All sensor readings align with stable historical baselines.")
        actions.append("None required. Routine operational checks.")
    else:
        # Check reasons for blockage or fault
        if temperature >= 35:
            explanation.append(f"Temperature highly elevated at {temperature}°C.")
            actions.append("Check internal cooling fans and inspect thermal sensors.")
        elif temperature < 20:
            explanation.append(f"Temperature dropping unusually low ({temperature}°C).")
            actions.append("Verify heating elements and thermostat connections.")
            
        if flow_rate < 300:
            explanation.append(f"Flow rate critically low at {flow_rate} mL/min.")
            actions.append("Inspect primary inlet port for physical blockages or pump failure.")
        elif flow_rate > 1244:
            explanation.append(f"Flow rate dangerously high ({flow_rate} mL/min).")
            actions.append("Recalibrate main pressure valve and check for pipe ruptures.")
            
        if water_level < 5:
            explanation.append(f"Water level critically low ({water_level} cm).")
            actions.append("Refill primary basin and inspect for system leaks.")

        if not explanation:
            explanation.append("An unspecified anomaly was detected by the XGBoost algorithm based on complex feature interactions.")
            actions.append("Perform a full system reboot and structural diagnostic.")

    return {
        "explanation": " ".join(explanation),
        "maintenance_action": " ".join(actions)
    }
