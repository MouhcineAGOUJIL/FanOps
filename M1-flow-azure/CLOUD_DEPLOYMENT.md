# ☁️ M1 Cloud Deployment Guide

Complete step-by-step guide to deploy M1 to Azure and AWS using web portals.

---

## 📋 Prerequisites

- ✅ Azure account with active subscription
- ✅ AWS account (optional - for SageMaker)
- ✅ GitHub account
- ✅ Local M1 code tested and working
- ✅ OpenAI API key

---

## 🔵 PART 1: Azure Deployment

### Step 1: Create Resource Group

1. Go to [Azure Portal](https://portal.azure.com)
2. Search for "Resource groups" in the top search bar
3. Click **"+ Create"**
4. Fill in:
   - **Subscription**: Your Azure subscription
   - **Resource group**: `rg-fanops-m1`
   - **Region**: `West Europe` (or closest to you)
5. Click **"Review + create"** → **"Create"**

---

### Step 2: Create Storage Account

1. Search for "Storage accounts" in Azure Portal
2. Click **"+ Create"**
3. **Basics tab**:
   - **Resource group**: `rg-fanops-m1`
   - **Storage account name**: `stm1fanops` (must be globally unique, add numbers if taken)
   - **Region**: Same as resource group
   - **Performance**: Standard
   - **Redundancy**: LRS (Locally-redundant storage)
4. Click **"Review + create"** → **"Create"**
5. Wait for deployment (1-2 minutes)

**Configure Storage:**

6. Go to your storage account → **"Tables"** (left menu)
7. Click **"+ Table"** and create these 4 tables:
   - `gatestatus`
   - `aidecisions`
   - `agentmemory`
   - `investigationlogs`

8. Go to **"Queues"** (left menu)
9. Click **"+ Queue"** and create:
   - `gates-inflow`
   - `gates-control`

10. Go to **"Containers"** (left menu)
11. Click **"+ Container"** and create:
    - `ml-models` (Private access)
    - `decision-traces` (Private access)

12. Go to **"Access keys"** (left menu)
13. Click **"Show keys"**
14. Copy **"Connection string"** from key1 (save this - you'll need it!)

---

### Step 3: Upload ML Model to Blob Storage

1. In your storage account, go to **"Containers"** → `ml-models`
2. Click **"Upload"**
3. Click **"Browse for files"**
4. Navigate to: `M1-flow-azure\shared\ml\models\wait_time_model.onnx`
5. Click **"Upload"**
6. Repeat for `model_metadata.json`

---

### Step 4: Create Function App

1. Search for "Function App" in Azure Portal
2. Click **"+ Create"**
3. **Basics tab**:
   - **Resource Group**: `rg-fanops-m1`
   - **Function App name**: `func-m1-fanops-[yourname]` (must be globally unique)
   - **Publish**: Code
   - **Runtime stack**: Python
   - **Version**: 3.11 (or 3.9+)
   - **Region**: Same as resource group
   - **Operating System**: Linux
   - **Plan type**: Consumption (Serverless)

4. **Storage tab**:
   - **Storage account**: Select `stm1fanops` (the one you created)

5. **Networking tab**:
   - Keep defaults (Enable public access)

6. Click **"Review + create"** → **"Create"**
7. Wait for deployment (2-3 minutes)

---

### Step 5: Configure Function App Settings

1. Go to your Function App → **"Configuration"** (left menu under Settings)
2. Click **"+ New application setting"** for each of these:

**Storage Settings:**
```
Name: AzureWebJobsStorage
Value: [Paste connection string from Step 2.13]
```

```
Name: TABLE_NAME_GATES
Value: gatestatus
```

```
Name: TABLE_NAME_AI_DECISIONS
Value: aidecisions
```

```
Name: TABLE_NAME_AGENT_MEMORY
Value: agentmemory
```

```
Name: TABLE_NAME_INVESTIGATION_LOGS
Value: investigationlogs
```

```
Name: QUEUE_NAME_INFLOW
Value: gates-inflow
```

```
Name: QUEUE_NAME_CONTROL
Value: gates-control
```

```
Name: BLOB_CONTAINER_MODELS
Value: ml-models
```

```
Name: BLOB_CONTAINER_DECISION_TRACES
Value: decision-traces
```

**AI Settings:**
```
Name: OPENAI_API_KEY
Value: [Your OpenAI API key]
```

```
Name: OPENAI_MODEL
Value: gpt-3.5-turbo
```

```
Name: OPENAI_MAX_TOKENS
Value: 1500
```

**ML Settings:**
```
Name: MODEL_FILENAME
Value: wait_time_model.onnx
```

3. Click **"Save"** at the top
4. Click **"Continue"** when prompted (this will restart the app)

---

### Step 6: Deploy Code via GitHub

**Option A: GitHub Actions (Recommended)**

1. In your Function App, go to **"Deployment Center"** (left menu)
2. **Source**: Select **"GitHub"**
3. Click **"Authorize"** to connect your GitHub account
4. Select:
   - **Organization**: Your GitHub username
   - **Repository**: `FanOps` (or your repo name)
   - **Branch**: `main`
5. **Build provider**: Keep "GitHub Actions"
6. Click **"Save"**

This will:
- Create a GitHub Actions workflow file
- Automatically deploy on every push to main branch

7. Push your code to GitHub:
```bash
cd "C:\Users\El Mehdi OUGHEGI\Documents\ESI\3A-ICSD\S5\Cloud Computing Project\FanOps"
git add .
git commit -m "Deploy M1 to Azure"
git push origin main
```

8. Go to your GitHub repo → **"Actions"** tab
9. Watch the deployment progress (takes 3-5 minutes)

**Option B: Manual Deploy (If GitHub Actions fails)**

1. In your Function App, go to **"Deployment Center"**
2. Click **"Local Git"**
3. Click **"Save"**
4. Go to **"Deployment credentials"**
5. Set username and password
6. In your local terminal:

```bash
cd M1-flow-azure
git init
git remote add azure [Git URL from Deployment Center]
git add .
git commit -m "Initial deployment"
git push azure main
```

---

### Step 7: Verify Azure Deployment

1. Go to your Function App → **"Functions"** (left menu)
2. You should see all 6 functions:
   - `flow_ingest`
   - `flow_status`
   - `process_gate_queue`
   - `ai_insights`
   - `agent_orchestrator`
   - `get_investigation`

3. Click on `flow_ingest` → **"Get Function URL"**
4. Copy the URL (should be like: `https://func-m1-fanops-[yourname].azurewebsites.net/api/flow/ingest`)

**Test the deployed API:**

```bash
# Test ingest
curl -X POST "https://func-m1-fanops-[yourname].azurewebsites.net/api/flow/ingest?code=[your-function-key]" ^
  -H "Content-Type: application/json" ^
  -d "{\"stadiumId\":\"AGADIR\",\"gateId\":\"G1\",\"ts\":\"2025-07-14T17:00:00Z\",\"perMinuteCount\":30,\"avgProcessingTime\":4.0,\"queueLength\":50}"

# Test status
curl "https://func-m1-fanops-[yourname].azurewebsites.net/api/flow/status?stadiumId=AGADIR&code=[your-function-key]"

# Test AI insights
curl "https://func-m1-fanops-[yourname].azurewebsites.net/api/flow/ai-insights?stadium_id=AGADIR&code=[your-function-key]"
```

**Expected Results:**
- ✅ Status 202 for ingest
- ✅ Status 200 for status with gate data
- ✅ Status 200 for AI insights

5. Check **"Log stream"** (left menu) to see live logs
6. Check **"Monitor"** → **"Logs"** for invocation history

---

## 🟠 PART 2: AWS Deployment (Optional - for SageMaker)

This is **optional** if you want real anomaly detection instead of mocked results.

### Step 1: Create IAM User

1. Go to [AWS Console](https://console.aws.amazon.com)
2. Search for **"IAM"**
3. Click **"Users"** (left menu) → **"Create user"**
4. **User name**: `m1-sagemaker-user`
5. **Permissions**: Attach policy directly → Search and select:
   - `AmazonSageMakerFullAccess`
6. Click **"Create user"**
7. Click on the user → **"Security credentials"** tab
8. Click **"Create access key"**
9. Select **"Application running on an AWS compute service"**
10. Copy **Access Key ID** and **Secret Access Key** (save these!)

### Step 2: Create SageMaker Endpoint (Optional)

**Note**: This costs ~$0.05/hour when running. Skip if using mock mode.

1. Search for **"SageMaker"**
2. Click **"Notebook instances"** → **"Create notebook instance"**
3. Name: `m1-anomaly-detector`
4. Instance type: `ml.t2.medium`
5. Click **"Create notebook instance"**
6. Wait for status "InService" (3-5 minutes)
7. Click **"Open JupyterLab"**
8. Create new notebook → Python 3
9. Run this code to create endpoint:

```python
import boto3
import sagemaker
from sagemaker import RandomCutForest

# Setup
session = sagemaker.Session()
bucket = session.default_bucket()
prefix = 'm1-anomaly'

# Create RCF model
rcf = RandomCutForest(
    role=sagemaker.get_execution_role(),
    instance_count=1,
    instance_type='ml.m5.large',
    data_location=f's3://{bucket}/{prefix}/',
    output_path=f's3://{bucket}/{prefix}/output',
    num_samples_per_tree=256,
    num_trees=50
)

# Deploy endpoint (this will take 5-10 minutes)
rcf_predictor = rcf.deploy(
    initial_instance_count=1,
    instance_type='ml.t2.medium',
    endpoint_name='m1-anomaly-endpoint'
)

print("Endpoint created: m1-anomaly-endpoint")
```

10. Copy the endpoint name: `m1-anomaly-endpoint`

### Step 3: Add AWS Credentials to Azure

1. Go back to Azure Function App → **"Configuration"**
2. Add these settings:

```
Name: AWS_ACCESS_KEY_ID
Value: [Your AWS Access Key from Step 1.10]
```

```
Name: AWS_SECRET_ACCESS_KEY
Value: [Your AWS Secret Key from Step 1.10]
```

```
Name: AWS_REGION
Value: us-east-1
```

```
Name: SAGEMAKER_ENDPOINT_NAME
Value: m1-anomaly-endpoint
```

3. Click **"Save"**

**To use mock mode (free):** Don't add these settings or leave SAGEMAKER_ENDPOINT_NAME empty.

---

## ✅ PART 3: Complete Verification Checklist

### Test 1: Basic Functionality

```bash
# Set your function URL
$FUNC_URL="https://func-m1-fanops-[yourname].azurewebsites.net"
$FUNC_KEY="[your-function-key]"

# 1. Ingest data
curl -X POST "$FUNC_URL/api/flow/ingest?code=$FUNC_KEY" `
  -H "Content-Type: application/json" `
  -d '{"stadiumId":"AGADIR","gateId":"G1","ts":"2025-07-14T17:00:00Z","perMinuteCount":30,"avgProcessingTime":4.0,"queueLength":50}'

# Expected: {"status": "accepted", "gateId": "G1"}

# 2. Get status
curl "$FUNC_URL/api/flow/status?stadiumId=AGADIR&code=$FUNC_KEY"

# Expected: JSON with gates array, ML predictions, anomaly scores
```

### Test 2: AI Agent Verification

```bash
# Wait 2 minutes, then check AI insights
curl "$FUNC_URL/api/flow/ai-insights?stadium_id=AGADIR&code=$FUNC_KEY"

# Expected: Agent decisions with reasoning, confidence, cost
```

### Test 3: RCA Verification

```bash
# Send anomaly data
curl -X POST "$FUNC_URL/api/flow/ingest?code=$FUNC_KEY" `
  -H "Content-Type: application/json" `
  -d '{"stadiumId":"AGADIR","gateId":"G2","ts":"2025-07-14T17:35:00Z","perMinuteCount":80,"avgProcessingTime":5.0,"queueLength":200}'

# Check status (should trigger RCA)
curl "$FUNC_URL/api/flow/status?stadiumId=AGADIR&code=$FUNC_KEY"

# Expected: G2 with "investigation_id", "root_cause"

# Query investigation
curl "$FUNC_URL/api/flow/investigation/[investigation_id]?code=$FUNC_KEY"

# Expected: Full RCA results with diagnosis, confidence, mitigation plan
```

### Test 4: Check Azure Portal

1. **Storage Account** → Tables:
   - `gatestatus` should have entries
   - `aidecisions` should have agent decisions
   - `investigationlogs` should have RCA results

2. **Function App** → Monitor:
   - Check invocation success rates (should be 100%)
   - Check average execution time (<5s)

3. **Function App** → Log stream:
   - Should see agent running every 2 minutes
   - Should see RCA investigations

### Test 5: Performance Test

Use your deployed URL in Postman or similar:
- Send 100 requests to `/api/flow/ingest`
- Verify: 95% success rate, <500ms P95 latency

---

## 🔐 Security Best Practices

### Enable Authentication (Production)

1. Function App → **"Authentication"** (left menu)
2. Click **"Add identity provider"**
3. Select **"Microsoft"**
4. Click **"Add"**

Now APIs require Azure AD authentication.

### Use Key Vault for Secrets

1. Create Key Vault:
   - Search "Key Vaults" → Create
   - Name: `kv-m1-fanops`
   - Resource group: `rg-fanops-m1`

2. Add secrets:
   - `OpenAIApiKey`
   - `AwsAccessKeyId`
   - `AwsSecretAccessKey`

3. Enable Function App Managed Identity:
   - Function App → **"Identity"**
   - Turn on **"System assigned"** → Save

4. Grant access:
   - Key Vault → **"Access policies"**
   - Add policy for Function App identity
   - Permissions: Get secrets

5. Update Function App configuration:
```
OPENAI_API_KEY = @Microsoft.KeyVault(SecretUri=https://kv-m1-fanops.vault.azure.net/secrets/OpenAIApiKey/)
```

---

## 📊 Monitoring Dashboard

### Setup Application Insights

1. Function App → **"Application Insights"** (left menu)
2. Click **"Turn on Application Insights"**
3. Click **"Create new resource"**
4. Name: `appi-m1-fanops`
5. Click **"Apply"**

### View Metrics

1. Application Insights → **"Metrics"**
2. Add charts for:
   - Function execution count
   - Function execution time
   - Failed requests
   - OpenAI API call costs

3. Application Insights → **"Logs"**
4. Query agent decisions:
```kusto
traces
| where message contains "Agent decision"
| project timestamp, message
| order by timestamp desc
```

---

## 💰 Cost Estimation

**Azure (Monthly):**
- Function App (Consumption): $0-5
- Storage Account: $1-2
- Application Insights: $0-2
**Total Azure: ~$5-10/month**

**AWS (If using SageMaker):**
- SageMaker endpoint: $36/month (ml.t2.medium)
**Total AWS: ~$36/month (or $0 with mock mode)**

**OpenAI:**
- Agent: $0.004 × 720 decisions/day = $2.88/day = ~$90/month
- RCA: $0.001 × 50 investigations/day = $0.05/day = ~$1.5/month
**Total OpenAI: ~$100/month**

**Grand Total: ~$115-150/month** (with real SageMaker)
**Budget Mode: ~$15-20/month** (mock SageMaker, limited OpenAI)

---

## 🎓 Clean Up (After Demo)

To avoid charges:

1. Delete Resource Group:
   - Azure Portal → Resource groups → `rg-fanops-m1`
   - Click **"Delete resource group"**
   - Type name to confirm

2. Delete AWS:
   - SageMaker → Endpoints → Delete `m1-anomaly-endpoint`
   - IAM → Users → Delete `m1-sagemaker-user`

---

## 🐛 Troubleshooting

**Functions not showing up?**
- Check deployment logs in GitHub Actions
- Verify `requirements.txt` is in root folder
- Check runtime is set to Python 3.9+

**OpenAI errors?**
- Verify API key in Configuration
- Check quota limits in OpenAI dashboard
- Review logs for specific errors

**Storage connection failed?**
- Verify connection string is correct
- Check firewall rules (should allow Azure services)
- Ensure tables/queues are created

**High costs?**
- Use mock mode for AWS
- Limit OpenAI calls or use GPT-3.5-Turbo
- Set budget alerts in Azure Cost Management

---

## ✅ Success Criteria

Your deployment is successful when:
- ✅ All 6 functions are visible in Azure
- ✅ Ingest returns 202 status
- ✅ Status returns ML predictions
- ✅ AI insights returns agent decisions
- ✅ RCA triggers on anomalies
- ✅ Logs show agent running every 2 minutes
- ✅ No errors in Application Insights

**Congratulations! M1 is now deployed to production! 🎉**
