# 🏗️ M1 Flow Controller - Complete Architecture

## 📐 System Architecture Diagram (Draw.io Specification)

### **For Draw.io - Create 3 Layers:**

---

## **LAYER 1: External Interfaces** (Top - Purple Background)

### Components:

**1. Frontend Applications** (Rectangle, Blue)
- React Dashboard (localhost:5173)
- Ngrok Instance (https://unabsolved-bullishly-curtis.ngrok-free.dev)
- AWS Amplify (https://main.dgkr7h0ph8j37.amplifyapp.com)

**Arrow Down (HTTPS) →**

**2. Azure Function App** (Cloud Shape, Blue)
- Name: `func-m1-fanops-comehdi`
- Region: France Central
- Runtime: Python 3.9
- Label: "CORS: *, localhost:5173, ngrok, amplify"

---

## **LAYER 2: Function Handlers** (Middle - Green Background)

### HTTP Triggers (Rectangles, Green):

**1. flow_ingest** ← `POST /api/flow/ingest`
- Input: Gate telemetry JSON
- Output: 202 Accepted
- Writes to: Azure Queue

**2. flow_status** ← `GET /api/flow/status`
- Reads: Azure Table (gatestatus)
- Returns: Gate status + ML predictions
- **Triggers**: RCA on anomaly detection
- Output: JSON with gates array

**3. ai_insights** ← `GET /api/flow/ai-insights`
- Reads: Azure Table (aidecisions)
- Returns: Agent decisions

**4. investigation** ← `GET /api/flow/investigation/{id}`
- Reads: Azure Table (investigationlogs)
- Returns: Full RCA results

### Background Triggers:

**5. process_queue** (Queue Trigger, Yellow)
- Triggered by: `gates-inflow` queue
- Processes: Telemetry data
- Calls: ML Inference + Anomaly Detection
- Writes to: gatestatus table

**6. agent_orchestrator** (Timer Trigger, Orange)
- Schedule: Every 2 minutes
- Calls: OpenAI API (GPT-3.5-Turbo)
- Executes: Function calling (5 functions)
- Writes to: aidecisions table

---

## **LAYER 3: Core Services** (Bottom - Yellow Background)

### AI/ML Services (Hexagons):

**1. ML Inference Engine** (ml/onnx_inference.py)
- Model: wait_time_model.onnx
- Accuracy: R² = 0.9948
- Latency: <50ms
- Output: Wait time prediction

**2. AWS SageMaker Anomaly Detection** (aws_anomaly_client.py)
- Mode: MOCK (fallback ready)
- Input: Gate metrics
- Output: Anomaly score (0-10)

**3. OpenAI Agent** (agent/orchestration_agent.py)
- Model: GPT-3.5-Turbo
- Pattern: Function calling with chain-of-thought
- Functions: 5 capabilities
  - get_all_gate_status
  - simulate_redistribution
  - send_staff_alert
  - trigger_gate_restriction
  - broadcast_announcement
- Cost: ~$0.004/decision
- Fallback: Rule-based logic

**4. RCA Engine** (root_cause/anomaly_investigator.py)
- **Step 1**: Hypothesis Generation (GPT CoT) → 5-7 hypotheses
- **Step 2**: Evidence Testing (5 testers)
  - Hardware Tester
  - Weather Tester
  - System Tester
  - Operations Tester
  - External Events Tester
- **Step 3**: Bayesian Ranking (posterior probability)
- **Step 4**: Mitigation Planning (playbook + GPT)
- Cost: ~$0.001/investigation
- Cache: 15-min TTL

---

## **LAYER 4: Storage Layer** (Bottom - Gray Background)

### Azure Table Storage (Database Icons, Cyan):

**1. gatestatus**
- PartitionKey: stadium_id
- RowKey: gate_id
- Fields: wait (ML prediction), state (traffic light), anomaly (bool), anomalyScore

**2. aidecisions**
- PartitionKey: stadium_id
- RowKey: decision_id
- Fields: decision, reasoning, confidence, functions_called, cost_usd

**3. investigationlogs**
- PartitionKey: stadium_id
- RowKey: investigation_id
- Fields: root_cause, confidence, all_hypotheses (JSON), tested_hypotheses (JSON), bayesian_analysis (JSON), mitigation_actions

### Azure Queue Storage (Queue Icon, Purple):

**gates-inflow**
- Purpose: Async processing buffer
- TTL: 7 days
- Processing: FIFO

### Azure Blob Storage (Folder Icon, Orange):

**models/**
- wait_time_model.onnx (LightGBM trained model)
- model_metadata.json

**config/prompts/**
- agent_system_prompt.txt
- mitigation_playbook.json

---

## **LAYER 5: External Dependencies** (Right Side - Orange Background)

**1. OpenAI API** (Cloud, Green)
- Endpoint: https://api.openai.com/v1/chat/completions
- Model: gpt-3.5-turbo
- Usage: Agent decisions + RCA hypotheses

**2. AWS SageMaker** (Cloud, Orange)
- Endpoint: eu-north-1
- Model: (Mocked for now)
- Usage: Anomaly detection

---

## **Data Flow Arrows:**

### Flow 1: Real-time Ingestion (Blue Arrows)
```
Frontend → POST /flow/ingest → Azure Queue → process_queue → ML Inference → gatestatus Table
```

### Flow 2: Status Query (Green Arrows)
```
Frontend → GET /flow/status → Read gatestatus → (if anomaly) Trigger RCA → investigationlogs Table → Return JSON
```

### Flow 3: AI Agent Loop (Purple Arrows)
```
Timer (2min) → agent_orchestrator → OpenAI API → Execute Functions → aidecisions Table
```

### Flow 4: RCA Pipeline (Red Arrows)
```
Anomaly Detection → RCA Orchestrator → Hypothesis Generator (GPT) → Evidence Testers → Bayesian Ranker → Mitigation Recommender (GPT) → investigationlogs Table
```

---

## **🎨 Draw.io Color Scheme:**

- **Primary Functions**: `#4285F4` (Google Blue)
- **AI Components**: `#34A853` (Green)
- **Storage**: `#00ACC1` (Cyan)
- **External APIs**: `#FF6F00` (Orange)
- **Triggers**: `#FBC02D` (Yellow)
- **Data Flows**: 
  - Ingest: `#2196F3` (Blue)
  - Query: `#4CAF50` (Green)
  - Agent: `#9C27B0` (Purple)
  - RCA: `#F44336` (Red)

---

## **📊 Component Relationships:**

### Synchronous Calls:
- flow_status → ML Inference (<50ms)
- flow_status → RCA Engine (if anomaly) (~5-10s)
- agent_orchestrator → OpenAI API (~2-5s)

### Asynchronous:
- flow_ingest → Queue → process_queue (decoupled)

### Caching:
- RCA results: 15-min TTL (in-memory)
- ML model: Loaded once at startup

---

## **🔐 Security & Configuration:**

### Environment Variables:
```
OPENAI_API_KEY → OpenAI Client
AZURE_STORAGE_CONNECTION_STRING → All storage operations
AWS_ACCESS_KEY_ID → SageMaker (optional)
TABLE_NAME_GATES / TABLE_NAME_AI_DECISIONS / TABLE_NAME_INVESTIGATION_LOGS
QUEUE_NAME_INFLOW
```

### CORS Configuration:
```
Allowed Origins:
- http://localhost:5173
- https://unabsolved-bullishly-curtis.ngrok-free.dev
- https://main.dgkr7h0ph8j37.amplifyapp.com
- * (wildcard for dev)
```

---

## **📈 Performance Characteristics:**

| Metric | Value |
|--------|-------|
| ML Prediction Latency | <50ms |
| End-to-End Ingestion | <200ms |
| Status Query | <500ms |
| Agent Decision | 2-5s |
| RCA Investigation | 5-10s |
| Throughput | 100+ req/s |
| Model Accuracy | R²=0.9948 |

---

## **💰 Cost Breakdown:**

| Component | Cost/Operation |
|-----------|----------------|
| Azure Functions | ~$0.000001/execution |
| Azure Storage | ~$0.01/GB/month |
| OpenAI Agent | ~$0.004/decision |
| OpenAI RCA | ~$0.001/investigation |
| AWS SageMaker | $0 (mocked) |
| **Total Est.** | **$10-30/month** |

---

## **🔄 Auto-Scaling Logic:**

- **Consumption Plan**: Auto-scales based on queue depth
- **Function Concurrency**: Max 200 instances
- **Queue Processing**: 16 messages/batch
- **Timer Agent**: Single instance (coordinated by Azure)

---

## **🎯 Traffic Light Classification:**

```
if wait <= 5 min AND anomaly == false:
    state = "green"
elif wait <= 10 min:
    state = "yellow"  
else:
    state = "red"
```

---

## **🧪 Testing Architecture:**

### Unit Tests:
- `tests/test_agent.py` → Agent + Function calling
- `tests/test_rca.py` → RCA pipeline

### Integration Tests:
- `tests/locustfile.py` → Load testing (100 req/s)

### Simulation:
- `simulation/crowd_sim.py` → SimPy discrete-event simulation

---

## **📚 Documentation Files:**

| File | Purpose |
|------|---------|
| README.md | Main overview & quick start |
| EXECUTION_GUIDE.md | Local + Azure deployment |
| DEMO_SCRIPT.md | 5-min presentation walkthrough |
| CLOUD_DEPLOYMENT.md | Azure portal step-by-step |
| POSTMAN_GUIDE.md | API testing guide |
| FIX_CORS.md | CORS troubleshooting |
| FRONTEND_INTEGRATION.md | React integration guide |
| ../docs/integration_contracts.md | API contracts for M2/M3/M4 |
| ../docs/M1_INTEGRATION.md | Quick integration guide |

---

## **🔗 Integration Points:**

### With M2 (AWS Security):
- M2 authenticates users → sends JWT
- M1 accepts requests with JWT in header
- M1 validates ticket via M2 API (future)

### With M3 (Resource Management):
- M1 sends gate congestion data
- M3 allocates staff based on M1 recommendations

### With M4 (AI Personalization):
- M4 queries M1 for real-time wait times
- M4 recommends gates to fans based on M1 data

---

This architecture enables:
✅ Real-time crowd flow management
✅ Autonomous AI decision-making
✅ Proactive anomaly investigation
✅ Scalable serverless deployment
✅ Multi-cloud AI integration
