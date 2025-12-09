# 🤖 M3 - Forecast Match Attendance (AWS)

**AWS Serverless** | **Python 3.9** | **Scikit-Learn** | **Amazon S3**

> **Microservice for predictive analysis of match attendance using Machine Learning on AWS.**

[![AWS](https://img.shields.io/badge/AWS-Lambda-232F3E?style=for-the-badge&logo=aws-lambda&logoColor=white)](https://aws.amazon.com/lambda/)
[![Python](https://img.shields.io/badge/Python-3.9-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Serverless](https://img.shields.io/badge/Serverless-Framework-FD5750?style=for-the-badge&logo=serverless&logoColor=white)](https://www.serverless.com/)
[![ML](https://img.shields.io/badge/ML-Scikit--Learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#-architecture)
- [Machine Learning Model](#-machine-learning-model)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Project Structure](#-project-structure)

---

## 🎯 Overview

**M3** is the attendance forecasting engine for the CAN 2025 FanOps platform. It allows stadium operators and security teams to anticipate crowd levels days or weeks in advance.

**Key Features:**
- ✅ **Predictive Modeling**: Uses Random Forest Regression to estimate attendance.
- ✅ **Context Aware**: Considers teams, stadium capacity, time of day, and tournament stage.
- ✅ **Serverless Inference**: Zero-idle cost using AWS Lambda.
- ✅ **Decoupled Model**: Model artifacts stored in S3 for independent lifecycle management.

---

## 🏗️ Architecture

The service leverages a **FaaS (Function-as-a-Service)** architecture on AWS, using Lambda Layers to manage heavy ML dependencies.

```mermaid
graph LR
    User[📱 Client / Frontend] -->|HTTPS POST| APIG[API Gateway]
    APIG -->|Trigger| Lambda[AWS Lambda<br/>(Python 3.9)]
    
    subgraph "AWS Cloud"
        Lambda -->|Load Model| S3[(Amazon S3<br/>Model Store)]
        Lambda -->|Inference| Layer[Lambda Layer<br/>(Scikit-Learn/Pandas)]
    end
    
    style Lambda fill:#FF9900,color:white
    style S3 fill:#3B48CC,color:white
    style APIG fill:#8C4FFF,color:white
    style Layer fill:#E7157B,color:white
```

### Components

| Component | AWS Service | Purpose |
|-----------|-------------|---------|
| **Compute** | **AWS Lambda** | Runs the Python inference code on-demand. |
| **API** | **API Gateway** | Exposes the function as a secure REST endpoint. |
| **Storage** | **Amazon S3** | Stores the serialized model (`model.joblib`). |
| **Runtime** | **Lambda Layers** | Hosts heavy libraries (`pandas`, `scikit-learn`) to keep function size small. |

---

## 🧠 Machine Learning Model

### Algorithm
- **Type**: Random Forest Regressor
- **Framework**: Scikit-Learn

### Features (inputs)
The model is trained on historical and synthetic data using the following features:
1.  **Team A / Team B**: The competing nations (e.g., "Morocco", "Senegal").
2.  **Stadium**: Venue impact (capacity, location).
3.  **Time**: "Afternoon", "Evening", "Night".
4.  **Stage**: "Group Stage", "Quarter-Final", "Final".

### Training Pipeline
```python
# Simplified pipeline structure
pipeline = Pipeline([
    ('preprocessor', ColumnTransformer([...])), # One-Hot Encoding
    ('regressor', RandomForestRegressor(...))   # Inference
])
```

---

## 🚀 Deployment

### Prerequisites
- AWS CLI configured
- Node.js & Serverless Framework (`npm i -g serverless`)
- Python 3.9 & pip

### Step-by-Step Guide

#### 1. Train the Model
Generate the model artifact locally.
```bash
python train_model.py
# Output: model.joblib
```

#### 2. Prepare AWS Resources
Create the S3 bucket and upload the model.
```bash
# Create bucket (if not exists)
aws s3 mb s3://m3-forecast-models-can2025

# Upload model
aws s3 cp model.joblib s3://m3-forecast-models-can2025/model.joblib
```

#### 3. Build & Deploy Lambda
We use a Dockerized approach or a manual pip install for the Lambda Layer to ensure Linux binary compatibility.
```bash
# Install dependencies into layer/ directory
python -m pip install \
   --platform manylinux2014_x86_64 \
   --target layer/python \
   --implementation cp \
   --python-version 3.9 \
   --only-binary=:all: \
   --upgrade pandas scikit-learn scipy

# Clean unnecessary files to reduce size
python clean_layer.py

# Deploy with Serverless
serverless deploy
```

---

## 📡 API Documentation

### Forecast Attendance

**Endpoint**: `POST /predict`

**URL**: `https://sfg82p344i.execute-api.us-east-1.amazonaws.com/dev/predict`

#### Request Body
```json
{
  "team_a": "Morocco",
  "team_b": "Senegal",
  "stadium": "Stade Mohamed V (Casablanca)",
  "time": "Evening",
  "stage": "Final"
}
```

#### Response (200 OK)
```json
{
  "predicted_attendance": 45120,
  "confidence_interval": [42000, 48000],
  "stadium_capacity": 67000,
  "fill_rate": 0.67
}
```

---

## 🧪 Testing

### 1. Verify API
Use the provided script to test the live endpoint.
```bash
python verify_api.py
```

### 2. Manual Curl Test
```bash
curl -X POST https://sfg82p344i.execute-api.us-east-1.amazonaws.com/dev/predict \
  -H "Content-Type: application/json" \
  -d '{
    "team_a": "Morocco",
    "team_b": "France",
    "stadium": "Grand Stade de Marrakech",
    "time": "Night",
    "stage": "Semi-Final"
  }'
```

---

## 📂 Project Structure

```bash
M3-forecast-aws/
├── 📄 lambda_function.py    # Main Lambda Handler
├── 📄 train_model.py        # ML Training Script
├── 📄 serverless.yml        # Infrastructure as Code
├── 📂 layer/                # Python Dependencies Layer
├── 📄 clean_layer.py        # Layer Optimization Tool
├── 📄 verify_api.py         # Testing Script
└── 📄 README.md             # This Documentation
```

---

## 👥 Team & Credits

- **Cloud Provider**: AWS
- **Tech Stack**: Python, Scikit-Learn, Serverless
- **Maintainer**: Cloud Computing Team (Can 2025)

---

<div align="center">
  <sub>Built for CAN 2025 FanOps Platform</sub>
</div>
