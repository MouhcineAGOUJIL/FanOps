# AWS Visualization Guide

This guide explains how to navigate the AWS Console to visually demonstrate the **FaaS** (Lambda) and **PaaS** (S3) components of the M3 microservice.

## 1. Visualizing PaaS (Amazon S3)
*Show where the "Brain" (ML Model) is stored.*

1.  **Log in** to the AWS Console.
2.  Search for **S3** in the top search bar and click it.
3.  In the buckets list, find and click on **`m3-forecast-models-can2025`**.
4.  **What to show**:
    - You will see the `model.joblib` file.
    - Explain that this is the **PaaS** layer: managed storage where we simply upload our artifact, and AWS handles availability and durability.

## 2. Visualizing FaaS (AWS Lambda)
*Show the "Compute" logic.*

1.  Search for **Lambda** in the top search bar and click it.
2.  Click on **Functions** in the left sidebar.
3.  Click on **`m3-forecast-aws-dev-predictAttendance`**.
4.  **Code Tab**:
    - Scroll down to the **Code source** section.
    - Double-click `lambda_function.py` to show the Python code.
    - Explain that this is **FaaS**: we only provided the code, and AWS runs it on demand.
5.  **Configuration Tab**:
    - Click the **Configuration** tab.
    - Click **Environment variables** to show `MODEL_BUCKET` pointing to our S3 bucket.
    - Click **Layers** (bottom of the Code tab or in the Designer overview) to show the custom layer containing our ML libraries (`pandas`, `scikit-learn`).

## 3. Visualizing the Trigger (API Gateway)
*Show how the outside world connects.*

1.  In the Lambda function overview (top of the page), look at the **Function overview** diagram.
2.  Click on **API Gateway**.
3.  Expand the details to show the **API Endpoint** URL.
4.  Explain that this URL is the entry point that triggers the FaaS function.
