# 🏟️ M1 - Smart Stadium Flow Controller

**Cloud**: Microsoft Azure (PaaS + IaaS) + AWS (Hybrid) | **Language**: Python 3.9+ | **Type**: Hybrid Serverless + VM Architecture with AI

## 📖 Overview

**M1** is an AI-powered intelligent core of the CAN 2025 FanOps platform, managing real-time crowd flow across stadium gates using machine learning, autonomous decision-making, and root cause analysis.

**Deployment Architecture:**
- 🔷 **Azure Functions (PaaS)**: Serverless APIs, ML inference, AI agent, RCA engine
- 🖥️ **Azure VM (IaaS)**: 24/7 persistent monitoring service with WebSocket streaming
- ☁️ **AWS SageMaker**: Anomaly detection (optional, mocked for dev)

**Key Capabilities:**
- ✅ **Real-time Ingestion**: Processes turnstile telemetry with <200ms latency
- ✅ **ML-Powered Predictions**: LightGBM model (R²=0.9948) predicts wait times
- ✅ **Anomaly Detection**: AWS SageMaker integration for security threat detection
- ✅ **AI Orchestration Agent**: GPT-powered autonomous decision-making (every 2 minutes)
- ✅ **Root Cause Analysis**: Automated investigation with hypothesis testing and Bayesian reasoning
- ✅ **Traffic Classification**: Auto-assigns Green/Yellow/Red status to gates
- ✅ **WebSocket Streaming**: Real-time updates from persistent VM (IaaS)
- ✅ **Production-Ready**: Full error handling, validation, and fallback logic

**Current Status**: ✅ **FULLY OPERATIONAL** - Hybrid PaaS + IaaS deployment verified end-to-end

**Cost**: 
- PaaS: ~$2/month (Functions) + ~$10/month (OpenAI)
- IaaS: ~$7.50/month (VM B1s)
- **Total: ~$20/month**


---

## 🎯 Quick Links

**Core Documentation:**
- **[EXECUTION_GUIDE.md](./EXECUTION_GUIDE.md)** - Complete local & cloud deployment guide
- **[DEMO_SCRIPT.md](./DEMO_SCRIPT.md)** - 5-minute presentation walkthrough
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Complete system architecture
- **[DOCS_INDEX.md](./DOCS_INDEX.md)** - Documentation navigation hub

**IaaS Monitoring Component:**
- **[AZURE_VM_DEPLOYMENT.md](./AZURE_VM_DEPLOYMENT.md)** - Deploy monitoring VM (IaaS)
- **[IAAS_IMPLEMENTATION_GUIDE.md](./IAAS_IMPLEMENTATION_GUIDE.md)** - Complete IaaS setup guide
- **[monitoring-service/TESTING_GUIDE.md](./monitoring-service/TESTING_GUIDE.md)** - Local testing

**Integration:**
- **[PROJECT_OVERVIEW.md](../PROJECT_OVERVIEW.md)** - Non-technical project explanation
- **[docs/integration_contracts.md](../docs/integration_contracts.md)** - API schemas for M2/M3/M4 teams

---

## 📂 Project Structure

```
M1-flow-azure/
├── ai_engine/                       # AI Components
│   ├── agent/
│   │   ├── orchestration_agent.py   # Main AI decision agent
│   │   ├── function_definitions.py   # OpenAI function calling schemas
│   │   ├── function_executor.py      # Function implementations
│   │   └── decision_logger.py        # Audit trail logging
│   └── root_cause/
│       ├── anomaly_investigator.py   # RCA orchestrator
│       ├── hypothesis_generator.py   # GPT hypothesis generation
│       ├── hypothesis_tester.py      # Evidence collection
│       └── mitigation_recommender.py # Action plan generation
│
├── config/
│   ├── prompts/
│   │   └── agent_system_prompt.txt  # Agent decision framework
│   ├── mitigation_playbook.json     # Standard response procedures
│   └── settings.py                  # Pydantic environment configuration
│
├── handlers/
│   ├── flow_ingest.py               # [HTTP] Ingests gate data
│   ├── flow_status.py               # [HTTP] Returns gate status + triggers RCA
│   ├── process_queue.py             # [Queue] Async processor
│   ├── ai_insights.py               # [HTTP] Query agent decisions
│   ├── agent_orchestrator.py        # [Timer] Runs agent every 2 min
│   └── investigation.py             # [HTTP] Query RCA results
│
├── monitoring-service/              # NEW - IaaS Monitoring Component
│   ├── main.py                      # FastAPI app with WebSocket
│   ├── stream_processor.py          # Real-time Azure Table polling
│   ├── metrics_aggregator.py        # Rolling metrics calculation
│   ├── config.py                    # Service configuration
│   ├── requirements.txt             # Python dependencies
│   └── TESTING_GUIDE.md             # Local testing guide
│
├── iaas-deployment/                 # NEW - VM Deployment Scripts
│   ├── deploy-vm.sh                 # Azure CLI VM creation
│   ├── vm-setup.sh                  # VM initialization script
│   └── README.md                     # Deployment quick reference
│
├── scripts/
│   ├── generate_data.py             # Generates 50k synthetic training samples
│   └── train_model.py               # Trains LightGBM → exports ONNX
│
├── shared/
│   ├── ml/
│   │   ├── models/
│   │   │   ├── wait_time_model.onnx      # Trained ML model (R²=0.9948)
│   │   │   └── model_metadata.json       # Model version & metrics
│   │   ├── aws_anomaly_client.py         # AWS SageMaker client (mocked)
│   │   └── onnx_inference.py             # ONNX Runtime wrapper
│   ├── openai_client.py             # OpenAI API wrapper
│   ├── models.py                    # Pydantic data models
│   └── storage_client.py            # Azure Storage wrappers
│
├── simulation/
│   ├── crowd_sim.py                 # SimPy discrete-event simulation
│   └── api_wrapper.py               # Flask API for simulation
│
├── tests/
│   ├── test_agent.py                # Agent testing
│   ├── test_rca.py                  # RCA testing
│   └── locustfile.py                # Load testing
│
├── ARCHITECTURE.md                   # Complete system architecture
├── AZURE_VM_DEPLOYMENT.md            # NEW - VM deployment guide
├── IAAS_IMPLEMENTATION_GUIDE.md      # NEW - IaaS setup guide
├── DEMO_SCRIPT.md                   # Presentation guide
├── DOCS_INDEX.md                    # Documentation index
├── EXECUTION_GUIDE.md               # Deployment instructions
├── function_app.py                  # Azure Functions entry point
├── host.json                        # Functions configuration
├── local.settings.json              # Local environment variables
└── requirements.txt                 # Python dependencies
```

---

## ⚙️ Configuration

### Local Development (`local.settings.json`)

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;...",
    "FUNCTIONS_WORKER_RUNTIME": "python",
    "TABLE_NAME_GATES": "gatestatus",
    "TABLE_NAME_AI_DECISIONS": "aidecisions",
    "TABLE_NAME_INVESTIGATION_LOGS": "investigationlogs",
    "QUEUE_NAME_INFLOW": "gates-inflow",
    "OPENAI_API_KEY": "your-openai-key",
    "OPENAI_MODEL": "gpt-3.5-turbo"
  }
}
```

> **Note**: AWS credentials are optional. If not provided, anomaly detection runs in MOCK mode (cost-free).

---

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Azure Functions Core Tools
- Azurite
- OpenAI API key (for AI features)

### 1. Setup Environment
```bash
cd M1-flow-azure
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### 2. Train ML Model
```bash
python scripts/generate_data.py  # Creates 50k training samples
python scripts/train_model.py    # Trains model → ONNX (~30 sec)
```

### 3. Start Services

**Terminal 1 - Storage:**
```bash
azurite --silent --inMemoryPersistence
```

**Terminal 2 - Functions:**
```bash
func start
```

### 4. Test the System

```bash
# Send gate data
curl -X POST http://localhost:7071/api/flow/ingest ^
   -H "Content-Type: application/json" ^
   -d "{\"stadiumId\": \"AGADIR\", \"gateId\": \"G1\", \"ts\": \"2025-07-14T17:00:00Z\", \"perMinuteCount\": 30, \"avgProcessingTime\": 4.0, \"queueLength\": 50}"

# Check status (will trigger RCA if anomaly detected)
curl http://localhost:7071/api/flow/status?stadiumId=AGADIR

# Query AI agent insights
curl http://localhost:7071/api/flow/ai-insights?stadium_id=AGADIR

# Test AI agent
python tests/test_agent.py

# Test RCA system
python tests/test_rca.py
```

---

## 🔗 API Reference

### Core APIs

#### `POST /api/flow/ingest`
Ingests real-time turnstile data.

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

#### `GET /api/flow/status?stadiumId={id}`
Returns real-time gate status with ML predictions. **Automatically triggers RCA** when anomaly detected.

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
      "investigation_status": "completed",
      "root_cause": "Scanner Malfunction"
    }
  ]
}
```

### AI APIs

#### `GET /api/flow/ai-insights?stadium_id={id}&limit={n}`
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
  },
  "recent_decisions": [...]
}
```

#### `GET /api/flow/investigation/{investigation_id}`
Query RCA investigation results.

**Response:**
```json
{
  "investigation_id": "INV_G2_1763902395",
  "diagnosis": {
    "root_cause": "Scanner Malfunction",
    "confidence": 0.80
  },
  "anomaly_score": 4.5,
  "mitigation": {
    "priority": "high"
  }
}
```

---

## 🤖 AI Features

### Orchestration Agent
- **Runs**: Every 2 minutes (automatic timer trigger)
- **Functions**: 5 capabilities (get_all_gate_status, simulate_redistribution, send_staff_alert, etc.)
- **Decision Loop**: Observe → Reason → Act (max 5 GPT iterations)
- **Fallback**: Rule-based logic if OpenAI unavailable
- **Cost**: ~$0.004 per decision

### Root Cause Analysis (RCA)
- **Trigger**: Automatic when anomaly detected in `/flow/status`
- **Pipeline**:
  1. Generate 5-7 hypotheses (GPT chain-of-thought)
  2. Test hypotheses (5 test executors: Hardware, Weather, System, Ops, External)
  3. Bayesian ranking (combine prior + evidence)
  4. Mitigation plan (playbook + GPT customization)
- **Cost**: ~$0.001 per investigation
- **Cache**: 15-minute TTL for identical anomalies

---

## 🧪 Testing

### Test Agent
```bash
python tests/test_agent.py
```
Verifies GPT function calling, decision logging, cost tracking.

### Test RCA
```bash
python tests/test_rca.py
```
Verifies hypothesis generation, evidence collection, Bayesian reasoning, mitigation planning.

### Load Testing
```bash
locust -f tests/locustfile.py
# Target: 100+ requests/sec, P95 latency <500ms
```

---

## 📊 Performance Metrics

- **Prediction Accuracy**: R² = 0.9948 (99.48%)
- **Latency**: <200ms end-to-end (core), <5s (agent decision), <10s (RCA)
- **Throughput**: 100+ requests/second
- **Model Inference**: <50ms per prediction
- **AI Cost**: $0.004/agent + $0.001/RCA ≈ $10-30/month
- **Scalability**: Serverless (auto-scales to demand)

---

## 🎓 For Professors / Evaluators

### Technical Innovations
1. **Multi-Model AI**: ONNX (prediction) + GPT (reasoning) + SageMaker (anomaly)
2. **Autonomous Agent**: Function calling with chain-of-thought reasoning
3. **Bayesian RCA**: Evidence-based diagnosis with uncertainty quantification
4. **Hybrid Cloud Architecture**: PaaS (Functions) + IaaS (VM) + Multi-cloud (AWS)
5. **Real-Time Streaming**: WebSocket-based persistent monitoring
6. **Cost Optimization**: Mock modes, caching, GPT-3.5-Turbo selection

### Learning Objectives Demonstrated
- ✅ Serverless cloud architecture (Azure Functions - PaaS)
- ✅ IaaS deployment (Azure VM with systemd, nginx)
- ✅ Hybrid cloud design (PaaS + IaaS integration)
- ✅ Multi-cloud integration (Azure + AWS + OpenAI)
- ✅ ML engineering (train → ONNX → deploy)
- ✅ AI agent design (function calling, RAG-like patterns)
- ✅ Real-time systems (WebSocket streaming)
- ✅ Production engineering (logging, fallbacks, caching, systemd services)

---

## ❓ Troubleshooting

**Q: Agent test fails with "No module named 'ai_engine'"?**  
A: Run `set PYTHONPATH=.` before running tests

**Q: OpenAI API errors?**  
A: Verify `OPENAI_API_KEY` in `.env` file

**Q: RCA never triggers?**  
A: Ensure anomaly score > 3.0 to trigger investigation

**Q: High OpenAI costs?**  
A: System uses GPT-3.5-Turbo by default. Check `OPENAI_MODEL` setting.

---

## 👥 Team

**M1 - Smart Stadium Flow Controller**  
Part of the CAN 2025 FanOps Platform

For questions or integration support, see `docs/integration_contracts.md`

---

## 🌐 Production Deployment Status

### Azure Functions (PaaS) - LIVE ✅
**Function App**: `func-m1-fanops-comehdi`  
**Region**: France Central  
**Base URL**: `https://func-m1-fanops-comehdi-fwgeaxhwambjcsev.francecentral-01.azurewebsites.net`  
**Status**: Fully operational

**Endpoints:**
- `POST /api/flow/ingest` - Ingest gate telemetry
- `GET /api/flow/status?stadiumId={id}` - Get gate status + ML predictions
- `GET /api/flow/ai-insights?stadium_id={id}` - Query AI agent decisions
- `GET /api/flow/investigation/{id}` - Get RCA investigation results

### Azure VM (IaaS) - LIVE ✅
**VM Name**: `vm-m1-monitoring`  
**Public IP**: `4.211.206.250`  
**Region**: France Central  
**Status**: 24/7 persistent monitoring active

**Endpoints:**
- `GET http://4.211.206.250/` - Health check
- `GET http://4.211.206.250/api/realtime/gates?stadiumId={id}` - Real-time gate status
- `GET http://4.211.206.250/api/metrics?stadiumId={id}&period={period}` - Aggregated metrics
- `WebSocket ws://4.211.206.250/ws/gates?stadiumId={id}` - Real-time streaming

**CORS Enabled For:**
- `http://localhost:5173` (local development)
- `https://unabsolved-bullishly-curtis.ngrok-free.dev` (ngrok)
- `https://main.dgkr7h0ph8j37.amplifyapp.com` (AWS Amplify)
- `http://4.211.206.250` (VM self)

---

## 🔗 API Reference (For M2/M3/M4 Integration)

### PaaS Endpoints (Azure Functions)

**Base URL**: `https://func-m1-fanops-comehdi-fwgeaxhwambjcsev.francecentral-01.azurewebsites.net`

#### **1. Ingest Gate Data**
```
POST /api/flow/ingest
```

#### **2. Get Gate Status** 
```
GET /api/flow/status?stadiumId={stadium_id}
```

#### **3. AI Agent Insights**
```
GET /api/flow/ai-insights?stadium_id={stadium_id}
```

#### **4. RCA Investigation**
```
GET /api/flow/investigation/{investigation_id}
```

### IaaS Endpoints (Monitoring VM)

**Base URL**: `http://4.211.206.250`

#### **1. Real-Time Gate Status (HTTP)**
```
GET /api/realtime/gates?stadiumId={stadium_id}
```

#### **2. Aggregated Metrics**
```
GET /api/metrics?stadiumId={stadium_id}&period={5m|15m|1h|1d}
```

#### **3. Real-Time Streaming (WebSocket)**
```javascript
const ws = new WebSocket('ws://4.211.206.250/ws/gates?stadiumId=AGADIR');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Gate update:', data);
};
```

---

## 📊 Architecture Comparison

### Before (PaaS Only)
```
Frontend → Azure Functions → Azure Storage
          (Serverless)
```

### Current (Hybrid PaaS + IaaS)
```
                  ┌─→ Azure Functions (PaaS) ─→ ML + AI + RCA
                  │   - APIs (200ms latency)
Frontend ─────────┤   - Serverless autoscaling
                  │
                  └─→ Azure VM (IaaS) ─────────→ Real-time monitoring
                      - WebSocket streaming
                      - 24/7 persistent
                      - Rolling metrics
                      
                      Both read/write → Azure Storage (Tables, Queue, Blob)
```

### Stadium IDs
- `AGADIR` - Agadir Stadium
- `RABAT` - Rabat Stadium  
- `CASABLANCA` - Casablanca Stadium

### Example Usage (Python)
```python
import requests
import websocket

# PaaS: Get status via Azure Functions
status = requests.get(
    "https://func-m1-fanops-comehdi-fwgeaxhwambjcsev.francecentral-01.azurewebsites.net/api/flow/status?stadiumId=AGADIR"
).json()

# IaaS: Real-time updates via WebSocket
ws = websocket.WebSocket()
ws.connect("ws://4.211.206.250/ws/gates?stadiumId=AGADIR")
while True:
    data = ws.recv()
    print(f"Update: {data}")
```

**For detailed API docs and integration, see [docs/integration_contracts.md](../docs/integration_contracts.md)**