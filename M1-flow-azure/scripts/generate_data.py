import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
import math

def generate_synthetic_data(num_samples=50000):
    """
    Generates realistic synthetic data for stadium gate wait times.
    Includes:
    - Distinct gate profiles (VIP vs General)
    - Realistic arrival curves (Pre-match surge)
    - Non-linear queuing dynamics
    """
    print(f"Generating {num_samples} realistic synthetic samples...")
    
    data = []
    # Match Kickoff: July 14, 2025 at 18:00
    kickoff_time = datetime(2025, 7, 14, 18, 0, 0)
    # Simulation window: 14:00 to 19:00 (5 hours)
    start_time = kickoff_time - timedelta(hours=4)
    
    # Gate Profiles
    gates = {
        'G1': {'type': 'VIP', 'base_proc_time': 8.0, 'capacity': 200, 'noise': 0.1},
        'G2': {'type': 'General', 'base_proc_time': 4.0, 'capacity': 800, 'noise': 0.3},
        'G3': {'type': 'General', 'base_proc_time': 3.5, 'capacity': 1000, 'noise': 0.4}
    }
    
    for i in range(num_samples):
        # 1. Time Simulation
        # Distribute samples across the 5-hour window, but weighted towards peak
        # We'll just pick a random time in the window for simplicity of generation
        minutes_offset = random.uniform(0, 300) # 0 to 300 minutes
        current_time = start_time + timedelta(minutes=minutes_offset)
        
        minutes_to_kickoff = (kickoff_time - current_time).total_seconds() / 60
        
        # 2. Arrival Pattern (The "Surge")
        # Peak arrival is usually 45 mins before kickoff
        peak_time = 45 
        # Gaussian curve for arrival rate
        if minutes_to_kickoff > 0:
            # Pre-match flow
            arrival_intensity = math.exp(-((minutes_to_kickoff - peak_time)**2) / (2 * 40**2))
        else:
            # Post-kickoff (late arrivals) - drops off sharply
            arrival_intensity = 0.1 * math.exp(-((minutes_to_kickoff)**2) / (2 * 20**2))
            
        # 3. Gate Selection & Characteristics
        gate_id = random.choices(['G1', 'G2', 'G3'], weights=[0.1, 0.45, 0.45])[0]
        profile = gates[gate_id]
        
        # 4. Queue Dynamics
        # Base queue depends on arrival intensity + random burstiness
        base_queue = arrival_intensity * profile['capacity'] * random.uniform(0.8, 1.2)
        
        # VIP gate has shorter queues but longer processing
        if profile['type'] == 'VIP':
            queue_length = int(base_queue * 0.2) # VIPs don't queue as much
            processing_time = random.normalvariate(profile['base_proc_time'], 1.0)
        else:
            queue_length = int(base_queue)
            # Processing time increases slightly under pressure (stress factor)
            stress_factor = 1.0 + (0.2 * (queue_length / 500)) if queue_length > 100 else 1.0
            processing_time = random.normalvariate(profile['base_proc_time'] * stress_factor, 0.5)
            
        # 5. Calculate Wait Time (Target Variable)
        # Basic: Queue * Avg Proc Time / Parallel Channels (assuming ~4 turnstiles per gate ID)
        num_turnstiles = 2 if gate_id == 'G1' else 6
        
        # Theoretical wait
        wait_time = (queue_length * processing_time) / (num_turnstiles * 60)
        
        # Add non-linear congestion effects (crowd friction)
        if queue_length > 200:
            wait_time *= 1.2 # 20% slower due to crowding
            
        # Add random noise (unexplained delays)
        wait_time *= random.uniform(0.9, 1.1)
        
        # 6. Features for Model
        is_peak = 1 if (30 <= minutes_to_kickoff <= 90) else 0
        capacity_utilization = min(1.0, queue_length / profile['capacity'])
        
        data.append({
            'hour_of_day': current_time.hour,
            'minute_of_hour': current_time.minute,
            'minutes_to_kickoff': round(minutes_to_kickoff, 1),
            'is_peak': is_peak,
            'gate_id': gate_id,
            'queue_length': queue_length,
            'processing_time': round(processing_time, 2),
            'capacity_utilization': round(capacity_utilization, 2),
            'wait_time': round(wait_time, 2)
        })
        
    df = pd.DataFrame(data)
    
    # One-hot encode gate_id (must match training expectation)
    df = pd.get_dummies(df, columns=['gate_id'], prefix='gate')
    
    # Ensure all columns exist
    for g in ['gate_G1', 'gate_G2', 'gate_G3']:
        if g not in df.columns:
            df[g] = 0
            
    return df

if __name__ == "__main__":
    df = generate_synthetic_data(num_samples=50000)
    df.to_csv("synthetic_gate_data.csv", index=False)
    print(f"Generated {len(df)} samples with realistic patterns.")
    print(df.head())
