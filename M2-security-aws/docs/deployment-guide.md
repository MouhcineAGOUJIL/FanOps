# M2 Secure-Gates AWS Deployment Guide

## Overview
M2 is the security and ticket verification microservice deployed on **AWS** using serverless architecture (Lambda + API Gateway + DynamoDB). It integrates with:
- **Frontend** (Azure - React app)
- **M1 Flow** (Azure - Fan experience)
- **M3 Forecast** (GCP - Analytics)
- **M4 Sponsors** (GCP - Sponsor tracking)

---

## Prerequisites

### 1. AWS Account Setup
```bash
# Install AWS CLI
sudo apt install awscli -y

# Configure credentials
aws configure
# AWS Access Key ID: [your-access-key]
# AWS Secret Access Key: [your-secret-key]
# Default region: eu-west-1
# Default output format: json

# Verify configuration
aws sts get-caller-identity
```

### 2. Node.js Dependencies
```bash
cd M2-security-aws
npm install
```

### 3. Serverless Framework
```bash
npm install -g serverless
serverless --version
```

---

## Deployment Steps

### Step 1: Configure Environment Variables
Create `.env` file in M2-security-aws:
```bash
# JWT Secret (generate a strong secret)
JWT_SECRET=your-production-jwt-secret-here

# KMS Key ID (after first deployment)
KMS_KEY_ID=

# Stage
STAGE=dev  # or 'prod' for production
```

### Step 2: Configure SSM Parameters (Optional - for production)
```bash
# Store JWT secret in AWS Systems Manager Parameter Store
aws ssm put-parameter \
  --name "/can2025/dev/jwt-secret" \
  --value "your-production-jwt-secret" \
  --type "SecureString" \
  --region eu-west-1

# Verify
aws ssm get-parameter --name "/can2025/dev/jwt-secret" --with-decryption
```

### Step 3: Deploy to AWS
```bash
# Deploy to development
serverless deploy --stage dev

# Deploy to production
serverless deploy --stage prod

# Expected output:
# ✓ Service deployed to stack can2025-secure-gates-dev
# endpoints:
#   POST - https://xxxxx.execute-api.eu-west-1.amazonaws.com/dev/security/verifyTicket
#   POST - https://xxxxx.execute-api.eu-west-1.amazonaws.com/dev/security/reportGate
#   POST - https://xxxxx.execute-api.eu-west-1.amazonaws.com/dev/auth/login
#   POST - https://xxxxx.execute-api.eu-west-1.amazonaws.com/dev/auth/logout
#   GET  - https://xxxxx.execute-api.eu-west-1.amazonaws.com/dev/security/metrics
```

### Step 4: Save API Endpoint
```bash
# Get the API Gateway URL
serverless info --stage dev

# Save this URL - you'll need it for frontend configuration:
# Example: https://abc123xyz.execute-api.eu-west-1.amazonaws.com/dev
```

### Step 5: Seed Production Database
```bash
# SSH into AWS Lambda or use AWS Systems Manager Session Manager
# Or use a one-time Lambda invocation to seed users

# Create seed Lambda function (add to serverless.yml temporarily):
functions:
  seedUsers:
    handler: scripts/seedUsers.handler
    events:
      - http:
          path: /admin/seed-users
          method: POST
          
# Deploy and invoke once, then remove
```

---

## Cross-Cloud Configuration

### Frontend (Azure) → M2 (AWS)
The React frontend on Azure needs to call M2 APIs:

**Frontend `.env` on Azure:**
```bash
VITE_API_URL=https://abc123xyz.execute-api.eu-west-1.amazonaws.com/dev
VITE_MOCK_MODE=false
```

**CORS Configuration** (already configured in `serverless.yml`):
- Allows requests from any origin (`Access-Control-Allow-Origin: *`)
- For production, restrict to specific domains:
  ```yaml
  functions:
    verifyTicket:
      handler: src/handlers/verifyTicket.handler
      environment:
        ALLOWED_ORIGINS: https://fanops.azurewebsites.net,https://fanops-frontend.azurewebsites.net
  ```

### API Gateway Custom Domain (Optional)
For cleaner URLs:
```bash
# Create custom domain in API Gateway
# Example: api.fanops-can2025.com → M2 endpoints

# Update Route53 or your DNS provider
# CNAME: api.fanops-can2025.com → abc123xyz.execute-api.eu-west-1.amazonaws.com
```

---

## Testing Each Functionality

### 1. Test Login (Authentication)

**Expected Flow:**
1. Gatekeeper/Admin opens frontend (Azure)
2. Clicks Login
3. Frontend sends credentials to M2 AWS API
4. M2 validates and returns JWT token
5. Frontend stores token for subsequent requests

**Manual Test:**
```bash
API_URL="https://abc123xyz.execute-api.eu-west-1.amazonaws.com/dev"

# Test admin login
curl -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'

# Expected response:
# {
#   "ok": true,
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "user": {
#     "username": "admin",
#     "role": "admin"
#   }
# }

# Test gatekeeper login
curl -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "gatekeeper1",
    "password": "gate123"
  }'

# Save the token for next tests
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 2. Test Ticket Verification (Core Functionality)

**Expected Flow:**
1. Gatekeeper scans QR code at stadium gate
2. Frontend (Azure) sends ticket data to M2 AWS
3. M2 validates JWT signature, checks sold tickets DB, checks replay attacks
4. M2 logs to audit trail (DynamoDB)
5. Returns success/failure to frontend

**Manual Test:**
```bash
# First, you need a valid ticket JWT (use the seedSoldTickets script)
cd M2-security-aws
node scripts/seedSoldTickets.js

# This will output valid ticket JWTs, copy one
TICKET_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0aWNrZXRJZCI6IlQwMDAxIiwibWF0Y2hJZCI6Ik0wMDEiLCJzZWF0IjoiQTEwMSIsImZhbklkIjoiRjAwMSIsImlhdCI6MTcwMDAwMDAwMH0..."

# Test ticket verification
curl -X POST $API_URL/security/verifyTicket \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "ticketToken": "'$TICKET_TOKEN'",
    "gateId": "G1"
  }'

# Expected response (first scan):
# {
#   "ok": true,
#   "message": "Ticket valid",
#   "ticket": {
#     "ticketId": "T0001",
#     "matchId": "M001",
#     "seat": "A101",
#     "fanId": "F001"
#   }
# }

# Test replay attack (scan same ticket again)
curl -X POST $API_URL/security/verifyTicket \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "ticketToken": "'$TICKET_TOKEN'",
    "gateId": "G1"
  }'

# Expected response (replay):
# {
#   "ok": false,
#   "error": "Ticket already scanned"
# }
```

### 3. Test Gate Reporting

**Expected Flow:**
1. Gatekeeper reports suspicious activity at gate
2. Frontend sends report to M2 AWS
3. M2 stores in audit log and sends to SQS queue
4. CloudWatch alarm triggers if threshold exceeded

**Manual Test:**
```bash
# Report gate activity
curl -X POST $API_URL/security/reportGate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "gateId": "G1",
    "eventType": "SUSPICIOUS_TICKET",
    "details": {
      "ticketId": "T9999",
      "reason": "Forged QR code detected",
      "severity": "high"
    }
  }'

# Expected response:
# {
#   "ok": true,
#   "message": "Report recorded",
#   "reportId": "R-1234567890"
# }
```

### 4. Test Security Metrics Dashboard

**Expected Flow:**
1. Admin opens Security Dashboard (Azure frontend)
2. Frontend fetches metrics from M2 AWS
3. M2 queries DynamoDB audit table
4. Returns aggregated security data

**Manual Test:**
```bash
# Get security metrics
curl -X GET $API_URL/security/metrics \
  -H "Authorization: Bearer $TOKEN"

# Expected response:
# {
#   "ok": true,
#   "metrics": {
#     "totalScans": 1523,
#     "validScans": 1498,
#     "failedScans": 25,
#     "replayAttempts": 12,
#     "suspiciousActivity": 8
#   },
#   "recentAlerts": [
#     {
#       "timestamp": "2025-11-23T10:30:00Z",
#       "type": "REPLAY_ATTACK",
#       "gateId": "G1",
#       "severity": "high"
#     }
#   ],
#   "recentEvents": [...]
# }
```

### 5. Test Log Analysis (Anomaly Detection)

**Expected Flow:**
1. Tickets are scanned → logged to DynamoDB Audit table
2. DynamoDB Stream triggers `logAnalyzer` Lambda
3. Lambda detects brute force or impossible travel patterns
4. Sends alerts to SQS queue → CloudWatch

**Manual Test:**
```bash
# Trigger multiple failed logins (brute force test)
for i in {1..6}; do
  curl -X POST $API_URL/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"wrong'$i'"}'
  sleep 1
done

# Check CloudWatch Logs for alerts
aws logs tail /aws/lambda/can2025-secure-gates-dev-logAnalyzer --follow

# Expected log output:
# 🚨 BRUTE_FORCE_DETECTED: 6 failed logins from user admin in 60 seconds
```

### 6. Test from Frontend (End-to-End)

**Gatekeeper Flow:**
1. Navigate to `https://your-azure-frontend.azurewebsites.net/login`
2. Login with `gatekeeper1` / `gate123`
3. Should redirect to `/gatekeeper`
4. Scan a QR code (or paste ticket token)
5. Click "Verify Ticket"
6. Should see ✅ "Valid Ticket" or ❌ error message

**Admin Flow:**
1. Login with `admin` / `admin123`
2. Should redirect to `/admin`
3. Navigate to `/admin/security`
4. Should see Security Dashboard with:
   - Recent alerts
   - Ticket scan statistics
   - System health metrics
   - Automated security testing status

---

## Monitoring & Operations

### CloudWatch Logs
```bash
# View Lambda function logs
aws logs tail /aws/lambda/can2025-secure-gates-dev-verifyTicket --follow
aws logs tail /aws/lambda/can2025-secure-gates-dev-login --follow
aws logs tail /aws/lambda/can2025-secure-gates-dev-logAnalyzer --follow

# View API Gateway access logs
aws logs tail /aws/apigateway/can2025-secure-gates-dev --follow
```

### DynamoDB Monitoring
```bash
# Check table status
aws dynamodb describe-table --table-name can2025-secure-gates-usedJti-dev
aws dynamodb describe-table --table-name can2025-secure-gates-audit-dev
aws dynamodb describe-table --table-name can2025-secure-gates-SoldTickets-dev
aws dynamodb describe-table --table-name can2025-secure-gates-Users-dev

# Query audit table for recent events
aws dynamodb query \
  --table-name can2025-secure-gates-audit-dev \
  --key-condition-expression "pk = :pk" \
  --expression-attribute-values '{":pk":{"S":"EVENT"}}' \
  --limit 10
```

### SQS Queue Monitoring
```bash
# Check queue depth
aws sqs get-queue-attributes \
  --queue-url https://sqs.eu-west-1.amazonaws.com/ACCOUNT_ID/can2025-secure-gates-SecurityQueue-dev \
  --attribute-names ApproximateNumberOfMessages

# Receive messages (for debugging)
aws sqs receive-message \
  --queue-url https://sqs.eu-west-1.amazonaws.com/ACCOUNT_ID/can2025-secure-gates-SecurityQueue-dev
```

---

## Security Hardening for Production

### 1. Enable KMS Encryption
```bash
# Create KMS key
aws kms create-key \
  --description "CAN2025 JWT Secret Encryption" \
  --region eu-west-1

# Store the Key ID
export KMS_KEY_ID="arn:aws:kms:eu-west-1:ACCOUNT_ID:key/abc-123-xyz"

# Update serverless.yml environment
```

### 2. Restrict CORS Origins
Update `serverless.yml`:
```yaml
custom:
  allowedOrigins:
    - https://fanops-frontend.azurewebsites.net
    - https://fanops.azurewebsites.net
```

### 3. Enable Rate Limiting
Already configured in API Gateway:
```yaml
provider:
  apiGateway:
    throttle:
      burstLimit: 200
      rateLimit: 100
```

### 4. Set Up CloudWatch Alarms
```bash
# Create alarm for high error rate
aws cloudwatch put-metric-alarm \
  --alarm-name can2025-high-error-rate \
  --alarm-description "Alert if Lambda error rate > 5%" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold

# Create alarm for DynamoDB throttles
aws cloudwatch put-metric-alarm \
  --alarm-name can2025-dynamodb-throttles \
  --metric-name UserErrors \
  --namespace AWS/DynamoDB \
  --statistic Sum \
  --period 60 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold
```

---

## Rollback & Disaster Recovery

### Rollback Deployment
```bash
# List previous deployments
serverless deploy list --stage dev

# Rollback to previous version
serverless rollback --timestamp TIMESTAMP --stage dev
```

### Backup DynamoDB Tables
```bash
# Enable point-in-time recovery
aws dynamodb update-continuous-backups \
  --table-name can2025-secure-gates-audit-dev \
  --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true

# Create on-demand backup
aws dynamodb create-backup \
  --table-name can2025-secure-gates-audit-dev \
  --backup-name can2025-audit-backup-$(date +%Y%m%d)
```

---

## Cost Estimation

**Monthly Costs (for 100,000 ticket scans):**
- Lambda invocations: ~$0.20
- API Gateway: ~$3.50
- DynamoDB (on-demand): ~$12.50
- CloudWatch Logs: ~$0.50
- SQS: ~$0.40

**Total: ~$17/month** (dev environment)

**Production scaling:** Costs scale linearly with traffic.

---

## Troubleshooting

### Issue: "Invalid credentials" on login
**Solution:**
1. Check if Users table is seeded
2. Verify JWT_SECRET matches between deployment and seed script
3. Check CloudWatch logs for auth Lambda

### Issue: "Ticket already scanned" on first scan
**Solution:**
1. Clear UsedJtiTable in DynamoDB
2. Regenerate ticket tokens with new timestamps
3. Check system clock synchronization

### Issue: CORS errors from Azure frontend
**Solution:**
1. Add Azure domain to CORS allowed origins
2. Ensure `Access-Control-Allow-Credentials` is set
3. Check browser console for specific CORS error

### Issue: High Lambda cold start times
**Solution:**
1. Enable provisioned concurrency for critical functions
2. Reduce Lambda package size
3. Use Lambda layers for dependencies

---

## Next Steps

1. **Set up CI/CD**: Use GitHub Actions for automated deployments
2. **Configure custom domain**: Set up API Gateway custom domain
3. **Enable WAF**: Add AWS WAF for additional security
4. **Set up monitoring dashboard**: Create CloudWatch dashboard
5. **Configure backup automation**: Schedule regular DynamoDB backups
