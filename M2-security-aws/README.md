# 🔐 M2 - Secure Gates (AWS Serverless)

**M2 Secure Gates** is a serverless security microservice for **CAN 2025 FanOps** that handles ticket verification, gate monitoring, authentication, and security auditing. Built on **AWS Lambda, DynamoDB, API Gateway, and SQS**.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [AWS Services Used](#aws-services-used)
- [How It Works](#how-it-works)
- [API Endpoints](#api-endpoints)
- [Security Features](#security-features)
- [Deployment](#deployment)
- [Testing](#testing)
- [Cost](#cost)

---

## 🎯 Overview

M2 provides **enterprise-grade security** for stadium access control:

- ✅ **JWT-based ticket verification** with anti-replay protection
- ✅ **User authentication** (Admin, Gatekeepers)
- ✅ **Real-time audit logging** for compliance
- ✅ **Gate status reporting** for monitoring
- ✅ **Security metrics** dashboard
- ✅ **Serverless architecture** (auto-scaling, pay-per-use)

**Production API**: `https://3cfc8hn4xa.execute-api.eu-west-1.amazonaws.com/dev`

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CAN 2025 Frontend                         │
│              (React - Vite - Port 5174)                     │
└────────────┬────────────────────────────────────────────────┘
             │
             │ HTTPS/REST
             ▼
┌─────────────────────────────────────────────────────────────┐
│                   AWS API Gateway                            │
│  ✓ CORS Enabled    ✓ Rate Limiting    ✓ Usage Plans       │
└────────────┬────────────────────────────────────────────────┘
             │
             ├──→ POST /auth/login ────────→ Lambda (login)
             ├──→ POST /auth/logout ───────→ Lambda (logout)
             ├──→ POST /security/verifyTicket ──→ Lambda (verifyTicket)
             ├──→ POST /security/reportGate ────→ Lambda (reportGate)
             └──→ GET  /security/metrics ───────→ Lambda (getSecurityMetrics)
                      │
                      ▼
         ┌────────────────────────────────────┐
         │     AWS Lambda Functions (7)        │
         │  ✓ Node.js 18.x                    │
         │  ✓ Auto-scaling                    │
         │  ✓ CloudWatch Logging              │
         └──────┬──────────────────────────────┘
                │
                ├──────────────────┬──────────────────┐
                ▼                  ▼                  ▼
    ┌──────────────────┐  ┌──────────────┐  ┌──────────────┐
    │  DynamoDB (4)    │  │  SQS Queue   │  │ CloudWatch   │
    ├──────────────────┤  ├──────────────┤  ├──────────────┤
    │ • Users          │  │ Security     │  │ Logs &       │
    │ • Sold-Tickets   │  │ Alerts       │  │ Metrics      │
    │ • Audit          │  └──────────────┘  └──────────────┘
    │ • Used-JTI       │
    └──────────────────┘
```

---

## ☁️ AWS Services Used

### 1. **AWS Lambda** (Serverless Compute)

7 Lambda functions handle all business logic:

| Function | Purpose | Memory | Timeout |
|----------|---------|--------|---------|
| `verifyTicket` | Verify JWT tickets, anti-replay | 256 MB | 10s |
| `reportGate` | Gate status reports | 128 MB | 10s |
| `login` | User authentication | 256 MB | 10s |
| `logout` | User logout | 128 MB | 10s |
| `logAnalyzer` | DynamoDB stream processor | 256 MB | 60s |
| `rotateKey` | JWT secret rotation | 256 MB | 60s |
| `getSecurityMetrics` | Security dashboard data | 256 MB | 10s |

**Why Lambda?**
- 💰 Pay only for execution time
- 📈 Auto-scales from 0 to thousands of requests
- 🔧 No server management

---

### 2. **Amazon DynamoDB** (NoSQL Database)

4 tables store all application data:

#### **a) Users Table**
```javascript
{
  userId: "admin",              // PK
  password: "$2b$10$...",        // bcrypt hash
  role: "admin",                 // admin | gatekeeper
  name: "Administrator"
}
```

#### **b) Sold-Tickets Table**
```javascript
{
  ticketId: "uuid",              // PK
  userId: "USER-123",
  matchId: "CAN2025-MAR-G1",
  seatNumber: "VIP-10",
  type: "VIP",                   // STANDARD | VIP
  status: "valid",               // valid | expired | used
  jwt: "eyJhbGci..."            // Full JWT token
}
```

#### **c) Audit Table** (with DynamoDB Streams)
```javascript
{
  auditId: "uuid",              // PK
  timestamp: "2025-11-23T...",
  jti: "token-id",
  ticketId: "uuid",
  gateId: "G1",
  deviceId: "scanner-001",
  gatekeeperId: "gk1",
  result: "valid",              // valid | invalid | replay
  // ... additional audit fields
}
```

**DynamoDB Streams** → Triggers `logAnalyzer` Lambda for real-time anomaly detection

#### **d) Used-JTI Table** (Anti-Replay Protection)
```javascript
{
  jti: "token-unique-id",       // PK
  ticketId: "uuid",
  gateId: "G1",
  usedAt: "2025-11-23T...",
  ttl: 1732492800               // Auto-delete after 24h
}
```

**TTL (Time To Live)** automatically deletes old records → **Cost optimization**

**Why DynamoDB?**
- ⚡ Single-digit millisecond latency
- 💰 Pay-per-request (no idle cost)
- 🔄 DynamoDB Streams for real-time processing
- 🗑️ Built-in TTL for automatic cleanup

---

### 3. **Amazon API Gateway** (RESTful API)

Exposes Lambda functions as HTTP endpoints:

```
Base URL: https://3cfc8hn4xa.execute-api.eu-west-1.amazonaws.com/dev

✓ CORS: Enabled for frontend
✓ Rate Limiting: 100 req/sec, burst 200
✓ Usage Plan: 5000 req/month quota
✓ CloudWatch Logs: All requests logged
```

**Why API Gateway?**
- 🌐 HTTPS by default (free SSL)
- 🚦 Built-in rate limiting & throttling
- 📊 Request/response logging
- 💸 Pay per million requests

---

### 4. **Amazon SQS** (Message Queue)

Asynchronous security alerts:

```javascript
// Alert triggered on security events
{
  type: "REPLAY_ATTACK",
  jti: "token-id",
  ticketId: "uuid",
  gateId: "G1",
  timestamp: "2025-11-23T..."
}
```

**Why SQS?**
- 🔄 Decoupled architecture (non-blocking)
- 📬 Guaranteed delivery
- 🔁 Retry logic for failed messages

---

### 5. **Amazon CloudWatch** (Monitoring & Logging)

All Lambda executions and API calls are logged:

```
Log Groups:
├── /aws/lambda/can2025-secure-gates-dev-verifyTicket
├── /aws/lambda/can2025-secure-gates-dev-login
├── /aws/lambda/can2025-secure-gates-dev-reportGate
└── /aws/api-gateway/can2025-secure-gates-dev
```

**Metrics tracked:**
- Request count
- Error rate
- Latency (p50, p90, p99)
- Invocation count

---

## 🔐 How It Works

### 1. **Ticket Verification Flow**

```
┌─────────────┐
│ Gatekeeper  │
│  Scanner    │
└─────┬───────┘
      │ 1. Scan QR Code
      │    (JWT Token)
      ▼
┌─────────────────┐
│  POST /verify   │
│  {              │
│    jwt: "...",  │
│    gateId: "G1",│
│    deviceId: "" │
│  }              │
└─────┬───────────┘
      │
      ▼
┌──────────────────────────────────────┐
│  Lambda: verifyTicket()              │
├──────────────────────────────────────┤
│ Step 1: Decode & Verify JWT          │
│   ├─→ Extract: ticketId, jti, exp    │
│   ├─→ Verify signature with secret   │
│   └─→ Check expiration               │
│                                       │
│ Step 2: Check if ticket was sold     │
│   └─→ DynamoDB: Query sold-tickets   │
│                                       │
│ Step 3: Anti-Replay Check             │
│   ├─→ DynamoDB: Check used-jti       │
│   └─→ If exists → REJECT (replay)    │
│                                       │
│ Step 4: Mark ticket as used          │
│   └─→ DynamoDB: Put jti → used-jti   │
│                                       │
│ Step 5: Log audit event              │
│   └─→ DynamoDB: Put → audit table    │
│                                       │
│ Step 6: Return result                │
│   └─→ {ok: true, reason: "valid"}    │
└──────────────────────────────────────┘
      │
      ▼
┌─────────────────┐
│ DynamoDB Stream │ ──→ Lambda: logAnalyzer()
│ (audit table)   │     (Anomaly Detection)
└─────────────────┘
```

### 2. **Authentication Flow**

```
User → POST /auth/login
       {username, password}
          │
          ▼
     Lambda: login()
          │
          ├─→ Query DynamoDB users table
          ├─→ Verify bcrypt password hash
          ├─→ Generate JWT token
          └─→ Return {ok: true, token, user}
                │
                ▼
          Frontend stores in localStorage
```

### 3. **Security Metrics Flow**

```
Dashboard → GET /security/metrics
               │
               ▼
          Lambda: getSecurityMetrics()
               │
               ├─→ Scan audit table (last 24h)
               ├─→ Count: total, valid, invalid, replay
               ├─→ Group by: gate, time, status
               └─→ Return aggregated metrics
                     │
                     ▼
               Frontend displays charts
```

---

## 📡 API Endpoints

### Authentication

#### `POST /auth/login`
**Request:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "ok": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "username": "admin",
    "role": "admin"
  }
}
```

#### `POST /auth/logout`
**Request:** Bearer token in Authorization header  
**Response:** `{"ok": true}`

---

### Security

#### `POST /security/verifyTicket`
**Request:**
```json
{
  "jwt": "eyJhbGci...",
  "gateId": "G1",
  "deviceId": "scanner-001"
}
```

**Response (Valid):**
```json
{
  "ok": true,
  "reason": "valid",
  "ticketId": "uuid",
  "matchId": "CAN2025-MAR-G1",
  "seatNumber": "VIP-10",
  "message": "Billet valide, accès autorisé"
}
```

**Response (Replay Attack):**
```json
{
  "ok": false,
  "reason": "replay",
  "message": "Ce billet a déjà été utilisé"
}
```

#### `POST /security/reportGate`
**Request:**
```json
{
  "gateId": "G1",
  "deviceId": "scanner-001",
  "reportType": "status",
  "status": "operational",
  "currentOccupancy": 150
}
```

**Response:** `{"success": true}`

#### `GET /security/metrics`
**Response:**
```json
{
  "total": 150,
  "valid": 145,
  "invalid": 3,
  "replay": 2,
  "last24hours": [...],
  "byGate": {...}
}
```

---

## 🔒 Security Features

### 1. **JWT Authentication**
- Industry-standard JWT (RFC 7519)
- HS256 signing algorithm
- Configurable expiration (default: 24h)
- Secret rotation support

### 2. **Anti-Replay Protection**
- JTI (JWT ID) tracking in DynamoDB
- Each ticket can only be used once
- TTL auto-cleanup (24h)

### 3. **Password Security**
- bcrypt hashing (cost factor: 10)
- Salted hashes stored in DB
- Never store plain passwords

### 4. **Audit Trail**
- All verification attempts logged
- DynamoDB Streams for real-time analysis
- Immutable audit records

### 5. **Rate Limiting**
- API Gateway throttling: 100 req/sec
- Burst capacity: 200 concurrent
- Quota: 5000 req/month

### 6. **CORS Security**
- Configured allowed origins
- Credentials support
- Prevents CSRF attacks

---

## 🚀 Deployment

### Prerequisites
- AWS Account
- AWS CLI configured
- Node.js 18+
- Serverless Framework

### Deploy to AWS

```bash
# Install dependencies
npm install

# Deploy to dev stage
serverless deploy --stage dev

# Deploy to production
serverless deploy --stage prod
```

**See**: [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md) for detailed steps.

---

## 🧪 Testing

### Seed Test Data

```bash
# Seed users
node scripts/seedUsersAWS.js

# Seed tickets (10 test tickets)
node scripts/seedTicketsAWS.js

# Print all test tickets
./scripts/printTestTickets.sh
```

### Test Endpoints

```bash
# Test login
curl -X POST "https://API_URL/dev/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Test ticket verification
curl -X POST "https://API_URL/dev/security/verifyTicket" \
  -H "Content-Type: application/json" \
  -d '{
    "jwt": "TICKET_JWT",
    "gateId": "G1",
    "deviceId": "scanner-001"
  }'

# Get metrics
curl "https://API_URL/dev/security/metrics"
```

**See**: [TEST_TICKETS.md](./TEST_TICKETS.md) for ready-to-use test tickets.

---

## 💰 Cost Estimate

### Monthly Cost (dev/test workload)

| Service | Usage | Cost |
|---------|-------|------|
| **Lambda** | 10K invocations/month @ 256MB, 1s avg | $0.20 |
| **API Gateway** | 10K requests/month | $0.04 |
| **DynamoDB** | 10K reads + 5K writes | $0.50 |
| **CloudWatch** | 1 GB logs | $0.50 |
| **SQS** | 1K messages | $0.01 |
| **Data Transfer** | 1 GB outbound | $0.09 |

**Total**: **~$1.34/month** 💰

### Production (estimated 100K requests/month)

| Service | Cost |
|---------|------|
| Lambda | $2.00 |
| API Gateway | $0.35 |
| DynamoDB | $5.00 |
| CloudWatch | $1.00 |
| SQS | $0.10 |
| Data Transfer | $0.90 |

**Total**: **~$9.35/month** 💰

**All within AWS Free Tier for first year!** 🎉

---

## 📊 Monitoring

### CloudWatch Dashboards

```bash
# View Lambda logs (live tail)
serverless logs -f verifyTicket --stage dev --tail

# View specific time range
aws logs tail /aws/lambda/can2025-secure-gates-dev-verifyTicket \
  --since 1h --region eu-west-1
```

### Metrics to Monitor

- **Request Count**: API Gateway → CloudWatch
- **Error Rate**: Lambda errors / total invocations
- **Latency**: p50, p90, p99 response times
- **DynamoDB Throttles**: Read/write capacity exceeded
- **SQS Queue Depth**: Pending messages

---

## 🔧 Configuration

### Environment Variables

Set in `serverless.yml`:

```yaml
environment:
  JWT_SECRET: ${env:JWT_SECRET, 'can2025-secret-key-local'}
  USED_JTI_TABLE: ${self:service}-used-jti-${opt:stage}
  AUDIT_TABLE: ${self:service}-audit-${opt:stage}
  SOLD_TICKETS_TABLE: ${self:service}-sold-tickets-${opt:stage}
  USERS_TABLE: ${self:service}-users-${opt:stage}
  SECURITY_QUEUE_URL: !Ref SecurityQueue
```

### IAM Permissions

Lambda execution role has access to:
- DynamoDB: GetItem, PutItem, Scan
- SQS: SendMessage
- CloudWatch: PutLogs
- SSM: GetParameter (for secrets)

---

## 📚 Documentation

- [AWS Deployment Guide](./AWS_DEPLOYMENT_GUIDE.md) - Step-by-step deployment
- [Frontend Integration](./FRONTEND_INTEGRATION.md) - Connect React app
- [Test Results](./TEST_RESULTS.md) - Deployment verification
- [Test Tickets](./TEST_TICKETS.md) - Ready-to-use test data

---

## 🎓 Learning Resources

### AWS Services
- [AWS Lambda Docs](https://docs.aws.amazon.com/lambda/)
- [DynamoDB Guide](https://docs.aws.amazon.com/dynamodb/)
- [API Gateway Docs](https://docs.aws.amazon.com/apigateway/)

### Serverless Framework
- [Serverless Docs](https://www.serverless.com/framework/docs/)
- [AWS Provider](https://www.serverless.com/framework/docs/providers/aws/)

---

## 🛠️ Troubleshooting

### Common Issues

**1. Login fails with 401**
- Check JWT_SECRET matches deployed Lambda
- Verify user exists in DynamoDB users table

**2. Ticket verification returns "invalid"**
- Ensure IS_OFFLINE is 'false' in production
- Check ticket exists in sold-tickets table
- Verify JWT signature with correct secret

**3. CORS errors in browser**
- Add origin to API Gateway CORS
- Ensure OPTIONS method is allowed

**4. Lambda timeout**
- Check DynamoDB table provisioning
- Increase Lambda timeout in serverless.yml
- Review CloudWatch logs for bottlenecks

---

## 🤝 Contributing

1. Follow existing code style
2. Add tests for new features
3. Update documentation
4. Test locally with `serverless offline`

---

## 📝 License

MIT License - CAN 2025 FanOps Project

---

## 📞 Support

- **Issues**: GitHub Issues
- **Logs**: CloudWatch Console
- **Monitoring**: AWS X-Ray

---

**Built with ❤️ for CAN 2025**  
**Powered by AWS Serverless** ☁️