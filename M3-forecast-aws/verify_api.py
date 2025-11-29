import requests
import json

url = "https://sfg82p344i.execute-api.us-east-1.amazonaws.com/dev/predict"

payload = {
    "team_a": "Morocco",
    "team_b": "Senegal",
    "stadium": "Stade Mohamed V (Casablanca)",
    "time": "Evening",
    "stage": "Final"
}

print(f"Sending request to {url}...")
print(f"Payload: {json.dumps(payload, indent=2)}")

try:
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    print("Response:")
    print(response.text)
except Exception as e:
    print(f"Error: {e}")
