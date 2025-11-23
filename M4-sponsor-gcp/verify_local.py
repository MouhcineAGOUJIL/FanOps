# verify_local.py
import main
from unittest.mock import Mock
import json
import sys

def test_scenario(name, data):
    print(f"\n🧪 Testing Scenario: {name}")
    print(f"   Input: {data}")
    
    # Mock Flask Request
    req = Mock(get_json=Mock(return_value=data), method='POST')
    
    # Call Function
    response = main.sponsor_recommendation(req)
    
    # Parse Response (response is tuple (body, status, headers))
    body = json.loads(response[0])
    status = response[1]
    
    if status == 200:
        print(f"   ✅ Success! Recommended: {body['recommended_sponsor']}")
        print(f"   📢 Message: {body['campaign_message']}")
        print(f"   📊 Confidence: {body['confidence']:.2f}")
    else:
        print(f"   ❌ Failed: {body}")

# --- Test Cases ---

# 1. Hot Weather -> Expect Beverage
test_scenario("Canicule (35°C)", {
    "temperature": 35,
    "match_minute": 20,
    "event": "None",
    "zone": "North"
})

# 2. Halftime -> Expect Food/Telco
test_scenario("Mi-temps", {
    "temperature": 20,
    "match_minute": 45,
    "event": "Halftime",
    "zone": "East"
})

# 3. Goal Scored -> Expect Excitement (Puma/Adidas/Coca)
test_scenario("But Marqué", {
    "temperature": 22,
    "match_minute": 88,
    "event": "Goal",
    "score_diff": 1,
    "zone": "South"
})

# 4. VIP Zone -> Expect Premium
test_scenario("Zone VIP", {
    "temperature": 22,
    "match_minute": 10,
    "event": "None",
    "zone": "VIP"
})
