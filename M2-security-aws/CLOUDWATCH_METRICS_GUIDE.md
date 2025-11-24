# 📊 CloudWatch Metrics for Security Dashboard

## Overview

CloudWatch provides rich operational metrics for your M2 Security Service. This guide shows you which metrics to fetch and how to integrate them into your dashboard.

---

## 🎯 Recommended Metrics

### 1. **Lambda Function Metrics**

#### **Invocations** (Most Important)
- **What**: Number of times each Lambda function was invoked
- **Why**: Track API usage, detect unusual activity spikes
- **Metric Name**: `Invocations`
- **Namespace**: `AWS/Lambda`

**Functions to Track**:
- `can2025-secure-gates-dev-verifyTicket`
- `can2025-secure-gates-dev-login`
- `can2025-secure-gates-dev-getSecurityMetrics`
- `can2025-secure-gates-dev-reportGate`

#### **Errors**
- **What**: Number of function invocation failures
- **Why**: Detect system issues affecting security operations
- **Metric Name**: `Errors`
- **Alert Threshold**: > 5 errors in 5 minutes

#### **Duration**
- **What**: Execution time in milliseconds
- **Why**: Track performance degradation
- **Metric Name**: `Duration`
- **Alert Threshold**: > 3000ms (slow response)

#### **Throttles**
- **What**: Number of throttled invocations
- **Why**: Detect capacity issues during peak times
- **Metric Name**: `Throttles`
- **Alert Threshold**: > 0 (immediate alert)

#### **Concurrent Executions**
- **What**: Number of functions running simultaneously
- **Why**: Capacity planning, detect DDoS attempts
- **Metric Name**: `ConcurrentExecutions`

---

### 2. **API Gateway Metrics**

#### **Count** (Request Count)
- **What**: Total API requests
- **Why**: Overall traffic analysis
- **Metric Name**: `Count`
- **Namespace**: `AWS/ApiGateway`

#### **4XXError** (Client Errors)
- **What**: Invalid requests (401, 403, 400, etc.)
- **Why**: Detect brute force, invalid credentials
- **Metric Name**: `4XXError`
- **Alert Threshold**: > 50 per minute

#### **5XXError** (Server Errors)
- **What**: Server-side failures
- **Why**: System health monitoring
- **Metric Name**: `5XXError`
- **Alert Threshold**: > 5 per minute

#### **Latency**
- **What**: Request processing time
- **Why**: User experience, performance monitoring
- **Metric Name**: `Latency`
- **Alert Threshold**: p99 > 2000ms

#### **IntegrationLatency**
- **What**: Time Lambda takes to respond
- **Why**: Identify backend bottlenecks
- **Metric Name**: `IntegrationLatency`

---

### 3. **DynamoDB Metrics**

#### **ConsumedReadCapacityUnits**
- **What**: Read capacity used by queries
- **Why**: Cost optimization, capacity planning
- **Metric Name**: `ConsumedReadCapacityUnits`
- **Namespace**: `AWS/DynamoDB`

#### **ConsumedWriteCapacityUnits**
- **What**: Write capacity used
- **Why**: Track audit log growth rate
- **Metric Name**: `ConsumedWriteCapacityUnits`

#### **UserErrors**
- **What**: Failed DynamoDB operations
- **Why**: Application bugs, permission issues
- **Metric Name**: `UserErrors`
- **Alert Threshold**: > 0

#### **SystemErrors**
- **What**: DynamoDB service errors
- **Why**: AWS service health
- **Metric Name**: `SystemErrors`

#### **SuccessfulRequestLatency**
- **What**: DynamoDB query response time
- **Why**: Performance monitoring
- **Metric Name**: `SuccessfulRequestLatency`

---

### 4. **Custom Application Metrics** (Recommended to Add)

#### **Security Events Rate**
- **What**: Events per second/minute
- **Why**: Detect traffic anomalies
- **How**: Publish from Lambda using `putMetricData`

#### **Replay Attack Rate**
- **What**: Replay attempts per hour
- **Why**: Security threat monitoring
- **How**: Count replay results in audit logs

#### **Failed Login Rate**
- **What**: Failed logins per minute by IP
- **Why**: Brute force detection
- **How**: Aggregate from audit logs

#### **Valid Ticket Percentage**
- **What**: Success rate of ticket validations
- **Why**: Quality metric
- **How**: Calculate from audit data

---

## 📊 Dashboard Integration Examples

### Example 1: Lambda Invocations (Last Hour)

```javascript
// Fetch Lambda invocation count
async function getLambdaInvocations() {
  const cloudwatch = new AWS.CloudWatch({ region: 'eu-west-1' });
  
  const params = {
    Namespace: 'AWS/Lambda',
    MetricName: 'Invocations',
    Dimensions: [
      {
        Name: 'FunctionName',
        Value: 'can2025-secure-gates-dev-verifyTicket'
      }
    ],
    StartTime: new Date(Date.now() - 3600000), // 1 hour ago
    EndTime: new Date(),
    Period: 300, // 5-minute intervals
    Statistics: ['Sum']
  };
  
  const data = await cloudwatch.getMetricStatistics(params).promise();
  
  // Returns array of datapoints
  return data.Datapoints.map(dp => ({
    timestamp: dp.Timestamp,
    value: dp.Sum
  }));
}
```

### Example 2: API Gateway Error Rate

```javascript
async function getAPIErrors() {
  const cloudwatch = new AWS.CloudWatch({ region: 'eu-west-1' });
  
  const params = {
    Namespace: 'AWS/ApiGateway',
    MetricName: '4XXError',
    Dimensions: [
      {
        Name: 'ApiName',
        Value: 'dev-can2025-secure-gates'
      }
    ],
    StartTime: new Date(Date.now() - 3600000),
    EndTime: new Date(),
    Period: 60, // 1-minute intervals
    Statistics: ['Sum']
  };
  
  const data = await cloudwatch.getMetricStatistics(params).promise();
  
  const total4xx = data.Datapoints.reduce((sum, dp) => sum + dp.Sum, 0);
  return {
    total4xxErrors: total4xx,
    datapoints: data.Datapoints
  };
}
```

### Example 3: DynamoDB Capacity Usage

```javascript
async function getDynamoDBMetrics() {
  const cloudwatch = new AWS.CloudWatch({ region: 'eu-west-1' });
  
  const params = {
    Namespace: 'AWS/DynamoDB',
    MetricName: 'ConsumedReadCapacityUnits',
    Dimensions: [
      {
        Name: 'TableName',
        Value: 'can2025-secure-gates-audit-dev'
      }
    ],
    StartTime: new Date(Date.now() - 3600000),
    EndTime: new Date(),
    Period: 300,
    Statistics: ['Average', 'Maximum']
  };
  
  const data = await cloudwatch.getMetricStatistics(params).promise();
  
  return {
    avgReadCapacity: data.Datapoints[0]?.Average || 0,
    maxReadCapacity: data.Datapoints[0]?.Maximum || 0
  };
}
```

---

## 🎨 Dashboard Display Ideas

### 1. **System Health Panel**
```
┌─────────────────────────────────────┐
│ System Health (Last 5 min)         │
├─────────────────────────────────────┤
│ Lambda Errors:        2 ⚠️          │
│ API 4xx Errors:      15 ⚠️          │
│ API 5xx Errors:       0 ✅          │
│ DynamoDB Throttles:   0 ✅          │
│ Avg Response Time:  250ms ✅        │
└─────────────────────────────────────┘
```

### 2. **Traffic Chart**
```
API Requests (Last Hour)
30 │                    ╭─╮
25 │                 ╭─╮│ │
20 │              ╭─╮│ ││ │
15 │           ╭─╮│ ││ ││ │
10 │        ╭─╮│ ││ ││ ││ │
 0 ├────────┴─┴┴─┴┴─┴┴─┴┴─┴
   12:00  12:15  12:30 12:45
```

### 3. **Performance Metrics**
```
┌───────────────────┬───────────────────┐
│ Avg Latency       │ Peak Latency      │
│ 245ms ✅          │ 890ms ⚠️         │
└───────────────────┴───────────────────┘
│ P50: 200ms  P95: 450ms  P99: 780ms   │
└───────────────────────────────────────┘
```

---

## 🔥 High-Value Metrics for Security

### Priority 1: Critical
1. **Lambda Errors** - System failures
2. **API 4xx Errors** - Authentication failures
3. **DynamoDB Throttles** - Capacity issues
4. **Failed Login Rate** - Security threats

### Priority 2: Important
1. **Lambda Duration** - Performance
2. **API Latency** - User experience
3. **Invocation Count** - Traffic patterns
4. **DynamoDB Latency** - Database health

### Priority 3: Nice to Have
1. **Concurrent Executions** - Capacity planning
2. **Integration Latency** - Backend performance
3. **Read/Write Capacity** - Cost optimization

---

## 📈 Suggested Dashboard Metrics

### Recommended Layout

```
┌────────────────────────────────────────────────────────┐
│                  Security Dashboard                     │
├────────────────────────────────────────────────────────┤
│                                                         │
│  [Ticket Metrics]  [Auth Metrics]  [System Health]    │
│  (existing)        (existing)       (CloudWatch)       │
│                                                         │
├────────────────────────────────────────────────────────┤
│  Performance Metrics (CloudWatch)                      │
│  ┌─────────────┬─────────────┬─────────────┐          │
│  │ Avg Latency │ Error Rate  │ Requests/m  │          │
│  │   245ms     │    0.2%     │    1,250    │          │
│  └─────────────┴─────────────┴─────────────┘          │
├────────────────────────────────────────────────────────┤
│  Traffic Chart (Last Hour)                             │
│  [Line chart of API requests]                          │
├────────────────────────────────────────────────────────┤
│  Error Breakdown                                       │
│  ┌──────────────────┬──────────────────┐              │
│  │ 4xx Errors: 15   │ 5xx Errors: 0    │              │
│  │ (Auth failures)  │ (Server errors)  │              │
│  └──────────────────┴──────────────────┘              │
└────────────────────────────────────────────────────────┘
```

---

## 🛠️ Implementation Steps

### Step 1: Create CloudWatch Client in Backend

```javascript
// src/handlers/getCloudWatchMetrics.js
const AWS = require('aws-sdk');
const cloudwatch = new AWS.CloudWatch({ region: 'eu-west-1' });

exports.handler = async (event) => {
  const now = new Date();
  const oneHourAgo = new Date(now - 3600000);
  
  // Fetch multiple metrics in parallel
  const [lambdaMetrics, apiMetrics, dynamoMetrics] = await Promise.all([
    getLambdaMetrics(oneHourAgo, now),
    getAPIGatewayMetrics(oneHourAgo, now),
    getDynamoDBMetrics(oneHourAgo, now)
  ]);
  
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      lambda: lambdaMetrics,
      apiGateway: apiMetrics,
      dynamodb: dynamoMetrics,
      timestamp: now.toISOString()
    })
  };
};
```

### Step 2: Add API Endpoint

```yaml
# serverless.yml
functions:
  getCloudWatchMetrics:
    handler: src/handlers/getCloudWatchMetrics.handler
    timeout: 15
    events:
      - http:
          path: security/cloudwatch-metrics
          method: get
          cors: true
```

### Step 3: Update IAM Permissions

```yaml
iamRoleStatements:
  - Effect: Allow
    Action:
      - cloudwatch:GetMetricStatistics
      - cloudwatch:ListMetrics
    Resource: '*'
```

### Step 4: Frontend Integration

```javascript
// frontend/src/services/cloudWatchService.js
import m2Client from './m2Client';

export const cloudWatchService = {
  getMetrics: async () => {
    const response = await m2Client.get('/security/cloudwatch-metrics');
    return response.data;
  }
};
```

---

## 📊 Metrics to Display

### Minimal MVP (Start Here)
1. ✅ Lambda Errors (last 5 min)
2. ✅ API 4xx Error Count (last hour)
3. ✅ Average Latency (last hour)

### Enhanced Version
4. Traffic chart (requests per minute)
5. Error rate percentage
6. P95/P99 latency percentiles

### Advanced Features
7. Cost metrics (invocations × duration)
8. Concurrent execution trends
9. DynamoDB capacity utilization

---

## 💡 Pro Tips

### 1. **Cache CloudWatch Data**
- CloudWatch API is slow (~500ms)
- Cache metrics for 30-60 seconds
- Use Redis or in-memory cache

### 2. **Batch Metric Queries**
- Use `getMetricData` instead of `getMetricStatistics`
- Fetch multiple metrics in one API call
- Reduces latency and API costs

### 3. **Set Alert Thresholds**
```javascript
const alerts = {
  lambdaErrors: { threshold: 5, severity: 'high' },
  api4xxErrors: { threshold: 50, severity: 'medium' },
  latency: { threshold: 2000, severity: 'low' }
};
```

### 4. **Use CloudWatch Alarms**
- Create SNS topics for critical alerts
- Send emails/SMS for security events
- Integrate with dashboard notifications

---

## 🎯 Quick Start

### 1. Test Metrics Fetch

```bash
# Install AWS SDK (if not already)
npm install aws-sdk

# Create test script
node scripts/testCloudWatchMetrics.js
```

### 2. Query CloudWatch CLI

```bash
# Get Lambda invocations (last 1 hour)
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Invocations \
  --dimensions Name=FunctionName,Value=can2025-secure-gates-dev-verifyTicket \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Sum \
  --region eu-west-1
```

### 3. View in AWS Console

```
https://eu-west-1.console.aws.amazon.com/cloudwatch/home?region=eu-west-1#metricsV2:
```

Filter by:
- Namespace: `AWS/Lambda`
- Metric: `Invocations`, `Errors`, `Duration`

---

## 📚 Resources

- [CloudWatch Metrics Documentation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/working_with_metrics.html)
- [Lambda Metrics](https://docs.aws.amazon.com/lambda/latest/dg/monitoring-metrics.html)
- [API Gateway Metrics](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-metrics-and-dimensions.html)
- [DynamoDB Metrics](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/metrics-dimensions.html)

---

**Next**: Would you like me to implement a CloudWatch metrics endpoint for your dashboard?
