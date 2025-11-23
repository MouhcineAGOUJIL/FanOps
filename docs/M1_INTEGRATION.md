# M1 Service Integration Guide

Quick reference for integrating with the M1 Flow Controller microservice.

## 🔗 Production Endpoints

**Base URL**: `https://func-m1-fanops-comehdi-fwgeaxhwambjcsev.francecentral-01.azurewebsites.net`

## 📋 Available APIs

### 1. Get Gate Status
```
GET /api/flow/status?stadiumId=AGADIR
```
Returns real-time gate status with ML predictions and anomaly detection.

### 2. Ingest Gate Data  
```
POST /api/flow/ingest
```
Send turnstile/sensor data. Triggers ML prediction and anomaly detection.

### 3. AI Agent Insights
```
GET /api/flow/ai-insights?stadium_id=AGADIR
```
Get AI agent's latest recommendations and reasoning.

### 4. RCA Investigation
```
GET /api/flow/investigation/{investigation_id}
```
Query root cause analysis details for detected anomalies.

## 🎯 Stadium IDs

- `AGADIR` - Agadir Stadium
- `RABAT` - Rabat Stadium
- `CASABLANCA` - Casablanca Stadium

## 💻 Quick Integration Examples

### JavaScript/React
```javascript
const BASE_URL = "https://func-m1-fanops-comehdi-fwgeaxhwambjcsev.francecentral-01.azurewebsites.net";

// Get gate status
const getGateStatus = async (stadiumId) => {
  const response = await fetch(`${BASE_URL}/api/flow/status?stadiumId=${stadiumId}`);
  return response.json();
};

// Send gate data
const sendGateData = async (data) => {
  await fetch(`${BASE_URL}/api/flow/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
};
```

### Python
```python
import requests

BASE_URL = "https://func-m1-fanops-comehdi-fwgeaxhwambjcsev.francecentral-01.azurewebsites.net"

# Get status
status = requests.get(f"{BASE_URL}/api/flow/status?stadiumId=AGADIR").json()

# Send data
requests.post(f"{BASE_URL}/api/flow/ingest", json={
    "stadiumId": "AGADIR",
    "gateId": "G1",
    "ts": "2025-07-14T18:00:00Z",
    "perMinuteCount": 45,
    "avgProcessingTime": 3.2,
    "queueLength": 120
})
```

## 📊 Response Formats

See [`docs/integration_contracts.md`](./integration_contracts.md) for complete API schemas.

## 🚀 Features

- ✅ ML wait time predictions (99.48% accuracy)
- ✅ Real-time anomaly detection
- ✅ AI agent with automated decision-making
- ✅ Root cause analysis for anomalies
- ✅ Serverless auto-scaling
- ✅ Multi-cloud (Azure + AWS OpenAI + optional AWS SageMaker)

## 👤 Contact

**M1 Team Owner**: El Mehdi OUGHEGI  
**Full Documentation**: [`M1-flow-azure/README.md`](../M1-flow-azure/README.md)
