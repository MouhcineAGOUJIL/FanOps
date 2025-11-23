# 🏟️ M1 Flow Management - Frontend Integration Guide

## Overview
M1 is the **AI-Powered Smart Stadium Flow Controller** deployed on **Azure Functions**. It manages real-time crowd flow across stadium gates using machine learning, autonomous decision-making, and root cause analysis.

### Production URL
```
https://func-m1-fanops-comehdi-fwgeaxhwambjcsev.francecentral-01.azurewebsites.net/api/flow
```

---

## 📡 API Endpoints

### 1. POST `/api/flow/ingest`
Ingests real-time turnstile/gate data.

**Request:**
```json
{
  "stadiumId": "AGADIR",
  "gateId": "G1",
  "ts": "2025-07-14T18:00:00Z",
  "perMinuteCount": 45,
  "avgProcessingTime": 3.2,
  "queueLength": 120
}
```

**Response:** `202 Accepted`

### 2. GET `/api/flow/status?stadiumId={id}`
Returns real-time gate status with ML predictions and anomaly detection.

**Response:**
```json
{
  "stadiumId": "AGADIR",
  "gates": [
    {
      "gateId": "G1",
      "wait": 3.87,
      "state": "green",
      "anomaly": false,
      "anomalyScore": 1.17
    },
    {
      "gateId": "G2",
      "wait": 12.5,
      "state": "red",
      "anomaly": true,
      "anomalyScore": 4.5,
      "investigation_id": "INV_G2_1763902395",
      "root_cause": "Scanner Malfunction"
    }
  ]
}
```

### 3. GET `/api/flow/ai-insights?stadium_id={id}`
Query AI agent decisions and reasoning.

**Response:**
```json
{
  "stadium_id": "AGADIR",
  "latest_decision": {
    "decision": "Monitor gate G1 closely. Prepare for VIP arrivals...",
    "reasoning": "Current situation manageable but vigilance required...",
    "confidence": 0.9,
    "functions_called": ["get_all_gate_status", "get_match_context"],
    "cost_usd": 0.0041
  }
}
```

### 4. GET `/api/flow/investigation/{investigation_id}`
Query root cause analysis investigation results.

**Response:**
```json
{
  "investigation_id": "INV_G2_1763902395",
  "diagnosis": {
    "root_cause": "Scanner Malfunction",
    "confidence": 0.80
  },
  "mitigation": {
    "priority": "high",
    "actions": ["Replace scanner", "Reroute traffic"]
  }
}
```

---

## 🔧 Frontend Implementation

### Step 1: Create Flow Service

Create `frontend/src/services/flowService.js`:

```javascript
import axios from 'axios';

const M1_API_URL = 'https://func-m1-fanops-can2025.azurewebsites.net/api/flow';

export const flowService = {
  // Get gate status for a stadium
  getGateStatus: async (stadiumId = 'AGADIR') => {
    try {
      const response = await axios.get(`${M1_API_URL}/status`, {
        params: { stadiumId }
      });
      return response.data;
    } catch (error) {
      console.error('M1 Flow API Error:', error);
      throw error;
    }
  },

  // Get AI insights
  getAIInsights: async (stadiumId = 'AGADIR', limit = 5) => {
    try {
      const response = await axios.get(`${M1_API_URL}/ai-insights`, {
        params: { stadium_id: stadiumId, limit }
      });
      return response.data;
    } catch (error) {
      console.error('M1 AI Insights Error:', error);
      throw error;
    }
  },

  // Get investigation details
  getInvestigation: async (investigationId) => {
    try {
      const response = await axios.get(`${M1_API_URL}/investigation/${investigationId}`);
      return response.data;
    } catch (error) {
      console.error('M1 Investigation Error:', error);
      throw error;
    }
  },

  // Ingest gate data (for simulation/testing)
  ingestGateData: async (gateData) => {
    try {
      const response = await axios.post(`${M1_API_URL}/ingest`, gateData);
      return response.data;
    } catch (error) {
      console.error('M1 Ingest Error:', error);
      throw error;
    }
  }
};
```

### Step 2: Update Admin Dashboard

Update `frontend/src/pages/admin/Dashboard.jsx` or create a flow visualization page:

```javascript
import { useState, useEffect } from 'react';
import { flowService } from '../../services/flowService';
import { Activity, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export default function FlowDashboard() {
  const [gateStatus, setGateStatus] = useState(null);
  const [aiInsights, setAIInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [status, insights] = await Promise.all([
        flowService.getGateStatus('AGADIR'),
        flowService.getAIInsights('AGADIR')
      ]);
      setGateStatus(status);
      setAIInsights(insights);
    } catch (error) {
      console.error('Failed to fetch flow data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStateColor = (state) => {
    switch(state) {
      case 'green': return 'text-green-400 bg-green-500/20';
      case 'yellow': return 'text-yellow-400 bg-yellow-500/20';
      case 'red': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-white">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Activity className="w-8 h-8" />
          Smart Stadium Flow Control
        </h1>
        <p className="text-white/60 mt-2">AI-Powered Gate Management - M1 (Azure)</p>
      </div>

      {/* Gates Status */}
      {gateStatus && (
        <div className="glass rounded-xl p-6">
          <h3 className="text-white font-bold mb-4">Gate Status - {gateStatus.stadiumId}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gateStatus.gates.map((gate) => (
              <div key={gate.gateId} className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-bold text-lg">{gate.gateId}</h4>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStateColor(gate.state)}`}>
                    {gate.state.toUpperCase()}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="text-white/70">Wait Time:</span>
                    <span className="text-white font-bold">{gate.wait.toFixed(1)} min</span>
                  </div>
                  
                  {gate.anomaly && (
                    <div className="flex items-center gap-2 text-red-400">
                      <Alert Triangle className="w-4 h-4" />
                      <span>Anomaly Detected!</span>
                    </div>
                  )}
                  
                  {gate.root_cause && (
                    <div className="mt-2 p-2 bg-red-500/10 rounded text-xs">
                      <strong>Root Cause:</strong> {gate.root_cause}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Insights */}
      {aiInsights?.latest_decision && (
        <div className="glass rounded-xl p-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" />
            AI Agent Decision
          </h3>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
            <p className="text-white text-lg mb-2">{aiInsights.latest_decision.decision}</p>
            <p className="text-white/70 text-sm mb-3">{aiInsights.latest_decision.reasoning}</p>
            <div className="flex gap-4 text-xs text-white/60">
              <span>Confidence: {(aiInsights.latest_decision.confidence * 100).toFixed(0)}%</span>
              <span>Cost: ${aiInsights.latest_decision.cost_usd.toFixed(4)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 🎯 Features

### M1 Capabilities:
- **Real-time ML Predictions**: Wait time predictions with 99.48% accuracy (R²=0.9948)
- **Anomaly Detection**: Automatic AWS SageMaker integration
- **AI Agent**: GPT-powered autonomous decision-making every 2 minutes
- **Root Cause Analysis**: Automated investigation with Bayesian reasoning
- **Traffic Classification**: Auto-assigns Green/Yellow/Red status to gates

### Gate States:
- 🟢 **Green**: Wait time < 5 minutes
- 🟡 **Yellow**: Wait time 5-10 minutes
- 🔴 **Red**: Wait time > 10 minutes

---

## 🔄 Real-Time Updates

For live updates, use polling or WebSockets:

```javascript
useEffect(() => {
  const interval = setInterval(async () => {
    const status = await flowService.getGateStatus('AGADIR');
    setGateStatus(status);
  }, 10000); // Update every 10 seconds
  
  return () => clearInterval(interval);
}, []);
```

---

## 🧪 Testing

### Test locally (if M1 is running locally):
```bash
# Terminal 1: Start Azurite
azurite --silent --inMemoryPersistence

# Terminal 2: Start Functions
cd M1-flow-azure
func start

# Terminal 3: Test endpoint
curl http://localhost:7071/api/flow/status?stadiumId=AGADIR
```

### Test production:
```bash
curl https://func-m1-fanops-can2025.azurewebsites.net/api/flow/status?stadiumId=AGADIR
```

---

## 📊 Performance

- **Latency**: <200ms for gate status
- **ML Inference**: <50ms per prediction
- **AI Agent**: ~5s per decision
- **RCA**: ~10s per investigation
- **Auto-scaling**: Serverless (handles 100+ req/sec)

---

## 🔐 Security Notes

If the production API requires authentication, add headers:

```javascript
const response = await axios.get(`${M1_API_URL}/status`, {
  params: { stadiumId },
  headers: {
    'x-functions-key': 'YOUR_FUNCTION_KEY' // If required
  }
});
```

---

## 📝 Next Steps

1. Create `flowService.js` with the provided code
2. Update admin dashboard to show gate status
3. Add real-time polling for live updates
4. Display AI insights and RCA investigations
5. Create visualizations for gate traffic flow
