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

A state-of-the-art **Multi-Cloud** ecosystem designed to optimize the fan experience for over 50,000 attendees in real-time. Combining **AWS Serverless Security**, **Azure AI Flow Control**, and **GCP Predictive Analytics** into a unified, seamless platform.

</div>

---

## 🏗️ Enterprise Architecture

This project is built on a sophisticated **Hybrid Multi-Cloud Strategy**, leveraging best-in-class services from **AWS**, **Azure**, and **Google Cloud Platform** to ensure high availability, security, and scalability.

<div align="center">
  <img src="Assets/FanOps.png" alt="FanOps Cloud Architecture" width="100%" style="border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);"/>
</div>

### 🔍 Architecture Highlights

The architecture is divided into four specialized microservices (M1-M4) orchestrated by a central frontend:

*   **Front Layer**: Hosted on **AWS Amplify**, providing a global CDN for the React/Vite application.
*   **M2 - Core Security (AWS)**: Serves as the backbone for auth and ticket validation using **Lambda**, **DynamoDB**, and **Cognito** principles.
*   **M1 - Operational Intelligence (Azure)**: Handles real-time crowd flow analysis using **Azure Functions** and **ONNX** models.
*   **M3 - Forecasting (AWS)**: Predicts future attendance patterns using **Scikit-Learn** on AWS Lambda.
*   **M4 - Engagement (GCP)**: Delivers personalized sponsor content via **Google Cloud Functions**.
*   **Unified SOC**: All logs are securely shipped to **Microsoft Sentinel** for a single-pane-of-glass security overview.

---

## 🧩 Microservices Breakdown

### 🎨 Frontend Application (The Hub)
*   **Tech Stack**: React 18, Vite, Tailwind CSS, Shadcn UI, Framer Motion.
*   **State Management**: Zustand for efficient global state.
*   **Deployment**: Fully automated CI/CD pipeline via AWS Amplify.

### 🔐 M2: Secure-Gates Service (AWS)
*Secure, high-performance ticket validation system.*
-   **Compute**: Serverless Node.js 20.x on AWS Lambda.
-   **Data Store**:
    -   `SoldTicketsTable`: Core ledger for valid tickets.
    -   `UsedJtiTable`: Replay attack prevention via JWT ID tracking.
    -   `AuditTable`: Immutable security log stream.
-   **Security**: AES-256 Encryption via **KMS** and secret management with **SSM Parameter Store**.
-   **Defense**: Dedicated **EC2** instance running ZAP scanners for proactive threat detection.

### 🧠 M1: Flow Controller (Azure)
*Intelligent crowd management core.*
-   **Logic**: Event-driven Python functions on Azure.
-   **AI Engine**: **ONNX Runtime** executing optimized LightGBM models for queue latency prediction.
-   **Storage**: Low-latency state handling with Azure Table Storage.

### 🔮 M3: Forecast Service (AWS)
*Predictive modeling for attendance optimized for cold-starts.*
-   **Compute**: Optimized Python 3.9 Lambda.
-   **ML**: Scikit-Learn custom Lambda Layers.
-   **Artifacts**: S3-backed model versioning (`m3-forecast-models-can2025`).

### 📢 M4: Sponsor AI (GCP)
*Context-aware targeted advertising engine.*
-   **Logic**: Google Cloud Functions Gen 2 (Python 3.10).
-   **Assets**: Google Cloud Storage for dynamic content delivery.

---

## 🛠️ Technology Stack Summary

| Cloud Provider | Key Services | Impact |
|:---:|:---|:---|
| <img src="https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg" width="50"/> | **Amplify, Lambda, DynamoDB, SQS, KMS** | Provides the reliable, secure, and scalable backbone for the application and critical data. |
| <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Microsoft_Azure.svg" width="50"/> | **Azure Functions, Storage, Sentinel** | Powers the intelligent decision-making and unified security monitoring. |
| <img src="https://upload.wikimedia.org/wikipedia/commons/5/51/Google_Cloud_logo.svg" width="50"/> | **Cloud Functions, Cloud Storage** | Delivers specialized, high-performance content delivery for sponsor engagement. |

---

## 🚀 Quick Start

### Prerequisites
-   **Node.js**: v18 or higher
-   **Python**: v3.9+
-   **Cloud CLIs**: AWS CLI, Azure CLI configured

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/MouhcineAGOUJIL/FanOps-Frontend
    cd FanOps
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # Enter frontend directory
    cd frontend
    npm install
    ```

3.  **Run Locally**
    ```bash
    npm run dev
    ```
    The app will launch at `http://localhost:5173`. Make sure your `.env` contains valid endpoints for the deployed cloud services.

---

## 👥 Team

Built with ❤️ by the **Cloud Computing S5 Team**.

| Member | Role | Focus Area |
|:---|:---|:---|
| **Mouhcine AGOUJIL** | Frontend Lead & Integration | UI/UX, AWS Amplify, State Management |
| **El Mehdi OUGHEGI** | M1 Architect (Azure) | Azure Functions, AI Model, Flow Logic |
| **Reda DKHISSI** | M2 Security Lead (AWS) | AWS Lambda, DynamoDB, Cryptography |
| **Mohamed LAMZIOUAQ** | M4 Data Eng (GCP) | GCP Cloud Functions, Data Pipelines |

---

<div align="center">

**[⬆ Back to Top](#-can-2025-fanops-platform)**

</div>
