<div align="center">

# 🌍 CAN 2025 FanOps Platform

### 🏆 The Intelligent Multi-Cloud Platform for the Africa Cup of Nations 2025

[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![AWS](https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white)](https://aws.amazon.com/)
[![Azure](https://img.shields.io/badge/Azure-0089D6?style=for-the-badge&logo=microsoft-azure&logoColor=white)](https://azure.microsoft.com/)
[![GCP](https://img.shields.io/badge/GCP-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white)](https://cloud.google.com/)
[![Amplify](https://img.shields.io/badge/AWS%20Amplify-FF9900?style=for-the-badge&logo=aws-amplify&logoColor=white)](https://aws.amazon.com/amplify/)

**[🚀 Live Demo](https://main.d37e6g35293289.amplifyapp.com/) • [📖 Documentation](docs/) • [🏗️ Architecture](#-enterprise-architecture) • [👥 Team](#-team)**

---

### 💡 **Revolutionizing the Stadium Experience**

A state-of-the-art **Multi-Cloud** ecosystem designed to manage 50,000+ fans in real-time. Combining **AWS Serverless Security**, **Azure AI Flow Control**, and **GCP Predictive Analytics** into a seamless experience.

</div>

---

## 🏗️ Enterprise Architecture

This project demonstrates a sophisticated **Hybrid Multi-Cloud Strategy**, leveraging the best-in-class services from AWS, Azure, and Google Cloud.

```mermaid
graph TB
    subgraph "Client Layer"
        User[📱 Fan Mobile App]
        Admin[💻 Admin Dashboard]
    end

    subgraph "🚀 AWS Amplify (Frontend Hosting)"
        Amplify[AWS Amplify<br/>CI/CD & Hosting]
    end

    subgraph "☁️ AWS Security Cloud (M2 & M3)"
        direction TB
        APIG_AWS[API Gateway]
        
        subgraph "Secure-Gates (M2)"
            Lambda_Auth[Lambda<br/>Ticket Verify]
            Lambda_Rep[Lambda<br/>Gate Report]
            DDB_Tix[(DynamoDB<br/>Sold Tickets)]
            DDB_Audit[(DynamoDB<br/>Audit Logs)]
            SQS[SQS Queue<br/>Security Alerts]
            EC2[EC2 t3.micro<br/>Security Scanner]
            KMS[KMS<br/>Encryption]
            SSM[SSM Parameter<br/>Secrets]
            Sentinel[Lambda<br/>Sentinel Shipper]
        end

        subgraph "Forecast Service (M3)"
            Lambda_ML[Lambda<br/>Attendance Predict]
            S3_Model[(S3<br/>ML Models)]
            Layer_Sk[Lambda Layer<br/>Scikit-Learn]
        end
    end

    subgraph "🔷 Microsoft Azure Cloud (M1)"
        direction TB
        Func_Flow[Azure Functions<br/>Flow Controller]
        Table_Azure[(Azure Table<br/>Real-time Data)]
        Queue_Azure[Storage Queue<br/>Events]
        AI_Azure[ONNX Runtime<br/>Flow Inference]
    end

    subgraph "🔵 Google Cloud Platform (M4)"
        direction TB
        CloudFunc_Sponsor[Cloud Functions v2<br/>Sponsor AI]
        GCS_Bucket[(GCS Bucket<br/>Asset Store)]
    end

    subgraph "🛡️ SIEM & Monitoring"
        AzureSentinel[Azure Sentinel<br/>Unified SOC]
        CW[AWS CloudWatch]
    end

    %% Connections
    User -->|HTTPS| Amplify
    Admin -->|HTTPS| Amplify
    Amplify -->|API Calls| APIG_AWS

    %% AWS Flows
    APIG_AWS --> Lambda_Auth
    APIG_AWS --> Lambda_Rep
    APIG_AWS --> Lambda_ML
    
    Lambda_Auth --> DDB_Tix
    Lambda_Auth --> DDB_Audit
    Lambda_Auth --> KMS
    Lambda_Auth --> SSM
    
    Lambda_Rep --> SQS
    Lambda_Rep --> DDB_Audit
    
    SQS --> EC2
    
    %% M3 Flow
    Lambda_ML --> S3_Model
    
    %% Cross-Cloud Flows
    Lambda_Auth -->|HTTPS| Make_Log
    Lambda_Rep -->|HTTPS| Func_Flow
    
    %% Logging Flow
    Lambda_Auth -.-> CW
    Lambda_Rep -.-> CW
    Sentinel -.->|Log Shipping| AzureSentinel
    
    %% GCP Flow
    User -->|Get Promo| CloudFunc_Sponsor
    CloudFunc_Sponsor --> GCS_Bucket

    style Amplify fill:#ff9900,stroke:#232F3E,stroke-width:2px,color:white
    style Lambda_Auth fill:#ff9900,color:white
    style Lambda_Rep fill:#ff9900,color:white
    style Lambda_ML fill:#ff9900,color:white
    style DDB_Tix fill:#3b48cc,color:white
    style DDB_Audit fill:#3b48cc,color:white
    style Func_Flow fill:#0089d6,color:white
    style CloudFunc_Sponsor fill:#4285f4,color:white
    style AzureSentinel fill:#0078d4,color:white
```

---

## 🧩 Microservices Breakdown

### 🎨 Frontend Application
- **Hosting**: **AWS Amplify** (Global CDN, CI/CD)
- **Framework**: React 18 + Vite
- **UI System**: Tailwind CSS + shadcn/ui + Framer Motion
- **State**: Zustand Store

### 🔐 M2: Secure-Gates Service (AWS)
*Secure, high-performance ticket validation system.*
- **Compute**: **AWS Lambda** (Node.js 20.x) - Serverless architecture.
- **Database**: **DynamoDB**
  - `SoldTicketsTable`: Validates ticket existence.
  - `UsedJtiTable`: Prevents replay attacks using JWT JTI.
  - `AuditTable`: Immutable log of all entry attempts.
- **Messaging**: **Amazon SQS** for decoupling security alerts.
- **Security**: 
  - **KMS (Key Management Service)** for encrypting sensitive data.
  - **SSM Parameter Store** for managing environment secrets securely.
- **Infrastructure**: **EC2 (t3.micro)** hosting ZAP scanners for continuous security auditing.
- **Logging**: **CloudWatch Logs** integrated with **Azure Sentinel** via a custom shipper.

### 🧠 M1: flow-controller (Azure)
*Intelligent crowd management core.*
- **Core**: **Azure Functions** (Python).
- **AI Engine**: **ONNX Runtime** running LightGBM models for queue prediction.
- **Storage**: Azure Table Storage for low-latency state management.

### 🔮 M3: Forecast Service (AWS)
*Predictive modeling for attendance.*
- **Compute**: **AWS Lambda** (Python 3.9).
- **ML Stack**: **Scikit-Learn** via Lambda Layers.
- **Storage**: **S3** for model versioning and artifact storage (`m3-forecast-models-can2025`).

### 📢 M4: Sponsor AI (GCP)
*Context-aware targeted advertising.*
- **Compute**: **Google Cloud Functions Gen 2** (Python 3.10).
- **Assets**: Google Cloud Storage.

---

## 🛠️ Technology Stack Summary

| Cloud Provider | Service | Usage |
|:---:|:---|:---|
| <img src="https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg" width="40"/> | **Amplify** | Frontend Hosting & Deployment |
| | **Lambda** | Serverless Compute (Security & Forecasting) |
| | **DynamoDB** | NoSQL Database (High scale) |
| | **SQS** | Asynchronous Messaging |
| | **KMS / SSM** | Encryption & Secret Management |
| | **EC2** | Security Infrastructure |
| <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Microsoft_Azure.svg" width="40"/> | **Functions** | Event-Driven Compute |
| | **Table Storage** | Fast Key/Value Store |
| | **Sentinel** | SIEM / Security Monitoring |
| <img src="https://upload.wikimedia.org/wikipedia/commons/5/51/Google_Cloud_logo.svg" width="40"/> | **Cloud Functions** | Sponsor Recommendation Engine |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- AWS CLI configured
- Azure CLI configured
- Python 3.9+

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/MouhcineAGOUJIL/FanOps-Frontend
cd FanOps

# 2. Install Root Dependencies (if applicable)
npm install

# 3. Frontend Setup
cd frontend
npm install
npm run dev
```

The application will start at `http://localhost:5173`. Make sure to configure your `.env` file with the correct API Gateway endpoints for M1, M2, M3, and M4.

---

## 👥 Team

Built with ❤️ by the **Cloud Computing S5 Team**.

| Member | Role | Focus Area |
|:---|:---|:---|
| **Mouhcine AGOUJIL** | Frontend Lead & Integration | UI/UX, AWS Amplify, State Management |
| **El Mehdi OUGHEGI** | M1 Architect (Azure) | Azure Functions, AI Model, Flow Logic |
| **Teammate 3** | M2 Security Lead (AWS) | AWS Lambda, DynamoDB, Cryptography |
| **Mohamed LAMZIOUAQ** | M4 Data Eng (GCP) | GCP Cloud Functions, Data pipelines |

---

<div align="center">

**[⬆ Back to Top](#-can-2025-fanops-platform)**

</div>
