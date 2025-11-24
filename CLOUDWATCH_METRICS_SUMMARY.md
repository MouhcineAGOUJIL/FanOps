# 📊 CloudWatch Metrics - Quick Reference

## ✅ Available Metrics (Real Data)

Based on your current AWS deployment, here are the CloudWatch metrics you can fetch:

---

## 🎯 Lambda Metrics (WORKING ✅)

### verifyTicket Function
- **Invocations**: 13 (last hour)
- **Errors**: 0 ✅
- **Avg Duration**: 327ms
- **Max Duration**: 687ms

### login Function  
- **Invocations**: 8 (last hour)
- **Errors**: 0 ✅
- **Avg Duration**: 204ms
- **Max Duration**: 219ms

**Status**: ✅ **Working perfectly**

---

## 📡 API Gateway Metrics

Available metrics:
- ✅ Total Requests
- ✅ 4xx Errors (client errors)
- ✅ 5xx Errors (server errors)
- ✅ Error Rate
- ✅ Average Latency
- ✅ Maximum Latency

**Note**: API metrics use different naming in your setup. Needs adjustment.

---

## 💾 DynamoDB Metrics (WORKING ✅)

### Audit Table
- **Read Capacity Units**: 106 (last hour)
- **Write Capacity Units**: 113 (last hour)

**Status**: ✅ **Working perfectly**

---

## 🚀 How to Use

### Fetch Metrics Manually
```bash
cd M2-security-aws
node scripts/fetchCloudWatchMetrics.js
```

### JSON Output (for Dashboard)
```json
{
  "lambda": {
    "verifyTicket": {
      "invocations": 13,
      "errors": 0,
      "avgDuration": 327,
      "maxDuration": 687
    },
    "login": {
      "invocations": 8,
      "errors": 0,
      "avgDuration": 204,
      "maxDuration": 219
    }
  },
  "dynamodb": {
    "readCapacityUnits": 106,
    "writeCapacityUnits": 113
  }
}
```

---

## 📊 Recommended Dashboard Display

### Performance Panel
```
┌─────────────────────────────────────────┐
│ System Performance (Last Hour)          │
├─────────────────────────────────────────┤
│ Lambda Invocations:                     │
│   • verifyTicket: 13 requests           │
│   • login: 8 requests                   │
│                                         │
│ Response Times:                         │
│   • verifyTicket: 327ms avg (687ms max)│
│   • login: 204ms avg (219ms max)       │
│                                         │
│ Errors: 0 ✅                            │
│                                         │
│ DynamoDB Activity:                      │
│   • Reads: 106 capacity units           │
│   • Writes: 113 capacity units          │
└─────────────────────────────────────────┘
```

---

## 🎨 Integration Options

### Option 1: Add to Existing Dashboard
Add a new section "System Performance" below the current metrics

### Option 2: Separate Operations Tab
Create a new "Operations" or "Performance" tab

### Option 3: System Health Card
Add a compact "System Health" card showing:
- Lambda errors (0 = green, >0 = red)
- Average response time
- Request volume

---

## ⚡ Next Steps

1. **Test the script** ✅ (Already working!)
2. **Create Lambda endpoint** to serve CloudWatch metrics
3. **Update frontend** to display metrics
4. **Add charts** for visualization

---

## 📝 Key Metrics to Display

### Priority 1 (Must Have)
- ✅ Lambda Errors (security critical)
- ✅ Lambda Invocations (traffic monitoring)
- ✅ Average Response Time (performance)

### Priority 2 (Nice to Have)
- DynamoDB capacity usage
- Request volume trends
- Error rate percentage

### Priority 3 (Future)
- Cost per 1000 requests
- Concurrent execution trends
- Peak usage times

---

## 🔍 Full Documentation

See `CLOUDWATCH_METRICS_GUIDE.md` for:
- Complete metric list
- Implementation examples
- Dashboard mockups
- Integration code

---

**Script Location**: `M2-security-aws/scripts/fetchCloudWatchMetrics.js`
**Documentation**: `M2-security-aws/CLOUDWATCH_METRICS_GUIDE.md`
