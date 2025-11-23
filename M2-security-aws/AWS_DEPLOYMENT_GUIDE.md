# 🚀 M2 Security AWS Deployment Guide

Complete step-by-step guide to deploy M2 (Secure Gates) to AWS.

---

## 📋 **What M2 Does**

M2 is a **serverless security microservice** for ticket verification and gate monitoring:
- **Ticket Verification**: JWT-based ticket validation
- **Gate Reporting**: Real-time gate status monitoring
- **Authentication**: Login/logout for admin and gatekeepers
- **Audit Trail**: DynamoDB streams with anomaly detection
- **Security Metrics**: Dashboard data for admin panel

---

## ☁️ **AWS Services Used**

| Service | Purpose | Cost Estimate |
|---------|---------|---------------|
| **Lambda** | Serverless functions (6 functions) | ~$0-2/month |
| **API Gateway** | REST API endpoints | ~$0-1/month |
| **DynamoDB** | 4 tables (tickets, audit, users, JTI) | ~$0-3/month |
| **SQS** | Security alerts queue | ~$0 |
| **CloudWatch** | Logs and monitoring | ~$0-1/month |
| **SSM Parameter Store** | JWT secret storage | Free |
| **IAM** | Roles and permissions | Free |
| **EC2** (optional) | Testing instance (t3.micro) | ~$7/month |

**Total: ~$5-15/month** (without EC2: ~$5-7/month)

---

## 📝 **Prerequisites**

✅ AWS Account with billing enabled  
✅ IAM user with Administrator access  
✅ AWS CLI installed and configured  
✅ Node.js 18+ installed  
✅ Serverless Framework installed globally  

---

## 🔧 **Part 1: AWS Console Setup**

### Step 1: Create IAM User for Deployment

1. **Go to IAM Console**: https://console.aws.amazon.com/iam/
2. **Click "Users"** → **"Create user"**
3. **User name**: `FanOpsM2Deployer`
4. **Click "Next"**
5. **Permissions**: Select **"Attach policies directly"**
   - Search and select: `AdministratorAccess`
   - *For production, use least-privilege policy (see security note below)*
6. **Click "Create user"**

### Step 2: Create Access Keys

1. Click on the created user: `FanOpsM2Deployer`
2. Go to **"Security credentials"** tab
3. Scroll to **"Access keys"**
4. Click **"Create access key"**
5. Select **"Command Line Interface (CLI)"**
6. Check the confirmation box
7. Click **"Create access key"**
8. **IMPORTANT**: Download the CSV or copy:
   - Access Key ID
   - Secret Access Key
   - **You won't see the secret again!**

### Step 3: Configure AWS CLI

```bash
# Configure AWS credentials
aws configure

# Enter your details:
AWS Access Key ID: [YOUR_ACCESS_KEY_ID]
AWS Secret Access Key: [YOUR_SECRET_ACCESS_KEY]
Default region name: eu-west-1
Default output format: json
```

Verify configuration:
```bash
aws sts get-caller-identity
```

Should show your user ARN.

---

## 🚀 **Part 2: Deploy M2 to AWS**

### Step 1: Install Dependencies

```bash
cd /home/red/Documents/S5/Cloud/FanOps/M2-security-aws
npm install
```

### Step 2: Install Serverless Framework Globally

```bash
npm install -g serverless
```

Verify:
```bash
serverless --version
```

### Step 3: Set Environment Variables

Create production environment file:

```bash
# Create .env.production
cat > .env.production << 'EOF'
JWT_SECRET=CAN2025-PROD-SECRET-KEY-CHANGE-THIS-$(openssl rand -hex 32)
EOF
```

### Step 4: Deploy to AWS (Dev Stage)

```bash
# Deploy to dev stage
serverless deploy --stage dev

# OR with verbose output
serverless deploy --stage dev --verbose
```

**Deployment takes 3-5 minutes**. You'll see:

```
Deploying can2025-secure-gates to stage dev (eu-west-1)

✔ Service deployed to stack can2025-secure-gates-dev (152s)

endpoints:
  POST - https://XXXXX.execute-api.eu-west-1.amazonaws.com/dev/security/verifyTicket
  POST - https://XXXXX.execute-api.eu-west-1.amazonaws.com/dev/security/reportGate
  POST - https://XXXXX.execute-api.eu-west-1.amazonaws.com/dev/auth/login
  POST - https://XXXXX.execute-api.eu-west-1.amazonaws.com/dev/auth/logout
  GET  - https://XXXXX.execute-api.eu-west-1.amazonaws.com/dev/security/metrics

functions:
  verifyTicket: can2025-secure-gates-dev-verifyTicket
  reportGate: can2025-secure-gates-dev-reportGate
  login: can2025-secure-gates-dev-login
  logout: can2025-secure-gates-dev-logout
  logAnalyzer: can2025-secure-gates-dev-logAnalyzer
  rotateKey: can2025-secure-gates-dev-rotateKey
  getSecurityMetrics: can2025-secure-gates-dev-getSecurityMetrics
```

**SAVE THIS OUTPUT!** Copy the API Gateway URL.

---

## 📊 **Part 3: Verify Deployment in AWS Console**

### Check Lambda Functions

1. Go to: https://console.aws.amazon.com/lambda/
2. Filter by name: `can2025-secure-gates-dev`
3. You should see 7 functions:
   - ✅ verifyTicket
   - ✅ reportGate
   - ✅ login
   - ✅ logout
   - ✅ logAnalyzer
   - ✅ rotateKey
   - ✅ getSecurityMetrics

### Check DynamoDB Tables

1. Go to: https://console.aws.amazon.com/dynamodb/
2. Click **"Tables"**
3. You should see 4 tables:
   - ✅ can2025-secure-gates-used-jti-dev
   - ✅ can2025-secure-gates-audit-dev
   - ✅ can2025-secure-gates-sold-tickets-dev
   - ✅ can2025-secure-gates-users-dev

### Check API Gateway

1. Go to: https://console.aws.amazon.com/apigateway/
2. Find: `dev-can2025-secure-gates`
3. Click on it → **"Stages"** → **"dev"**
4. You'll see your API endpoint URL

### Check SQS Queue

1. Go to: https://console.aws.amazon.com/sqs/
2. Find: `can2025-secure-gates-dev-security-alerts`
3. Should be created and ready

---

## 🗄️ **Part 4: Seed Database with Test Data**

### Option 1: Use Seeding Script

```bash
cd /home/red/Documents/S5/Cloud/FanOps/M2-security-aws

# Update script to use AWS tables
export AWS_REGION=eu-west-1

# Seed users table
node scripts/seedUsers.js

# Seed sold tickets
node scripts/seedSoldTickets.js
```

### Option 2: Manual DynamoDB Insert (AWS Console)

1. Go to DynamoDB Console
2. Select `can2025-secure-gates-users-dev`
3. Click **"Explore table items"**
4. Click **"Create item"**
5. Add admin user:

```json
{
  "userId": "admin",
  "password": "$2b$10$...", // Use bcrypt hash
  "role": "admin"
}
```

---

## 🧪 **Part 5: Test Deployed API**

### Get Your API Base URL

From deployment output, find your URL like:
```
https://abc123xyz.execute-api.eu-west-1.amazonaws.com/dev
```

### Test 1: Health Check (Get Metrics)

```bash
export API_URL="https://YOUR-API-ID.execute-api.eu-west-1.amazonaws.com/dev"

curl -X GET "$API_URL/security/metrics"
```

Expected: `200 OK` with metrics JSON

### Test 2: Login

```bash
curl -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

Expected: JWT token returned

### Test 3: Verify Ticket

```bash
# First, create a test ticket in sold-tickets table
# Then verify it:

curl -X POST "$API_URL/security/verifyTicket" \
  -H "Content-Type: application/json" \
  -d '{
    "ticketId": "TKT-001",
    "gateId": "G1",
    "gatekeeperId": "gk1"
  }'
```

Expected: Verification result

---

## 🔗 **Part 6: Update Frontend with Production URL**

Update frontend to use deployed API:

```bash
cd /home/red/Documents/S5/Cloud/FanOps/frontend/src/services

# Update authService.js
# Change API_URL to your deployed endpoint
```

Example `authService.js`:
```javascript
const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://YOUR-API-ID.execute-api.eu-west-1.amazonaws.com/dev'
  : 'http://localhost:3000/dev';
```

---

## 📈 **Part 7: Monitor & Logs**

### View Lambda Logs

```bash
# View logs for a function
serverless logs -f verifyTicket --stage dev

# Tail logs in real-time
serverless logs -f verifyTicket --stage dev --tail
```

### CloudWatch Console

1. Go to: https://console.aws.amazon.com/cloudwatch/
2. Click **"Logs"** → **"Log groups"**
3. Find: `/aws/lambda/can2025-secure-gates-dev-verifyTicket`
4. Click to view logs

### DynamoDB Monitoring

1. DynamoDB Console → Your table
2. Click **"Monitor"** tab
3. View read/write metrics

---

## 🔐 **Part 8: Security Best Practices**

### Enable SSL/HTTPS (Already Enabled)

API Gateway automatically uses HTTPS ✅

### Secure JWT Secret

```bash
# Store JWT secret in SSM Parameter Store
aws ssm put-parameter \
  --name "/can2025/dev/jwt-secret" \
  --value "YOUR-STRONG-SECRET-$(openssl rand -hex 32)" \
  --type "SecureString" \
  --region eu-west-1
```

Update `serverless.yml`:
```yaml
environment:
  JWT_SECRET: ${ssm:/can2025/${self:provider.stage}/jwt-secret~true}
```

Redeploy:
```bash
serverless deploy --stage dev
```

### Enable API Gateway Rate Limiting (Already Configured)

In `serverless.yml`:
```yaml
apiGateway:
  usagePlan:
    quota:
      limit: 5000  # 5000 requests per month
    throttle:
      burstLimit: 200  # 200 concurrent requests
      rateLimit: 100   # 100 requests per second
```

---

## 💰 **Part 9: Cost Optimization**

### Remove EC2 Instance (Optional)

If you don't need the test instance:

```yaml
# Comment out in serverless.yml:
# resources:
#   Resources:
#     SecurityTestInstance:
#       Type: AWS::EC2::Instance
#       ...
```

### Use On-Demand Billing

DynamoDB is set to `PAY_PER_REQUEST` - you only pay for what you use ✅

### Set CloudWatch Log Retention

Logs automatically expire after 30 days (configured):
```yaml
logRetentionInDays: 30
```

---

## 🧹 **Part 10: Cleanup (After Demo)**

To remove all resources:

```bash
serverless remove --stage dev
```

This deletes:
- ✅ All Lambda functions
- ✅ API Gateway
- ✅ DynamoDB tables (data will be lost!)
- ✅ SQS queue
- ✅ CloudWatch logs
- ✅ IAM roles

---

## 🐛 **Troubleshooting**

### Deployment Fails

```bash
# Check AWS credentials
aws sts get-caller-identity

# Check region
aws configure get region

# Verbose deployment
serverless deploy --stage dev --verbose
```

### Function Errors

```bash
# View function logs
serverless logs -f verifyTicket --stage dev --tail

# Check function exists
aws lambda get-function --function-name can2025-secure-gates-dev-verifyTicket --region eu-west-1
```

### DynamoDB Access Denied

Check IAM role has permissions:
```bash
aws iam get-role-policy \
  --role-name can2025-secure-gates-dev-eu-west-1-lambdaRole \
  --policy-name dev-can2025-secure-gates-lambda
```

### CORS Errors in Frontend

Add to `serverless.yml`:
```yaml
functions:
  verifyTicket:
    events:
      - http:
          cors:
            origin: '*'
            headers:
              - Content-Type
              - Authorization
```

---

## ✅ **Success Checklist**

- [ ] IAM user created with access keys
- [ ] AWS CLI configured
- [ ] Serverless Framework installed
- [ ] Deployed successfully (`serverless deploy`)
- [ ] All 7 Lambda functions visible in console
- [ ] All 4 DynamoDB tables created
- [ ] API Gateway endpoint accessible
- [ ] Test API calls work (curl)
- [ ] Frontend updated with production URL
- [ ] JWT secret stored in SSM
- [ ] Logs visible in CloudWatch

---

## 📞 **Next Steps**

1. ✅ Deploy M2 to AWS (follow this guide)
2. 🔄 Update frontend with production API URL
3. 🧪 Test login/ticket verification from UI
4. 📊 Monitor CloudWatch metrics
5. 🚀 Deploy to production stage (optional)

---

## 🎓 **Production Deployment (Optional)**

For production stage:

```bash
# Deploy to prod
serverless deploy --stage prod

# Uses different table names and endpoints
# Tables: can2025-secure-gates-*-prod
# API: https://XXX.execute-api.eu-west-1.amazonaws.com/prod/...
```

---

**Congratulations! M2 is now deployed to AWS! 🎉**
