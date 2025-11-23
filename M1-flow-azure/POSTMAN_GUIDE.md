# 📮 M1 API Testing with Postman

Complete guide to test all M1 endpoints using Postman.

---

## 🚀 Quick Setup

### Step 1: Import Collection

1. Download Postman: https://www.postman.com/downloads/
2. Open Postman
3. Click **"Import"** (top left)
4. Drag and drop `M1-FanOps-Collection.json` (in this folder)
5. Click **"Import"**

### Step 2: Set Environment Variables

1. Click the **"Environment"** icon (eye icon, top right)
2. Click **"Add"** to create new environment
3. Name it: `M1 Azure Production`
4. Add these variables:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `base_url` | `https://func-m1-fanops-[yourname].azurewebsites.net` | (same) |
| `function_key` | `[Your function key from Azure Portal]` | (same) |
| `stadium_id` | `AGADIR` | (same) |

5. Click **"Save"**
6. Select the environment from the dropdown (top right)

---

## 📝 Manual Setup (Without Collection)

If you prefer to create requests manually:

### **Request 1: Ingest Gate Data**

**Method**: `POST`  
**URL**: `{{base_url}}/api/flow/ingest?code={{function_key}}`

**Headers**:
```
Content-Type: application/json
```

**Body** (raw JSON):
```json
{
  "stadiumId": "AGADIR",
  "gateId": "G1",
  "ts": "2025-07-14T17:00:00Z",
  "perMinuteCount": 30,
  "avgProcessingTime": 4.0,
  "queueLength": 50
}
```

**Expected Response** (202 Accepted):
```json
{
  "status": "accepted",
  "gateId": "G1"
}
```

---

### **Request 2: Get Gate Status**

**Method**: `GET`  
**URL**: `{{base_url}}/api/flow/status?stadiumId={{stadium_id}}&code={{function_key}}`

**Headers**: None needed

**Expected Response** (200 OK):
```json
{
  "stadiumId": "AGADIR",
  "gates": [
    {
      "gateId": "G1",
      "wait": 3.87,
      "state": "green",
      "last_updated": "2025-11-23T14:00:00",
      "anomaly": false,
      "anomalyScore": 1.17
    }
  ]
}
```

---

### **Request 3: Trigger Anomaly (High Queue)**

**Method**: `POST`  
**URL**: `{{base_url}}/api/flow/ingest?code={{function_key}}`

**Headers**:
```
Content-Type: application/json
```

**Body** (raw JSON):
```json
{
  "stadiumId": "AGADIR",
  "gateId": "G2",
  "ts": "2025-07-14T17:35:00Z",
  "perMinuteCount": 80,
  "avgProcessingTime": 5.0,
  "queueLength": 200
}
```

**Expected Response** (202 Accepted):
```json
{
  "status": "accepted",
  "gateId": "G2"
}
```

**Then check status again - should show RCA triggered:**
```json
{
  "stadiumId": "AGADIR",
  "gates": [
    {
      "gateId": "G2",
      "wait": 12.5,
      "state": "red",
      "anomaly": true,
      "anomalyScore": 4.12,
      "investigation_id": "INV_G2_1763902971",
      "investigation_status": "completed",
      "root_cause": "Scanner Malfunction"
    }
  ]
}
```

---

### **Request 4: Get AI Insights**

**Method**: `GET`  
**URL**: `{{base_url}}/api/flow/ai-insights?stadium_id={{stadium_id}}&code={{function_key}}`

**Headers**: None needed

**Expected Response** (200 OK):
```json
{
  "stadium_id": "AGADIR",
  "latest_decision": {
    "decision": "Monitor gate G1 closely. Prepare for VIP arrivals...",
    "reasoning": "Current situation manageable but vigilance required...",
    "confidence": 0.9,
    "timestamp": "2025-11-23T14:05:00Z",
    "functions_called": ["get_all_gate_status", "get_match_context"],
    "cost_usd": 0.0041
  },
  "recent_decisions": [...],
  "total_decisions": 5,
  "query_time": "2025-11-23T14:10:00Z"
}
```

---

### **Request 5: Query RCA Investigation**

**Method**: `GET`  
**URL**: `{{base_url}}/api/flow/investigation/INV_G2_1763902971?code={{function_key}}`

*Replace `INV_G2_1763902971` with the actual investigation_id from the status response*

**Headers**: None needed

**Expected Response** (200 OK):
```json
{
  "investigation_id": "INV_G2_1763902971",
  "stadium_id": "AGADIR",
  "gate_id": "G2",
  "timestamp": "2025-11-23T14:00:00Z",
  "diagnosis": {
    "root_cause": "Scanner Malfunction",
    "confidence": 0.8
  },
  "anomaly_score": 4.12,
  "mitigation": {
    "priority": "high"
  },
  "status": "completed"
}
```

---

## 🧪 Complete Test Scenario

Follow this sequence to test the full system:

### Scenario: Normal Operations → Anomaly → RCA

**1. Send Normal Data (G1)**
- Request: Ingest Gate Data (G1, queue=50)
- Expected: 202 Accepted

**2. Check Status**
- Request: Get Gate Status
- Expected: G1 shows green, wait ~3-4 min

**3. Trigger Anomaly (G2)**
- Request: Trigger Anomaly (G2, queue=200)
- Expected: 202 Accepted

**4. Check Status Again**
- Request: Get Gate Status
- Expected: 
  - G1: green
  - G2: red/yellow, anomaly=true, investigation_id present

**5. Get RCA Results**
- Request: Query RCA Investigation (use investigation_id from step 4)
- Expected: Full diagnosis with root cause, confidence, mitigation

**6. Check AI Agent**
- Wait 2 minutes (agent runs every 2 min)
- Request: Get AI Insights
- Expected: Latest decision with recommendations

---

## 📊 Postman Tests (Automation)

Add these tests to your requests for automated validation:

### For "Ingest Gate Data":
```javascript
pm.test("Status code is 202", function () {
    pm.response.to.have.status(202);
});

pm.test("Response has status accepted", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.status).to.eql("accepted");
});

pm.test("Response time is less than 2000ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});
```

### For "Get Gate Status":
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has gates array", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.gates).to.be.an('array');
    pm.expect(jsonData.gates.length).to.be.above(0);
});

pm.test("Gate has ML prediction", function () {
    var jsonData = pm.response.json();
    var gate = jsonData.gates[0];
    pm.expect(gate.wait).to.be.a('number');
    pm.expect(gate.state).to.be.oneOf(['green', 'yellow', 'red']);
});

pm.test("Anomaly detection present", function () {
    var jsonData = pm.response.json();
    var gate = jsonData.gates[0];
    pm.expect(gate).to.have.property('anomaly');
    pm.expect(gate).to.have.property('anomalyScore');
});
```

### For "Get AI Insights":
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Has latest decision", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.latest_decision).to.exist;
    pm.expect(jsonData.latest_decision.confidence).to.be.a('number');
});

pm.test("Confidence is valid", function () {
    var jsonData = pm.response.json();
    var confidence = jsonData.latest_decision.confidence;
    pm.expect(confidence).to.be.at.least(0);
    pm.expect(confidence).to.be.at.most(1);
});
```

---

## 🎯 Load Testing with Postman Runner

1. Create a **Collection Runner**:
   - Collections → M1 FanOps → Click "..."
   - Select "Run collection"

2. Configure:
   - **Iterations**: 10
   - **Delay**: 100ms
   - **Data file**: (optional - upload CSV with test data)

3. Click **"Run M1 FanOps"**

4. View Results:
   - Success rate (aim for 100%)
   - Average response time (<500ms)
   - Test pass rate

---

## 📸 Screenshots Guide

### Setting Environment Variables:
1. Click **Environment** icon (top right)
2. Click **"Add"**
3. Fill in variables
4. Select environment from dropdown

### Creating a Request:
1. Click **"New"** → **"HTTP Request"**
2. Set method (GET/POST)
3. Enter URL with variables: `{{base_url}}/api/...`
4. Add headers if needed
5. Add body (JSON) for POST
6. Click **"Send"**

### Adding Tests:
1. In request, go to **"Tests"** tab
2. Paste JavaScript test code
3. Click **"Send"**
4. View results in **"Test Results"** section

---

## 🔐 Security Note

**Function Keys:**
- Keep your function key private
- Don't commit to Git
- Use environment variables in Postman
- For production, use Azure AD authentication

---

## ✅ Success Checklist

Your Postman setup is complete when:

- ✅ Environment variables configured
- ✅ All 5 requests working
- ✅ Ingest returns 202
- ✅ Status returns gate data
- ✅ Anomaly triggers RCA
- ✅ AI insights returns decisions
- ✅ Investigation query works
- ✅ All tests passing (green)

---

## 💡 Pro Tips

1. **Use Variables**: `{{base_url}}`, `{{function_key}}` for easy environment switching
2. **Save Responses**: Click "Save Response" to compare over time
3. **Collection Runner**: Automate testing with multiple iterations
4. **Pre-request Scripts**: Auto-generate timestamps, IDs
5. **Monitor**: Set up Postman Monitor to run tests hourly

---

**Happy Testing! 🚀**

Need help? Check the Azure Portal Log Stream for detailed error messages.
