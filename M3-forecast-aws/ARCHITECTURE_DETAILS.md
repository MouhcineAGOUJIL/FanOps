# M3 - Match Attendance Forecast Microservice

## 1. Project Overview
This microservice (M3) is responsible for predicting match attendance for the CAN 2025 tournament in Morocco. It utilizes a Machine Learning model to forecast crowd numbers based on various match parameters.

## 2. Machine Learning Model

### Algorithm
- **Type**: Random Forest Regressor (`sklearn.ensemble.RandomForestRegressor`)
- **Reasoning**: Chosen for its ability to handle non-linear relationships and interactions between categorical features (teams, stadiums) without extensive feature engineering.

### Features (Input)
The model accepts the following inputs:
1.  **Team A** (Categorical): One of the competing teams (e.g., "Morocco", "Senegal").
2.  **Team B** (Categorical): The opposing team.
3.  **Stadium** (Categorical): The venue of the match (e.g., "Stade Mohamed V").
4.  **Time** (Categorical): Time of day ("Afternoon", "Evening", "Night").
5.  **Stage** (Categorical): Tournament stage ("Group Stage", "Final", etc.).

### Training Process (`train_model.py`)
1.  **Data Generation**: A mock dataset is generated with realistic biases (e.g., higher attendance for host nation Morocco, finals, and big teams).
2.  **Preprocessing**: Categorical features are one-hot encoded using `ColumnTransformer` and `OneHotEncoder`.
3.  **Pipeline**: A scikit-learn `Pipeline` combines preprocessing and the regressor.
4.  **Artifact**: The trained pipeline is serialized and saved as `model.joblib`.

## 3. Cloud Architecture (AWS)

The service is deployed on AWS using a serverless architecture, leveraging **FaaS** (Function as a Service) and **PaaS** (Platform as a Service) principles.

### Architecture Diagram
```mermaid
graph LR
    User[Client/User] -->|POST /predict| APIG[API Gateway]
    APIG -->|Trigger| Lambda[AWS Lambda (FaaS)]
    Lambda -->|Load Model| S3[Amazon S3 (PaaS)]
    
    subgraph "AWS Cloud"
        APIG
        Lambda
        S3
    end
```

### Components

#### 1. Compute (FaaS): AWS Lambda
- **Function Name**: `m3-forecast-aws-dev-predictAttendance`
- **Runtime**: Python 3.9
- **Role**:
    - Receives the prediction request from API Gateway.
    - Downloads the ML model from S3 (cached for subsequent warm invocations).
    - Processes the input and returns the predicted attendance.
- **Dependencies**:
    - `pandas`, `scikit-learn`, `scipy`: Packaged as a custom Lambda Layer to handle large binary sizes.

#### 2. Storage (PaaS): Amazon S3
- **Bucket Name**: `m3-forecast-models-can2025`
- **Object**: `model.joblib`
- **Role**: Acts as the model registry/storage. The Lambda function fetches the latest model from here, allowing model updates without redeploying the code.

#### 3. Interface: Amazon API Gateway
- **Endpoint**: `https://sfg82p344i.execute-api.us-east-1.amazonaws.com/dev/predict`
- **Method**: POST
- **Role**: Exposes the Lambda function as a RESTful API to the outside world.

## 4. Deployment Workflow
The project uses the **Serverless Framework** for Infrastructure as Code (IaC).

1.  **Build Layer**: `clean_layer.py` optimizes the Python dependencies to fit within AWS Lambda size limits.
2.  **Package**: Serverless Framework packages the function code and the custom layer.
3.  **Deploy**: CloudFormation stack is updated to provision the Lambda, API Gateway, and IAM roles.
