# M1 - Smart Stadium Flow Controller (Azure)

## Overview
**Microservice 1 (M1)** is the core traffic management system for the CAN 2025 FanOps platform. It optimizes fan flow at stadium gates using a multi-cloud architecture (Azure + AWS).

## 🚀 Phase 1: Azure Foundation
The core operational layer is built on **Azure Serverless**.

### Components
*   **Azure Functions (Python)**:
    *   `flow_ingest`: High-throughput HTTP endpoint for gate telemetry.
    *   `process_gate_queue`: Async Queue Trigger that processes raw data.
    *   `flow_status`: HTTP endpoint providing real-time status and recommendations.
*   **Azure Storage**:
    *   **Queue (`gates-inflow`)**: Decouples ingestion from processing.
    *   **Table (`gate_status`)**: Low-latency NoSQL storage for gate state.
    *   **Blob (`ml-models`)**: Stores versioned ONNX models.

### Execution
```bash
# Start local Azure Functions
func start
```

## 🧠 Phase 2: AI/ML Layer
Intelligent decision-making using Hybrid ML (Edge + Cloud).

### 1. Wait Time Prediction (Azure)
*   **Model**: LightGBM Regressor (converted to ONNX).
*   **Features**: Time to kickoff, queue length, gate profile, historical patterns.
*   **Inference**: Runs locally within the Azure Function (`process_gate_queue`) using `onnxruntime`.

**How to Run:**
```bash
# 1. Generate realistic synthetic data (50k samples)
python scripts/generate_data.py

# 2. Train model and export to ONNX
python scripts/train_model.py
```

### 2. Anomaly Detection (AWS)
*   **Service**: Amazon SageMaker (Random Cut Forest).
*   **Integration**: Azure Function calls AWS Endpoint via `boto3`.
*   **Status**: Currently running in **MOCK MODE** (cost-saving) but fully integrated.

## 🎮 Phase 3: IaaS & Simulation
Tools for stress testing and capacity planning.

### 1. Crowd Simulation
A discrete-event simulation (SimPy) to model fan behavior and gate dynamics.
*   **Run API**: `python simulation/api_wrapper.py`
*   **Trigger**: `curl -X POST http://localhost:5000/simulate -d "{\"duration\": 60}"`

### 2. Load Testing
Locust scripts to stress test the Azure Functions.
*   **Run**: `locust -f tests/locustfile.py`
*   **UI**: Open `http://localhost:8089`

## 🛠️ Setup & Installation

### Prerequisites
*   Python 3.9+
*   Azure Functions Core Tools
*   Azurite (Storage Emulator)

### Quick Start
1.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
2.  **Start Storage Emulator**:
    ```bash
    azurite
    ```
3.  **Start App**:
    ```bash
    func start
    ```

## 📚 API Documentation

### Ingest Data
**POST** `/api/flow/ingest`
```json
{
  "stadiumId": "AGADIR",
  "gateId": "G1",
  "ts": "2025-07-14T18:05:00Z",
  "perMinuteCount": 25,
  "avgProcessingTime": 4.5,
  "queueLength": 12
}
```

### Get Status
**GET** `/api/flow/status?stadiumId=AGADIR`
```json
{
  "stadiumId": "AGADIR",
  "gates": [
    {
      "gateId": "G1",
      "wait": 0.9,
      "state": "green",
      "anomaly": false
    }
  ]
}
```