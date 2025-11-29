import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import joblib
import random

# 1. Generate Mock Data for CAN 2025 (Morocco)
def generate_mock_data(n_samples=1000):
    teams = [
        "Morocco", "Senegal", "Egypt", "Nigeria", "Algeria", "Tunisia", 
        "Cameroon", "Ivory Coast", "Mali", "Ghana", "South Africa", "DR Congo"
    ]
    stadiums = [
        "Stade Mohamed V (Casablanca)", "Stade Moulay Abdellah (Rabat)", 
        "Stade de Marrakech", "Stade Adrar (Agadir)", "Stade de Tanger", "Stade de Fes"
    ]
    times = ["Afternoon", "Evening", "Night"]
    stages = ["Group Stage", "Round of 16", "Quarter-Final", "Semi-Final", "Final"]
    
    data = []
    for _ in range(n_samples):
        team_a = random.choice(teams)
        team_b = random.choice(teams)
        while team_a == team_b:
            team_b = random.choice(teams)
            
        stadium = random.choice(stadiums)
        time = random.choice(times)
        stage = random.choice(stages)
        
        # Simple logic for "realistic" attendance
        base_attendance = 20000
        
        # Boost for host (Morocco)
        if "Morocco" in [team_a, team_b]:
            base_attendance += 30000
            
        # Boost for big teams
        big_teams = ["Senegal", "Egypt", "Nigeria", "Algeria"]
        if team_a in big_teams or team_b in big_teams:
            base_attendance += 10000
            
        # Boost for later stages
        if stage == "Final":
            base_attendance += 20000
        elif stage == "Semi-Final":
            base_attendance += 10000
        elif stage == "Quarter-Final":
            base_attendance += 5000
            
        # Time factor
        if time == "Night":
            base_attendance += 5000
            
        # Random noise
        attendance = base_attendance + random.randint(-5000, 5000)
        
        # Cap at stadium capacity (approx 60k for simplicity)
        attendance = min(attendance, 65000)
        attendance = max(attendance, 0)
        
        data.append({
            "team_a": team_a,
            "team_b": team_b,
            "stadium": stadium,
            "time": time,
            "stage": stage,
            "attendance": attendance
        })
        
    return pd.DataFrame(data)

# 2. Train Model
def train():
    print("Generating mock data...")
    df = generate_mock_data()
    
    X = df.drop("attendance", axis=1)
    y = df["attendance"]
    
    # Preprocessing
    categorical_features = ["team_a", "team_b", "stadium", "time", "stage"]
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
        ])
    
    # Pipeline
    model = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('regressor', RandomForestRegressor(n_estimators=100, random_state=42))
    ])
    
    print("Training model...")
    model.fit(X, y)
    
    # Evaluate
    score = model.score(X, y)
    print(f"Model R2 Score: {score:.2f}")
    
    # Save
    print("Saving model to model.joblib...")
    joblib.dump(model, 'model.joblib')
    print("Done!")

if __name__ == "__main__":
    train()
