# 🔗 Frontend-Backend Integration Guide

## ✅ M1 is Now Connected!

The React frontend is now fully integrated with the M1 Flow Controller backend APIs.

### What Was Changed

**1. API Configuration** (`src/services/api.js`)
- Base URL updated to M1 production: `https://func-m1-fanops-comehdi-fwgeaxhwambjcsev.francecentral-01.azurewebsites.net/api`
- No authentication required (for testing)

**2. Flow Service** (`src/services/flowService.js`)
- ✅ `getGateStatus()` - Get ML predictions & anomaly detection
- ✅ `ingestGateData()` - Send telemetry data
- ✅ `getAIInsights()` - Get AI agent decisions (NEW)
- ✅ `getInvestigation()` - Get RCA details (NEW)
- ✅ `subscribeToGateUpdates()` - Real-time polling (3s)

**3. Environment** (`.env.example`)
- Created with M1 production settings
- Mock mode disabled by default

---

## 🚀 Quick Start

### Step 1: Setup Environment

```bash
cd frontend

# Copy environment template
copy .env.example .env

# Install dependencies (if not done)
npm install
```

### Step 2: Start Development Server

```bash
npm run dev
```

The app will connect to M1 production API automatically!

---

## 🎯 How to Use M1 APIs in Components

### Example 1: Get Gate Status

```javascript
import { flowService } from '../services/flowService';

function GateMonitor() {
  const [gates, setGates] = useState([]);

  useEffect(() => {
    const fetchGates = async () => {
      try {
        const data = await flowService.getGateStatus('AGADIR');
        setGates(data.gates);
      } catch (error) {
        console.error('Failed to fetch gates:', error);
      }
    };

    fetchGates();
  }, []);

  return (
    <div>
      {gates.map(gate => (
        <div key={gate.gateId}>
          <h3>{gate.gateId}</h3>
          <p>Wait: {gate.wait} minutes</p>
          <p>State: {gate.state}</p>
          {gate.anomaly && (
            <span>⚠️ Anomaly: {gate.root_cause}</span>
          )}
        </div>
      ))}
    </div>
  );
}
```

###Example 2: Real-time Updates

```javascript
import { flowService } from '../services/flowService';

function RealtimeGates() {
  const [gates, setGates] = useState([]);

  useEffect(() => {
    // Subscribe to updates every 3 seconds
    const unsubscribe = flowService.subscribeToGateUpdates(
      'AGADIR',
      (data) => setGates(data.gates)
    );

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  return <div>{/* Render gates */}</div>;
}
```

### Example 3: AI Insights

```javascript
import { flowService } from '../services/flowService';

function AIInsightsPanel() {
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    const fetchInsights = async () => {
      const data = await flowService.getAIInsights('AGADIR');
      setInsights(data.latest_decision);
    };

    fetchInsights();
    // Refresh every 2 minutes
    const interval = setInterval(fetchInsights, 120000);
    return () => clearInterval(interval);
  }, []);

  if (!insights) return <div>Loading AI insights...</div>;

  return (
    <div className="ai-insights">
      <h3>🤖 AI Agent Recommendation</h3>
      <p><strong>Decision:</strong> {insights.decision}</p>
      <p><strong>Reasoning:</strong> {insights.reasoning}</p>
      <p><strong>Confidence:</strong> {(insights.confidence * 100).toFixed(0)}%</p>
      <p><small>Cost: ${insights.cost_usd.toFixed(4)}</small></p>
    </div>
  );
}
```

### Example 4: RCA Details

```javascript
import { flowService } from '../services/flowService';

function InvestigationDetails({ investigationId }) {
  const [investigation, setInvestigation] = useState(null);

  useEffect(() => {
    const fetchInvestigation = async () => {
      const data = await flowService.getInvestigation(investigationId);
      setInvestigation(data);
    };

    if (investigationId) {
      fetchInvestigation();
    }
  }, [investigationId]);

  if (!investigation) return null;

  return (
    <div className="investigation-card">
      <h3>🔍 Root Cause Analysis</h3>
      <p><strong>Root Cause:</strong> {investigation.diagnosis.root_cause}</p>
      <p><strong>Confidence:</strong> {(investigation.diagnosis.confidence * 100).toFixed(0)}%</p>
      <p><strong>Priority:</strong> {investigation.mitigation.priority}</p>
    </div>
  );
}
```

---

## 🎨 UI Components to Create

### Recommended Components:

1. **GateStatusCard** - Shows individual gate with ML prediction
2. **AnomalyAlert** - Red banner when anomaly detected with RCA
3. **AIInsightsPanel** - AI agent recommendations sidebar
4. **RCAModal** - Detailed investigation popup
5. **TrafficLightBadge** - Green/Yellow/Red status indicator

---

## 📊 Data Flow

```
Frontend (React)
    ↓
flowService.js
    ↓
api.js (axios)
    ↓
M1 Production API (Azure)
    ↓
ML Model + AI Agent + RCA
    ↓
Response with predictions
    ↓
Update UI Components
```

---

## 🐛 Troubleshooting

**CORS Errors?**
- M1 backend should have CORS enabled
- Check browser console for details

**No data returned?**
- Verify M1 API is running: `https://func-m1-fanops-comehdi-fwgeaxhwambjcsev.francecentral-01.azurewebsites.net/api/flow/status?stadiumId=AGADIR`
- Send test data first using Postman

**Real-time not working?**
- Check polling interval in flowService.js (default: 3000ms)
- Ensure gate data exists in M1

---

## ✨ Features Available

- ✅ Real-time gate status
- ✅ ML wait time predictions (99.48% accuracy)
- ✅ Anomaly detection with alerts
- ✅ AI agent recommendations
- ✅ Root cause analysis
- ✅ Traffic light classification (green/yellow/red)
- ✅ Auto-refresh every 3 seconds

---

## 📝 Next Steps

1. Update `pages/admin/GateMonitoring.jsx` to use `flowService.getGateStatus()`
2. Add AI insights to `AdminDashboard.jsx`
3. Create anomaly alert component for RCA
4. Add real-time polling to fan dashboard
5. Style traffic light badges

**The backend is ready - now build amazing UI!** 🚀
