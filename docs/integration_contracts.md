# 🤝 Integration Contracts & Shared Data Models

This document defines the **shared standards** that all microservices (M1, M2, M3, M4) must follow to ensure seamless integration.

## 1. Shared Identifiers (IDs)
All services must use these exact ID formats to ensure data consistency.

| Entity | Format | Example | Notes |
| :--- | :--- | :--- | :--- |
| **Stadium ID** | `UPPERCASE_CITY` | `AGADIR`, `RABAT`, `TANGER` | |
| **Match ID** | `CAN2025-{TEAM1}-{TEAM2}` | `CAN2025-MAR-CIV` | ISO 3-letter country codes |
| **Gate ID** | `G{Number}` | `G1`, `G2`, `G12` | Unique per stadium |
| **Zone ID** | `UPPERCASE_DIRECTION` | `NORD`, `SUD`, `EST`, `OUEST` | For sponsor targeting |

## 2. M1 - Flow Controller API Contract
**Owner**: M1 Team (Azure) - El Mehdi OUGHEGI  
**Status**: ✅ **PRODUCTION DEPLOYED**  
**Base URL (Local)**: `http://localhost:7071/api`  
**Base URL (Prod)**: `https://func-m1-fanops-comehdi-fwgeaxhwambjcsev.francecentral-01.azurewebsites.net/api`

### 🔹 Endpoint: Get Gate Status (with ML Predictions)
Used by **Admin Console** and **Fan App**.

*   **GET** `/flow/status?stadiumId={stadiumId}`
*   **Response Schema**:
    ```json
    {
      "stadiumId": "AGADIR",
      "gates": [
        {
          "gateId": "G1",
          "wait": 5.2,             // ML-predicted wait time (ONNX model, R²=0.9948)
          "state": "yellow",       // green (<5m), yellow (5-10m), red (>10m)
          "anomaly": false,        // AWS SageMaker anomaly detection
          "anomalyScore": 2.1,     // Anomaly severity (0-5)
          "last_updated": "2025-07-14T18:00:00Z",
          
          // If anomaly detected, RCA results included:
          "investigation_id": "INV_G1_1763902395",
          "investigation_status": "completed",
          "root_cause": "Scanner Malfunction"  // AI-diagnosed root cause
        }
      ]
    }
    ```

### 🔹 Endpoint: Ingest Telemetry
Used by **IoT Turnstiles** (or simulated by M2/M3 for testing).

*   **POST** `/flow/ingest`
*   **Payload Schema**:
    ```json
    {
      "stadiumId": "AGADIR",
      "gateId": "G1",
      "ts": "2025-07-14T18:00:00Z", // ISO 8601 UTC
      "perMinuteCount": 25,         // People passing through
      "avgProcessingTime": 4.5,     // Seconds per person
      "queueLength": 12             // Current queue size
    }
    ```
*   **Response**: `202 Accepted` - {"status": "accepted", "gateId": "G1"}

### 🔹 Endpoint: AI Agent Insights (NEW)
Get AI agent's latest recommendations and reasoning.

*   **GET** `/flow/ai-insights?stadium_id={stadiumId}&limit={n}`
*   **Response Schema**:
    ```json
    {
      "stadium_id": "AGADIR",
      "latest_decision": {
        "decision": "Monitor gate G1 closely. Prepare for VIP arrivals...",
        "reasoning": "Current situation manageable but vigilance required...",
        "confidence": 0.9,
        "timestamp": "2025-11-23T16:00:00Z",
        "functions_called": ["get_all_gate_status", "get_match_context"],
        "cost_usd": 0.0041
      },
      "recent_decisions": [...],
      "total_decisions": 15
    }
    ```

### 🔹 Endpoint: RCA Investigation Details (NEW)
Query detailed root cause analysis for an anomaly.

*   **GET** `/flow/investigation/{investigation_id}`
*   **Response Schema**:
    ```json
    {
      "investigation_id": "INV_G2_1763902395",
      "stadium_id": "AGADIR",
      "gate_id": "G2",
      "diagnosis": {
        "root_cause": "Scanner Malfunction",
        "confidence": 0.8
      },
      "anomaly_score": 4.5,
      "mitigation": {
        "priority": "high"
      },
      "status": "completed"
    }
    ```

**Note**: Authentication removed for testing. Contact M1 team for function key if needed.


## 3. Integration Scenarios

### Scenario A: M4 (Sponsors) needs Crowd Density
M4 can poll M1's `/flow/status` to find high-traffic zones.
*   *Logic*: If `gateId` G1 and G2 (Zone NORD) have `state: "red"`, trigger "Waiting in line?" promotions for Zone NORD.

### Scenario B: M2 (Security) reports Anomaly
M2 detects a fake ticket surge at G1.
*   *Action*: M2 calls M1 (or M1 checks M2) to flag `anomaly: true` in the status, alerting the Ops Dashboard.

### Scenario C: M3 (Forecast) vs Real-time
M3 predicts 500 people/min. M1 measures 600 people/min.
*   *Action*: Dashboard compares M3 `forecast` vs M1 `real-time` to show "Unexpected Surge".
