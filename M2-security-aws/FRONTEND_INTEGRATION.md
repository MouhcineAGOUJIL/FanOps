# M2 Frontend Integration

## ✅ **M2 AWS Integrated into Frontend**

**Production API**: `https://3cfc8hn4xa.execute-api.eu-west-1.amazonaws.com/dev`

---

## 📝 **Changes Made**

### 1. Created M2 API Client

**File**: `frontend/src/services/m2Client.js`

- Dedicated axios client for M2 (AWS) endpoints
- Production URL configured
- JWT token auto-injection
- 401 error handling (auto-logout)

```javascript
const M2_API_URL = 'https://3cfc8hn4xa.execute-api.eu-west-1.amazonaws.com/dev';
```

### 2. Updated Auth Service

**File**: `frontend/src/services/authService.js`

- Uses `m2Client` instead of generic `apiClient`
- Points to M2 AWS production endpoints
- Enhanced error handling

**Endpoints:**
- ✅ `POST /auth/login` - User authentication
- ✅ `POST /auth/logout` - User logout

### 3. Updated Security Service

**File**: `frontend/src/services/securityService.js`

- Uses `m2Client` for all security operations
- Added `getSecurityMetrics()` function

**Endpoints:**
- ✅ `POST /security/verifyTicket` - Verify tickets
- ✅ `POST /security/reportGate` - Report gate status
- ✅ `GET /security/metrics` - Get security metrics

---

## 🧪 **How to Test**

### 1. Test Login

1. Navigate to: `http://localhost:5174/login`
2. Login with:
   - **Admin**: `admin` / `admin123`
   - **Gatekeeper**: `gatekeeper1` / `gate123`
3. Should redirect to dashboard
4. Check browser localStorage for `auth_token`

### 2. Test Gatekeeper Scanner

1. Login as gatekeeper
2. Go to: `/gatekeeper/scan`
3. Get a JWT ticket from database:

```bash
aws dynamodb scan --table-name can2025-secure-gates-sold-tickets-dev --region eu-west-1 --limit 1 | jq -r '.Items[0].jwt.S'
```

4. Paste JWT into scanner
5. Click "Verify Ticket"
6. Should verify successfully

### 3. Test Security Dashboard (Admin)

1. Login as admin
2. Go to: `/admin/security`
3. Should load security metrics
4. View audit logs and security events

---

## 🔑 **Test Credentials**

| User | Username | Password | Role |
|------|----------|----------|------|
| Admin | `admin` | `admin123` | admin |
| Gatekeeper 1 | `gatekeeper1` | `gate123` | gatekeeper |
| Gatekeeper 2 | `gatekeeper2` | `gate123` | gatekeeper |

---

## 🎫 **Test Tickets**

Get valid tickets from AWS DynamoDB:

```bash
# Get a ticket JWT
aws dynamodb scan \
  --table-name can2025-secure-gates-sold-tickets-dev \
  --region eu-west-1 \
  --limit 1 | jq -r '.Items[0].jwt.S'

# Example JWT (expires 24 hours):
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJVU0VSLTc3NyIsInRpY2tldElkIjoiZmQ0MGE4OTctMzY2Zi00NjE2LTk0M2QtNmZlMTI5MTVkYTlhIiwic2NvcGVzIjpbImZhbiJdLCJqdGkiOiI2ODUyYjcyZC03NDE5LTRkODYtYTkxZC1iMzNhODg5NjUyOWQiLCJtYXRjaElkIjoiQ0FOMjAyNS1NQVItRzEiLCJzZWF0TnVtYmVyIjoiQy01NSIsInR5cGUiOiJTVEFOREFSRCIsImlhdCI6MTc2MzkzMjkxOSwiZXhwIjoxNzY0MDE5MzE5fQ...
```

---

## 🌐 **API Endpoints Overview**

### Authentication Endpoints (M2 AWS)

```
POST https://3cfc8hn4xa.execute-api.eu-west-1.amazonaws.com/dev/auth/login
POST https://3cfc8hn4xa.execute-api.eu-west-1.amazonaws.com/dev/auth/logout
```

### Security Endpoints (M2 AWS)

```
POST https://3cfc8hn4xa.execute-api.eu-west-1.amazonaws.com/dev/security/verifyTicket
POST https://3cfc8hn4xa.execute-api.eu-west-1.amazonaws.com/dev/security/reportGate
GET  https://3cfc8hn4xa.execute-api.eu-west-1.amazonaws.com/dev/security/metrics
```

### Flow Management (M1 Azure)

```
GET  https://func-m1-fanops-comehdi-fwgeaxhwambjcsev.francecentral-01.azurewebsites.net/api/flow/status
GET  https://func-m1-fanops-comehdi-fwgeaxhwambjcsev.francecentral-01.azurewebsites.net/api/flow/ai-insights
POST https://func-m1-fanops-comehdi-fwgeaxhwambjcsev.francecentral-01.azurewebsites.net/api/flow/ingest
```

### Sponsor AI (M4 GCP)

```
POST https://europe-west1-can2025-fanops.cloudfunctions.net/m4-sponsor-ai
```

---

## 🔧 **Environment Variables**

Create `.env` in frontend root (optional):

```bash
# M2 Security API (AWS)
VITE_M2_API_URL=https://3cfc8hn4xa.execute-api.eu-west-1.amazonaws.com/dev

# Or use local for development
# VITE_M2_API_URL=http://localhost:3000/dev
```

---

## 🐛 **Troubleshooting**

### Login Fails

**Check:**
1. API URL is correct
2. CORS is enabled on AWS API Gateway
3. Check browser console for errors
4. Verify DynamoDB has users

```bash
aws dynamodb scan --table-name can2025-secure-gates-users-dev --region eu-west-1
```

### Ticket Verification Fails

**Common Issues:**
- JWT expired (24 hour expiry)
- Ticket not in DynamoDB
- Wrong parameters (needs `jwt`, `gateId`, `deviceId`)

**Debug:**
```bash
# Check CloudWatch logs
serverless logs -f verifyTicket --stage dev --tail

# Or AWS Console
CloudWatch → Log groups → /aws/lambda/can2025-secure-gates-dev-verifyTicket
```

### CORS Errors

Add to API Gateway CORS:
- Origin: `http://localhost:5174`
- Methods: `POST, GET, OPTIONS`
- Headers: `Content-Type, Authorization`

---

## ✅ **Verification Checklist**

- [ ] Login page works with M2 AWS
- [ ] Admin dashboard accessible after login
- [ ] Gatekeeper scanner can verify tickets
- [ ] Security dashboard loads metrics
- [ ] JWT token stored in localStorage
- [ ] Auto-logout on 401 errors
- [ ] All M2 services using production URL

---

## 📊 **Service Architecture**

```
Frontend (React)
    ├── authService.js ──────→ M2 (AWS) /auth/*
    ├── securityService.js ──→ M2 (AWS) /security/*
    ├── flowService.js ──────→ M1 (Azure) /flow/*
    └── sponsorService.js ───→ M4 (GCP) /m4-sponsor-ai
```

---

## 🚀 **Next Steps**

1. ✅ Test login from UI
2. ✅ Test ticket scanning
3. ✅ Verify security metrics
4. 📝 Update admin dashboard
5. 🔄 Add real-time updates
6. 📱 Mobile responsive testing

---

**Updated**: 2025-11-23  
**Status**: ✅ M2 Integrated with Frontend  
**Production API**: Active on AWS
