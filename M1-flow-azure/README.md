# M1 - Smart Stadium Flow Controller (Azure)

## Overview
**Microservice 1 (M1)** is responsible for optimizing fan flow at stadium gates. It ingests real-time data from turnstiles, calculates wait times, determines gate status (Green/Yellow/Red), and provides intelligent redirection recommendations.

It uses a **Multi-Cloud Architecture**:
- **Azure**: Core logic, API hosting (Functions), and operational storage (Table/Queue).
- **AWS**: Advanced anomaly detection (SageMaker) - *Integrated via API/SDK*.

## Architecture
### Components
1.  **Azure Functions (Python)**
    -   `flow_ingest`: HTTP Trigger. Receives gate telemetry.
    -   `flow_status`: HTTP Trigger. Returns current status and recommendations.
    -   `process_queue`: Queue Trigger. Async processing of raw data to calculate metrics.
2.  **Azure Storage**
    -   **Queue (`gates-inflow`)**: Buffers incoming high-velocity data.
    -   **Table (`gate_status`)**: Fast NoSQL storage for current gate state.
    -   **Blob (`ml-models`)**: Stores ONNX models for wait time prediction.
3.  **AI/ML**
    -   **Wait Time Prediction**: ONNX model running locally in Azure Function.
    -   **Anomaly Detection**: Calls AWS SageMaker endpoint (Phase 2).

## Setup Instructions

### Prerequisites
-   Python 3.9+
-   Azure Functions Core Tools
-   Azurite (for local storage emulation)

### Installation
1.  Navigate to the folder:
    ```bash
    cd M1-flow-azure
    ```
2.  Create a virtual environment:
    ```bash
    python -m venv .venv
    source .venv/bin/activate  # or .venv\Scripts\activate on Windows
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

### Local Development
1.  Start Azurite (if not running):
    -   VS Code: `Ctrl+Shift+P` -> `Azurite: Start`
2.  Start the Function App:
    ```bash
    func start
    ```

## API Endpoints

### 1. Ingest Data
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

### 2. Get Status
**GET** `/api/flow/status?stadiumId=AGADIR`
```json
{
  "stadiumId": "AGADIR",
  "gates": [
    {
      "gateId": "G1",
      "wait": 0.9,
      "state": "green",
      "last_updated": "2025-07-14T18:05:05.123Z"
    }
  ]
}
```

## Cloud Resources (Cost Optimization)
**Do not create these yet.** Use local emulators for development.
-   **Production**:
    -   Azure Function App (Consumption Plan - Pay per execution).
    -   Storage Account (LRS - Low cost).
    -   Key Vault (Standard).