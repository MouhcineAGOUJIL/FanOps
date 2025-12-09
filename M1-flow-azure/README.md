# 🧠 M1: Operational Intelligence Service (Azure)

**The Brain of FanOps Crowd Management**

The **M1 Flow Controller** is a sophisticated Operational Intelligence service built on **Microsoft Azure**. It serves as the real-time decision engine for the FanOps platform, processing intake flow telemetry, detecting anomalies, and autonomously orchestrating crowd control actions using AI.

<div align="center">
  <img src="Assets/M1_Arch.png" alt="M1 Architecture Diagram" width="100%" style="border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); margin: 20px 0;"/>
</div>

---

## 🚀 Key Capabilities

### 1. Real-Time Crowd Analysis (The "Eyes")
*   **Ingestion**: High-throughput ingestion of gate telemetry via HTTP Webhooks.
*   **Predictive AI**: A dedicated **LightGBM Model** (executed via **ONNX Runtime**) predicts gate wait times with **>99% accuracy**.
*   **Status Classification**: Automatically classifies gates as **GREEN**, **YELLOW**, or **RED** based on flow velocity and density.

### 2. Autonomous Agent (The "Brain")
*   **Orchestrator**: A background agent runs every 2 minutes to assess system health.
*   **Reasoning Engine**: Leverages **GPT-3.5/4** (via OpenAI API) to analyze complex patterns.
*   **Autonomous Actions**: Can trigger real actions like:
    *   Opening overflow gates.
    *   Sending staff alerts.
    *   Broadcasting announcements.

### 3. Root Cause Analysis (The "Detective")
When an anomaly is detected (e.g., Gate 4 sudden deadlock), the **RCA Engine** activates:
1.  **Hypothesis Generation**: The AI generates potential causes (e.g., "Scanner Failure", "Fan Brawl").
2.  **Evidence Testing**: It runs automated tests against system metrics (Weather, Hardware logs).
3.  **Bayesian Ranking**: Calculates the most probable cause mathematically.
4.  **Mitigation**: Auto-generates a playbook for operations staff to resolve the issue.

---

## 🏗️ Technical Architecture

This service follows a **Serverless functional architecture** using **Azure Functions (Python V2)**.

### Layers
1.  **Blueprints (Handlers)**:
    *   `flow_ingest`: Async buffer entry point (writes to Queue).
    *   `process_queue`: Queue trigger that runs the heavy ML inference.
    *   `flow_status`: Low-latency read API for the Frontend Dashboard.
    *   `agent_orchestrator`: Timer trigger for the autonomous agent.
    *   `investigation`: API to retrieve deep-dive RCA reports.
2.  **Core Engines**:
    *   `ai_engine`: Contains the Agent and RCA logic.
    *   `ml`: Hosts the ONNX model and inference logic.
3.  **Data Layer**:
    *   **Azure Queue Storage**: Buffer for high-volume telemetry.
    *   **Azure Table Storage**: Sub-10ms latency store for gate state `[gatestatus]` and audit logs `[investigationlogs]`.

---

## 🛠️ Setup & Execution

### Prerequisites
*   Python 3.9+
*   Azure Functions Core Tools (`npm i -g azure-functions-core-tools`)
*   Azurite (`npm i -g azurite`) for local storage emulation

### Local Development

1.  **Install Dependencies**
    ```bash
    python3 -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
    ```

2.  **Start Storage Emulator**
    ```bash
    azurite --location . --silent
    ```

3.  **Run Function App**
    ```bash
    func start
    ```

The API will be available at `http://localhost:7071`.

### Integration
*   **Base URL**: `http://localhost:7071/api`
*   **Endpoints**:
    *   `POST /flow/ingest`: Send gate data.
    *   `GET /flow/status`: Get real-time dashboard state.
    *   `GET /flow/ai-insights`: Retrieve agent decisions.

---

## 🧪 Testing

We include a robust testing suite including a **Locust** load tester and **Pytest** suites.

```bash
# Run Unit Tests (Agent & RCA)
pytest

# Run Load Test (Simulate 5000 fans)
locust -f tests/locustfile.py
```