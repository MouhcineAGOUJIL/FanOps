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
**Owner**: M1 Team (Azure)
**Base URL (Local)**: `http://localhost:7071/api`
**Base URL (Prod)**: `https://func-can2025-m1.azurewebsites.net/api` (Example)

### 🔹 Endpoint: Get Gate Status
Used by **Admin Console** and **Fan App**.

*   **GET** `/flow/status?stadiumId={stadiumId}`
*   **Response Schema**:
    ```json
    {
      "stadiumId": "AGADIR",
      "gates": [
        {
          "gateId": "G1",
          "wait": 5.2,             // Estimated wait in minutes
          "state": "yellow",       // green (<5m), yellow (5-10m), red (>10m)
          "anomaly": false,        // true if security anomaly detected
          "last_updated": "2025-07-14T18:00:00Z"
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
