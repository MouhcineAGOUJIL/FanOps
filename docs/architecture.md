# CAN 2025 FanOps - Architecture Documentation

## Global Architecture
The platform is a **Multi-Cloud** solution designed for high availability and specialized service usage.

### Microservices Breakdown
| Service | Cloud | Responsibility | Key Tech |
| :--- | :--- | :--- | :--- |
| **M1 - Flow Controller** | **Azure** | Gate flow optimization, Wait time prediction | Azure Functions, Table Storage, ONNX |
| **M2 - Secure Gates** | **AWS** | Ticket validation, Security audit | Lambda, DynamoDB, API Gateway |
| **M3 - Attendance Forecast** | **GCP** | Crowd forecasting, Historical analysis | Cloud Run, BigQuery |
| **M4 - Sponsor Matching** | **GCP** | Real-time sponsor recommendations | Cloud Functions, Firestore |

### Data Flow
1.  **Fan App / Admin Console** (Frontend) sends requests to the **API Gateway**.
2.  **API Gateway** routes traffic:
    -   `/flow/*` -> **Azure** (M1)
    -   `/security/*` -> **AWS** (M2)
    -   `/forecast/*` -> **GCP** (M3)
    -   `/sponsor/*` -> **GCP** (M4)

## M1 - Smart Stadium Flow Controller (Deep Dive)
### Design Decisions
-   **Async Ingestion**: We use Azure Queue Storage to decouple the high-throughput ingestion endpoint (`/ingest`) from the processing logic. This ensures the API remains responsive even during traffic spikes.
-   **Hybrid ML**:
    -   **Latency-Sensitive**: Wait time prediction runs *locally* within the Azure Function using ONNX Runtime (CPU optimized).
    -   **Compute-Heavy**: Anomaly detection runs on AWS SageMaker (RCF) to leverage specialized managed ML infrastructure.

### Diagram
```mermaid
graph TD
    User[Fan/Admin] -->|HTTP| APIGW[API Gateway]
    APIGW -->|/flow| AzFunc[Azure Function App]
    
    subgraph Azure [Microsoft Azure]
        AzFunc -->|Ingest| Queue[Queue Storage]
        Queue -->|Trigger| Processor[Queue Processor]
        Processor -->|Write| Table[Table Storage]
        AzFunc -->|Read| Table
        AzFunc -->|Load| Blob[Blob Storage (Models)]
    end
    
    subgraph AWS [Amazon Web Services]
        Processor -.->|Check Anomaly| SageMaker[SageMaker Endpoint]
    end
```
