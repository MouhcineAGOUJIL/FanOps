# ☁️ FanOps IaaS Strategy: Moving Beyond Serverless

## 🎯 Objective
Transform FanOps from a purely **Serverless** architecture to a **Hybrid IaaS (Infrastructure as a Service)** model. This increases control, reduces vendor lock-in, and simulates a complex enterprise environment.

---

## 🏗️ Proposed Architecture Changes

### 1. The "Ops" Hub (Central Management)
**Resource**: 1x High-Performance VM (e.g., AWS `t3.medium` or Azure `B2s`)
**Role**: The brain of your operations.
**Software to Install**:
- **Jenkins / GitHub Actions Runner**: To build and deploy code to all clouds.
- **Prometheus & Grafana**: To pull metrics from M1 (Azure), M2 (AWS), and M3/M4 (GCP).
- **Ansible Control Node**: To configure all other VMs automatically.

### 2. M1 (Flow) Migration -> Azure IaaS
**Current**: Azure Functions (Serverless)
**Proposed**: Azure Virtual Machine (Linux)
**Implementation**:
- Provision an **Azure VM** (Ubuntu).
- Install **Node.js** and **PM2** (Process Manager).
- Deploy the M1 code as a standard Express.js app running on port 3000.
- **Benefit**: Full control over the OS, persistent connections (WebSockets) for real-time gate updates.

### 3. M2 (Security) Enhancement -> AWS IaaS
**Current**: AWS Lambda (Serverless)
**Proposed**: Hybrid (Lambda + EC2 Bastion)
**Implementation**:
- Keep Lambda for high-scale verification (it's good for bursts).
- Use the **EC2 Instance** (already created) as a **Security Bastion**:
  - Run **OpenVPN**: To allow secure admin access to the cloud network.
  - Run **Wazuh** or **Suricata**: An Intrusion Detection System (IDS) to monitor network traffic.

### 4. M3/M4 (Data/Sponsors) -> GCP IaaS
**Current**: GCP Cloud Functions
**Proposed**: Google Compute Engine (GCE)
**Implementation**:
- Provision a **GCE Instance**.
- Run a **Docker Container** for the Forecast service (Python/Flask).
- **Benefit**: Run long-running ML training jobs (Forecast) that would time out on Serverless functions.

### 5. The "Global Router" (Load Balancing)
**Resource**: 1x Lightweight VM (Any Cloud)
**Role**: Unified Entry Point.
**Implementation**:
- Install **Nginx** or **HAProxy**.
- Configure it to route traffic:
  - `/flow/*` -> Azure VM IP
  - `/security/*` -> AWS API Gateway
  - `/forecast/*` -> GCP VM IP
- **Benefit**: One domain (`api.fanops.com`) routing to 3 different clouds transparently.

---

## 🚀 Step-by-Step Implementation Plan

### Phase 1: The Ops Server (Recommended Start)
1.  Create an **AWS EC2 Instance** (or use the existing `SecurityTestInstance`).
2.  Install **Docker** and **Docker Compose**.
3.  Deploy **Grafana** and **Prometheus**.
4.  Configure it to scrape metrics from your existing Serverless endpoints.

### Phase 2: M1 Migration (Azure)
1.  Create an **Azure VM**.
2.  Clone the `M1-flow-azure` repo onto it.
3.  Refactor the code slightly to run as a standalone server (using `express` or `fastify`) instead of Azure Function triggers.
4.  Expose port 80/443.

### Phase 3: Global Routing
1.  Configure **Nginx** on your Ops Server.
2.  Point your frontend to this Nginx server instead of calling AWS/Azure directly.

---

## ⚖️ Serverless vs. IaaS Comparison for FanOps

| Feature | Serverless (Current) | IaaS (Proposed) |
| :--- | :--- | :--- |
| **Cost** | Pay-per-request (Cheap for low traffic) | Pay-per-hour (Fixed cost) |
| **Maintenance** | Zero (Provider handles OS) | High (You patch OS, secure ports) |
| **Control** | Low (Limits on runtime/timeout) | Full (Root access) |
| **Networking** | Abstracted | Full control (VPCs, Subnets, VPNs) |
| **Vendor Lock-in** | High (AWS Lambda specific code) | Low (Standard Linux/Docker) |

---

## 💡 Recommendation
For a balanced project that impresses recruiters/professors:
1.  **Keep M2 (Security) on Serverless**: It shows you understand modern event-driven architecture.
2.  **Move M1 (Flow) to IaaS (Azure VM)**: Shows you can manage Linux servers and persistent apps.
3.  **Use IaaS for Monitoring (Ops)**: Shows you can build your own observability stack (Grafana) instead of just using CloudWatch.
