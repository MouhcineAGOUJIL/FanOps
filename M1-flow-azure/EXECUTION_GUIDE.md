# M1 Execution Guide - Complete Walkthrough

## 📍 Part 1: Local Execution

### Prerequisites
```cmd
# Verify installations
python --version          # Should be 3.9+
func --version           # Azure Functions Core Tools 4.x
node --version           # For Azurite
```

### Step 1: Environment Setup
```cmd
cd M1-flow-azure
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

### Step 2: Generate ML Model
```cmd
# Generate 50,000 training samples
python scripts/generate_data.py

# Train model and export to ONNX (takes ~30 seconds)
python scripts/train_model.py

# Verify model exists
dir shared\ml\models\wait_time_model.onnx
```

### Step 3: Start Local Services

**Terminal 1 - Storage Emulator:**
```cmd
azurite --silent --inMemoryPersistence
```

**Terminal 2 - Azure Functions:**
```cmd
cd M1-flow-azure
.venv\Scripts\activate
func start
```

### Step 4: Run Tests

**Terminal 3 - Basic Test:**
```cmd
# Test 1: Ingest data
curl -X POST http://localhost:7071/api/flow/ingest ^
   -H "Content-Type: application/json" ^
   -d "{\"stadiumId\": \"AGADIR\", \"gateId\": \"G1\", \"ts\": \"2025-07-14T17:00:00Z\", \"perMinuteCount\": 30, \"avgProcessingTime\": 4.0, \"queueLength\": 50}"

# Test 2: Check status (should see G1 with wait time ~3.8min, green)
curl http://localhost:7071/api/flow/status?stadiumId=AGADIR

# Test 3: Send congested gate
curl -X POST http://localhost:7071/api/flow/ingest ^
   -H "Content-Type: application/json" ^
   -d "{\"stadiumId\": \"AGADIR\", \"gateId\": \"G2\", \"ts\": \"2025-07-14T17:30:00Z\", \"perMinuteCount\": 80, \"avgProcessingTime\": 5.0, \"queueLength\": 200}"

# Test 4: Check status again (should see both G1 and G2, with G2 yellow/anomaly)
curl http://localhost:7071/api/flow/status?stadiumId=AGADIR
```

### Step 5: Run Simulation (Optional)

**Terminal 4 - Crowd Simulation:**
```cmd
python simulation/api_wrapper.py

# In another terminal:
curl -X POST http://localhost:5000/simulate ^
   -H "Content-Type: application/json" ^
   -d "{\"duration\": 60}"
```

### Step 6: Load Testing (Optional)
```cmd
locust -f tests/locustfile.py
# Open http://localhost:8089
# Enter: 50 users, 1 spawn rate, click Start
```

---

## ☁️ Part 2: Azure Deployment

### Step 1: Azure Login
```cmd
az login
# Select your subscription when prompted
```

### Step 2: Create Resource Group
```cmd
az group create ^
  --name rg-can2025-fanops ^
  --location westeurope
```

### Step 3: Create Storage Account
```cmd
az storage account create ^
  --name stfanopsm1 ^
  --location westeurope ^
  --resource-group rg-can2025-fanops ^
  --sku Standard_LRS
```

### Step 4: Create Function App
```cmd
# Note: Change 'func-can2025-m1-mehdi' to something unique
az functionapp create ^
  --resource-group rg-can2025-fanops ^
  --consumption-plan-location westeurope ^
  --runtime python ^
  --runtime-version 3.9 ^
  --functions-version 4 ^
  --name func-can2025-m1-mehdi ^
  --os-type linux ^
  --storage-account stfanopsm1
```

### Step 5: Configure Environment Variables
```cmd
az functionapp config appsettings set ^
  --name func-can2025-m1-mehdi ^
  --resource-group rg-can2025-fanops ^
  --settings ^
    "TABLE_NAME_GATES=gatestatus" ^
    "QUEUE_NAME_INFLOW=gates-inflow" ^
    "QUEUE_NAME_CONTROL=gates-control" ^
    "BLOB_CONTAINER_MODELS=ml-models"
```

### Step 6: Deploy Code
```cmd
cd M1-flow-azure
func azure functionapp publish func-can2025-m1-mehdi
```

### Step 7: Upload ML Model to Blob Storage
```cmd
# Create container
az storage container create ^
  --name ml-models ^
  --account-name stfanopsm1

# Upload model
az storage blob upload ^
  --container-name ml-models ^
  --file shared\ml\models\wait_time_model.onnx ^
  --name wait_time_model.onnx ^
  --account-name stfanopsm1
```

### Step 8: Test Cloud Deployment
```cmd
# Get your function URL
az functionapp show ^
  --name func-can2025-m1-mehdi ^
  --resource-group rg-can2025-fanops ^
  --query defaultHostName --output tsv

# Test (replace YOUR-FUNCTION-URL)
curl -X POST https://YOUR-FUNCTION-URL/api/flow/ingest ^
   -H "Content-Type: application/json" ^
   -d "{\"stadiumId\": \"AGADIR\", \"gateId\": \"G1\", \"ts\": \"2025-07-14T17:00:00Z\", \"perMinuteCount\": 30, \"avgProcessingTime\": 4.0, \"queueLength\": 50}"

curl https://YOUR-FUNCTION-URL/api/flow/status?stadiumId=AGADIR
```

---

## 🔶 Part 3: AWS Setup (Optional - Anomaly Detection)

### Current State
- **AWS is MOCKED** by default to save costs
- The system works perfectly without real AWS
- Only set up if you want real SageMaker anomaly detection

### If You Want Real AWS:

#### Step 1: Create AWS Account & Install CLI
```cmd
# Install AWS CLI
# https://aws.amazon.com/cli/

aws configure
# Enter: Access Key, Secret Key, Region (us-east-1), Format (json)
```

#### Step 2: Create S3 Bucket for Data
```cmd
aws s3 mb s3://fanops-m1-training-data --region us-east-1
```

#### Step 3: Deploy SageMaker Endpoint (Expensive! ~$0.05/hour)
```python
# Note: This requires Python SDK and is complex
# See AWS SageMaker documentation for Random Cut Forest
# Endpoint name: rcf-anomaly-endpoint
```

#### Step 4: Configure Azure to Use AWS
```cmd
az functionapp config appsettings set ^
  --name func-can2025-m1-mehdi ^
  --resource-group rg-can2025-fanops ^
  --settings ^
    "AWS_ACCESS_KEY_ID=AKIA..." ^
    "AWS_SECRET_ACCESS_KEY=..." ^
    "AWS_REGION=us-east-1" ^
    "SAGEMAKER_ENDPOINT_NAME=rcf-anomaly-endpoint"
```

**⚠️ Note:** If these AWS variables are NOT set, the code automatically uses MOCK mode (free).

---

## 🧹 Cleanup (To Avoid Costs)

### Azure Cleanup
```cmd
# Delete everything (use with caution!)
az group delete --name rg-can2025-fanops --yes --no-wait
```

### AWS Cleanup
```cmd
# Delete S3 bucket
aws s3 rb s3://fanops-m1-training-data --force

# Delete SageMaker endpoint (via AWS Console)
```

---

## ✅ Verification Checklist

- [ ] Local: Model trained successfully (R² > 0.99)
- [ ] Local: Functions start without errors
- [ ] Local: Ingest returns `{"status": "accepted"}`
- [ ] Local: Status shows gates with ML predictions
- [ ] Local: Anomaly detection works (anomaly: true/false)
- [ ] Azure: Function app deployed successfully
- [ ] Azure: Model uploaded to blob storage
- [ ] Azure: Live endpoint responds to curl
- [ ] (Optional) AWS: SageMaker endpoint deployed
- [ ] (Optional) Load test passes (>100 req/sec)
