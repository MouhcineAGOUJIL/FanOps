import requests
import json
import time

print("⏳ Waiting for server to be ready...")
time.sleep(2)

url = "http://localhost:8080/"
data = {
    "temperature": 38,
    "match_minute": 55,
    "event": "Halftime",
    "zone": "VIP"
}

print(f"🚀 Sending request to {url} with data: {data}")

try:
    response = requests.post(url, json=data, timeout=5)
    print(f"✅ Status Code: {response.status_code}")
    print("📜 Response Body:")
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"❌ Error: {e}")
