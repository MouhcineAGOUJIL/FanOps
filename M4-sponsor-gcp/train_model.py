# train_model.py
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib
import random
from sponsors_config import SPONSORS, SPONSOR_NAMES

# --- 1. Data Generation Configuration ---
NUM_SAMPLES = 10000
ZONES = ["VIP", "North", "South", "East", "West"]
EVENTS = ["None", "Goal", "Card", "VAR", "Halftime", "Kickoff", "FinalWhistle"]

def generate_synthetic_data(n_samples=NUM_SAMPLES):
    data = []
    
    for _ in range(n_samples):
        # Random Context
        match_minute = random.randint(0, 100) # 0-90 + extra time
        score_diff = random.randint(-3, 3) # Home - Away
        temperature = random.uniform(10, 40) # Celsius
        crowd_density = random.uniform(0.1, 1.0) # 10% to 100% full
        zone = random.choice(ZONES)
        event = random.choice(EVENTS)
        
        # Logic for "Ground Truth" (Labeling)
        # We simulate what a human expert would choose as the best ad
        
        candidates = []
        
        # Rule 1: Temperature
        if temperature > 30:
            candidates.extend(["Sidi Ali", "Coca-Cola"])
            
        # Rule 2: Halftime (Food & Telco)
        if 45 <= match_minute <= 60 or event == "Halftime":
            candidates.extend(["Koutoubia", "Orange", "Inwi", "Coca-Cola"])
            
        # Rule 3: Goals & Excitement
        if event == "Goal" or score_diff > 1:
            candidates.extend(["Puma", "Adidas", "Hyundai", "Coca-Cola"])
            
        # Rule 4: VIP Specific
        if zone == "VIP":
            candidates.extend(["Royal Air Maroc", "CDG", "OCP"])
            
        # Rule 5: Time of day / Hunger (Simulated by minute for simplicity, say late game)
        if match_minute > 70:
            candidates.extend(["Koutoubia", "Sidi Ali"])
            
        # Rule 6: Default / General Awareness
        if not candidates:
            candidates.extend(["Visa", "Orange", "Inwi"])
            
        # Select one label
        chosen_sponsor = random.choice(candidates)
        
        data.append({
            "match_minute": match_minute,
            "score_diff": score_diff,
            "temperature": temperature,
            "crowd_density": crowd_density,
            "zone": zone,
            "event": event,
            "sponsor_label": chosen_sponsor
        })
        
    return pd.DataFrame(data)

# --- 2. Training Pipeline ---
def train():
    print("🎨 Generating synthetic data...")
    df = generate_synthetic_data()
    
    # Preprocessing
    # Convert categorical variables to numeric (One-Hot Encoding or Label Encoding)
    # For simplicity and robustness with Random Forest, we'll use One-Hot for categorical
    
    X = df.drop("sponsor_label", axis=1)
    y = df["sponsor_label"]
    
    # Encode categorical features
    X = pd.get_dummies(X, columns=["zone", "event"])
    
    # Save the columns order for inference later
    model_columns = list(X.columns)
    joblib.dump(model_columns, 'model_columns.joblib')
    
    # Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print(f"🧠 Training Random Forest on {len(X_train)} samples...")
    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X_train, y_train)
    
    # Evaluate
    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"✅ Model Accuracy: {acc:.2%}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    # Save Model
    joblib.dump(clf, 'model.joblib')
    print("💾 Model saved to model.joblib")

if __name__ == "__main__":
    train()
