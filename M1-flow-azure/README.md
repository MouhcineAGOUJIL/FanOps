# 🏟️ M1 - Smart Stadium Flow Controller

**Cloud**: Microsoft Azure + AWS (Hybrid) | **Language**: Python 3.9+ | **Type**: Serverless Microservice

## 📖 Overview
**Microservice 1 (M1)** is the intelligent nervous system of the CAN 2025 FanOps platform. It manages the flow of thousands of fans entering the stadium in real-time.

**Key Capabilities:**
1.  **Real-time Ingestion**: Handles high-frequency telemetry from turnstiles.
2.  **Wait Time Prediction**: Uses ML (LightGBM/ONNX) to predict wait times based on queue length and arrival rates.
3.  **Anomaly Detection**: Integrates with AWS SageMaker to detect security threats (e.g., gate stampedes).
4.  **Smart Redirection**: Balances load between gates (Green/Yellow/Red status).

---

## 📂 Project Structure
```text
M1-flow-azure/
├── config/
│   └── settings.py          # Environment & Pydantic configuration
├── handlers/
│   ├── flow_ingest.py       # [HTTP] Ingests raw gate data -> Queue
│   ├── flow_status.py       # [HTTP] Returns gate status (Green/Red)
│   └── process_queue.py     # [Queue] Processes data, runs ML, updates Table
├── scripts/
│   ├── generate_data.py     # Generates 50k synthetic training samples
│   └── train_model.py       # Trains LightGBM and exports ONNX
├── shared/
│   ├── ml/
│   │   ├── models/          # Stores .onnx models
│   │   ├── aws_anomaly...   # Client for AWS SageMaker
│   │   └── onnx_inference...# Client for ONNX Runtime
│   ├── models.py            # Pydantic Data Models
│   └── storage_client.py    # Azure Storage Wrappers
├── simulation/              # Phase 3: IaaS
│   ├── api_wrapper.py       # Flask API for simulation
│   └── crowd_sim.py         # SimPy Crowd Logic
├── tests/
│   └── locustfile.py        # Load Testing Script
├── function_app.py          # Main Azure Functions Entry Point
├── host.json                # Functions Host Config
├── local.settings.json      # Local Env Vars (Secrets)
└── requirements.txt         # Python Dependencies
```

---

## ⚙️ Configuration
Create a `local.settings.json` for local development:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "python",
    "TABLE_NAME_GATES": "gatestatus",
    "QUEUE_NAME_INFLOW": "gates-inflow",
    "QUEUE_NAME_CONTROL": "gates-control",
    "BLOB_CONTAINER_MODELS": "ml-models",
    
    "AWS_ACCESS_KEY_ID": "optional_for_mock",
    "AWS_SECRET_ACCESS_KEY": "optional_for_mock",
    "SAGEMAKER_ENDPOINT_NAME": "rcf-anomaly-endpoint"
  }
}
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
*   **Python 3.9+**
*   **Azure Functions Core Tools** (`npm i -g azure-functions-core-tools@4`)
*   **Azurite** (`npm i -g azurite`)

### 2. Installation
```bash
cd M1-flow-azure
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Run the ML Pipeline
Before starting, generate the model so the AI works:
```bash
python scripts/generate_data.py  # Generates synthetic_gate_data.csv
python scripts/train_model.py    # Creates shared/ml/models/wait_time_model.onnx
```

### 4. Start Services
You need **two terminals**:

**Terminal 1 (Storage)**:
```bash
azurite
```

**Terminal 2 (App)**:
```bash
func start
```

---

## 🔗 API Documentation

### 1. Ingest Telemetry (IoT)
**Endpoint**: `POST /api/flow/ingest`
**Description**: Receives raw data from turnstiles. Async processing via Queue.

**Request**:
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
**Response**: `202 Accepted`

### 2. Get Gate Status (Frontend/Admin)
**Endpoint**: `GET /api/flow/status?stadiumId={id}`
**Description**: Returns real-time status, wait times, and anomaly flags.

**Response**:
```json
{
  "stadiumId": "AGADIR",
  "gates": [
    {
      "gateId": "G1",
      "wait": 12.5,          // Minutes (Predicted by ML)
      "state": "red",        // green (<5m), yellow (5-10m), red (>10m)
      "anomaly": true,       // Security threat detected?
      "anomalyScore": 3.4,   // Severity
      "last_updated": "..."
    }
  ]
}
```

---

## 🤝 Integration Guide (For M2, M3, M4 Teams)

### How to consume M1 Data
If you are working on **M4 (Sponsors)** or **Frontend**, here is how to integrate with M1.

#### 1. Shared IDs
Ensure you use the same IDs as M1:
*   **Stadiums**: `AGADIR`, `RABAT`, `CASABLANCA`
*   **Gates**: `G1`, `G2`, `G3`...

#### 2. Testing without M1 running
If M1 is offline, you can mock the response in your service using this JSON:
```json
// Mock Response for GET /flow/status
{
  "stadiumId": "AGADIR",
  "gates": [
    {"gateId": "G1", "wait": 2.5, "state": "green", "anomaly": false},
    {"gateId": "G2", "wait": 12.0, "state": "red", "anomaly": true},
    {"gateId": "G3", "wait": 6.0, "state": "yellow", "anomaly": false}
  ]
}
```

#### 3. Data Dictionary
| Field | Type | Description |
| :--- | :--- | :--- |
| `wait` | Float | Estimated wait time in minutes. |
| `state` | String | Traffic light status: `green` (<5m), `yellow` (5-10m), `red` (>10m). |
| `anomaly` | Boolean | `true` if AWS SageMaker (or Mock) detects irregular patterns. |

---

## ❓ Troubleshooting

**Q: `func start` fails with "No worker runtime found"?**
A: Make sure you activated your venv (`.venv\Scripts\activate`) and installed requirements.

**Q: `Connection refused` to Storage?**
A: Ensure **Azurite** is running in a separate terminal.

**Q: Model not found error?**
A: Run `python scripts/train_model.py` to generate the ONNX file.