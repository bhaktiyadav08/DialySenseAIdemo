from flask import Flask, request, jsonify
from flask_cors import CORS
import ml.predict
from pymongo import MongoClient
from datetime import datetime

app = Flask(__name__)
CORS(app)
# MongoDB connection
client = MongoClient("mongodb://localhost:27017/")
db = client["dialysense"]
collection = db["sensor_data"]

@app.route('/')
def home():
    return "Server is running!"

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json

    temperature = float(data['temperature'])
    flow_rate = float(data['flow_rate'])
    water_level = float(data['water_level'])

    result = ml.predict.predict_status(temperature, flow_rate, water_level)

    # Save to database
    record = {
        "temperature": temperature,
        "flow_rate": flow_rate,
        "water_level": water_level,
        "status": result,
        "timestamp": datetime.now()
    }

    collection.insert_one(record)

    return jsonify({"status": result})
@app.route('/data', methods=['GET'])
def get_data():
    records = list(collection.find().sort("timestamp", -1).limit(20))

    for r in records:
        r['_id'] = str(r['_id'])

    return jsonify(records)

if __name__ == '__main__':
    app.run(debug=True)