from locust import HttpUser, task, between
import random
import json

class FanUser(HttpUser):
    wait_time = between(1, 5) # Simulate fan arriving every 1-5 seconds

    @task(3)
    def ingest_data(self):
        """
        Simulates a turnstile sending data.
        """
        gate_id = random.choice(['G1', 'G2', 'G3'])
        payload = {
            "stadiumId": "AGADIR",
            "gateId": gate_id,
            "ts": "2025-07-14T18:00:00Z",
            "perMinuteCount": random.randint(10, 50),
            "avgProcessingTime": random.uniform(3.0, 6.0),
            "queueLength": random.randint(0, 100)
        }
        
        self.client.post("/api/flow/ingest", json=payload)

    @task(1)
    def check_status(self):
        """
        Simulates an admin checking status.
        """
        self.client.get("/api/flow/status?stadiumId=AGADIR")
