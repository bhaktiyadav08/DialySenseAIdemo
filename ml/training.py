"""
training.py
-----------
Train XGBoost model on sensor data and save model.pkl

Usage:
    # Train on original simulated dataset (default)
    python ml/training.py

    # Train on real exported data
    python ml/training.py --data data/raw/real_sensor_data_20250115_094231.csv

Run from inside the backend/ folder.
"""

import argparse
import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from xgboost import XGBClassifier
import joblib
import glob

def get_latest_csv(data_dir):
    files = glob.glob(os.path.join(data_dir, 'real_sensor_data_*.csv'))
    if not files:
        return DEFAULT_CSV          # fall back to simulated data
    return max(files, key=os.path.getmtime)
# ── Paths (absolute, safe to run from anywhere) ───────────────────────────────
BASE_DIR   = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # backend/
DEFAULT_CSV = os.path.join(BASE_DIR, 'data', 'raw', 'dataset.csv')
MODEL_PATH  = os.path.join(BASE_DIR, 'models', 'model.pkl')

# ── Args ──────────────────────────────────────────────────────────────────────
parser = argparse.ArgumentParser()
parser.add_argument('--data', type=str, default=DEFAULT_CSV,
                    help='Path to training CSV file')
args = parser.parse_args()

csv_path = args.data if os.path.isabs(args.data) else os.path.join(BASE_DIR, args.data)

print(f"Loading data from: {csv_path}")

# ── 1. Load dataset ───────────────────────────────────────────────────────────
df = pd.read_csv(csv_path)
print(f"Total records: {len(df)}")
print(f"Columns: {list(df.columns)}")
print(f"Status distribution:\n{df['status'].value_counts()}\n")

# ── 2. Convert labels to numbers ─────────────────────────────────────────────
df['status'] = df['status'].map({'normal': 0, 'blockage': 1})

# Drop rows where status couldn't be mapped (unexpected labels)
before = len(df)
df = df.dropna(subset=['status'])
if len(df) < before:
    print(f"Warning: dropped {before - len(df)} rows with unknown status labels")

# ── 3. Features and target ────────────────────────────────────────────────────
# Order matters — must match predict.py's input order
X = df[['temperature', 'flow_rate', 'water_level']]
y = df['status'].astype(int)

# ── 4. Train-test split ───────────────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)
print(f"Train samples: {len(X_train)} | Test samples: {len(X_test)}")

# ── 5. Train XGBoost ──────────────────────────────────────────────────────────
model = XGBClassifier(
    n_estimators=100,
    learning_rate=0.1,
    max_depth=4,
    eval_metric='logloss',   # suppresses XGBoost warning
    random_state=42
)
model.fit(X_train, y_train)

# ── 6. Evaluate ───────────────────────────────────────────────────────────────
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"\nAccuracy: {accuracy * 100:.2f}%")
print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=['normal', 'blockage']))

# ── 7. Save model ─────────────────────────────────────────────────────────────
os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
joblib.dump(model, MODEL_PATH)
print(f"\n✅ Model saved to: {MODEL_PATH}")
print("Restart Flask to load the new model.")