# M3 - Forecast Match Attendance (AWS)

This microservice predicts the attendance for CAN 2025 matches in Morocco using a Machine Learning model deployed on AWS.

## Architecture

- **FaaS**: AWS Lambda (Python 3.9)
- **PaaS**: Amazon S3 (Model Storage)
- **Trigger**: API Gateway (HTTP POST)

## Directory Structure

- `lambda_function.py`: The Lambda handler code.
- `train_model.py`: Script to generate data and train the ML model.
- `serverless.yml`: Infrastructure as Code configuration.
- `clean_layer.py`: Utility to optimize dependency size.
- `verify_api.py`: Script to test the deployed API.
- `ARCHITECTURE_DETAILS.md`: Detailed technical documentation.
- `AWS_VISUALIZATION_GUIDE.md`: Guide for presenting the project on AWS Console.

## Setup & Deployment

1.  **Install Dependencies**:
    ```bash
    npm install -g serverless
    npm install
    ```

2.  **Train Model**:
    ```bash
    python train_model.py
    ```
    This creates `model.joblib`.

3.  **Deploy**:
    ```bash
    # 1. Create S3 bucket (if not exists)
    aws s3 mb s3://m3-forecast-models-can2025

    # 2. Upload Model
    aws s3 cp model.joblib s3://m3-forecast-models-can2025/model.joblib

    # 3. Build Layer & Deploy
    # (Ensure you have python 3.9 installed or use Docker)
    python -m pip install --platform manylinux2014_x86_64 --target layer/python --implementation cp --python-version 3.9 --only-binary=:all: --upgrade pandas scikit-learn scipy
    python clean_layer.py
    serverless deploy
    ```

## Usage

Send a POST request to the API endpoint:

```bash
curl -X POST https://sfg82p344i.execute-api.us-east-1.amazonaws.com/dev/predict \
  -H "Content-Type: application/json" \
  -d '{
    "team_a": "Morocco",
    "team_b": "Senegal",
    "stadium": "Stade Mohamed V (Casablanca)",
    "time": "Evening",
    "stage": "Final"
  }'
```
