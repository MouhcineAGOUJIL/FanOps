# 📊 M2 Security Metrics - Complete Guide

## Overview

The M2 Security Dashboard provides comprehensive real-time monitoring of all security events across the FanOps platform. This document explains all tracked metrics and how to interpret them.

---

## 🎫 Ticket Scanning Metrics

### 1. **Total Scan Attempts**
- **What it tracks**: All ticket verification attempts in the last 24 hours
- **Data source**: Audit table, filtered by `type !== 'authentication'`
- **Calculation**: Count of all non-authentication events
- **Good value**: Increases during event hours, decreases when gates are inactive

### 2. **Successful Scans** ✅
- **What it tracks**: Valid tickets that were accepted
- **Data source**: Audit entries with `result === 'valid'`
- **Significance**: These tickets granted stadium access
- **Alert threshold**: If success rate drops below 70%, investigate

### 3. **Rejected Tickets** ⚠️
- **What it tracks**: Invalid, expired, or tampered tickets
- **Data source**: Audit entries with:
  - `result === 'invalid_jwt'` (signature failure)
  - `result === 'invalid_ticket'` (not in sold tickets DB)
  - `result === 'expired'` (past expiration time)
- **Common causes**:
  - Fraudulent QR codes
  - Screenshot attempts (vs. live QR)
  - Tampered JWT signatures
  - Expired promotional tickets

### 4. **Replay Attacks** 🔒
- **What it tracks**: Attempts to reuse a previously scanned ticket
- **Data source**: Audit entries with `result === 'replay_attack'`
- **How it works**:
  1. First scan: JTI is recorded in `used-jti` table
  2. Second scan: JTI already exists → REJECT
  3. Alert sent via SQS queue
- **Security significance**: HIGH - indicates potential ticket fraud or sharing

---

## 👤 Authentication Metrics

### 5. **Total Login Attempts**
- **What it tracks**: All authentication attempts (admin + gatekeepers)
- **Data source**: Audit entries with `type === 'authentication'`
- **Calculation**: `LOGIN_SUCCESS` + `LOGIN_FAILURE` counts
- **Interpretation**:
  - High during shift changes
  - Spikes may indicate brute force attempts

### 6. **Successful Logins** ✅
- **What it tracks**: Valid username + password combinations
- **Data source**: Audit entries with `result === 'LOGIN_SUCCESS'`
- **Logged data**:
  - Username
  - Role (admin/gatekeeper)
  - IP address
  - User agent
  - Timestamp
- **Usage**: User activity tracking, compliance auditing

### 7. **Failed Login Attempts** ⚠️
- **What it tracks**: Invalid credentials or blocked accounts
- **Data source**: Audit entries with `result === 'LOGIN_FAILURE'`
- **Failure reasons**:
  - `invalid_password`: Wrong password
  - `user_not_found`: Username doesn't exist
  - `missing_credentials`: Empty fields
  - `account_locked`: Too many failures
- **Alert threshold**: ≥3 failures from same IP = brute force alert
- **IP tracking**: Enables geographic analysis of attacks

---

## 📈 Success Rate Metrics

### 8. **Ticket Success Rate**
- **Formula**: `(Valid Scans / Total Scans) × 100`
- **Expected value**: 85-95% on event days
- **Low rate causes**:
  - Technical issues (scanner malfunction)
  - User confusion (wrong gate, expired tickets)
  - Fraudulent activity spike

### 9. **Login Success Rate**
- **Formula**: `(Successful Logins / Total Login Attempts) × 100`
- **Expected value**: 90-95% during normal operations
- **Low rate causes**:
  - Forgotten passwords
  - Account sharing attempts
  - Brute force attacks
  - System migration (old credentials)

---

## 🚨 Security Alerts

Automatically detected anomalies:

### Alert Types

#### **REPLAY_ATTACK**
```json
{
  "severity": "HIGH",
  "type": "REPLAY_ATTACK",
  "message": "Tentative de rejeu détectée",
  "ticketId": "uuid",
  "gateId": "G1",
  "timestamp": "..."
}
```
**Action required**: Flag ticket for investigation, notify security team

#### **BRUTE_FORCE**
```json
{
  "severity": "HIGH",
  "type": "BRUTE_FORCE",
  "message": "5 failed login attempts from IP 203.0.113.45",
  "ipAddress": "203.0.113.45",
  "timestamp": "..."
}
```
**Action required**: Block IP, notify IT security

#### **IMPOSSIBLE_TRAVEL**
```json
{
  "severity": "CRITICAL",
  "type": "IMPOSSIBLE_TRAVEL",
  "message": "Suspicious travel detected for user admin",
  "locations": ["Paris, FR", "Tokyo, JP"],
  "timeDelta": "15 minutes"
}
```
**Action required**: Force logout, require MFA

---

## 🏥 System Health Indicators

### AWS Lambda
- **Status**: Operational / Degraded / Down
- **Metrics tracked**:
  - Request count
  - Error rate
  - Average latency
  - Concurrent executions
- **Source**: CloudWatch metrics

### DynamoDB
- **Status**: Healthy / Throttled / Down
- **Metrics tracked**:
  - Read/write capacity usage
  - Throttled requests
  - Query latency
- **Source**: DynamoDB metrics

### API Gateway
- **Status**: Active / Limited / Down
- **Metrics tracked**:
  - Requests per second
  - 4xx/5xx error rates
  - Integration latency
- **Source**: API Gateway logs

### Key Rotation
- **Display**: Last rotation date or "Manual"
- **Recommendation**: Rotate JWT secret every 90 days
- **How to rotate**: Use `/admin/rotateKey` endpoint (future enhancement)

---

## 📊 Data Visualization

### Recent Activity Table
Shows latest 10 audit events:
- **Timestamp**: When event occurred
- **Ticket ID**: First 8 chars (for privacy)
- **Gate**: Which entrance
- **Result**: Valid / Invalid / Replay
- **Device**: Scanner identifier

### Time-based Patterns
- **Peak hours**: 2 hours before game start
- **Low activity**: During halftime, after game
- **Anomaly detection**: Sudden spikes outside expected windows

---

## 🔧 Generating Test Data

To populate the dashboard with realistic data:

```bash
cd M2-security-aws

# Generate 100 random events
node scripts/seedSecurityEvents.js 100

# Generate 500 events for stress testing
node scripts/seedSecurityEvents.js 500
```

**Events generated**:
- 60% valid ticket scans
- 15% invalid tickets
- 10% replay attacks
- 10% successful logins
- 5% failed logins

---

## 📡 Real-time Updates

The dashboard auto-refreshes every **30 seconds**:
- Fetches latest metrics from `/security/metrics`
- Queries recent audit logs
- Updates all statistics and charts

To manually refresh: Click the **Refresh** button

---

## 🎯 Key Performance Indicators (KPIs)

### Event Day Targets
| Metric | Target | Alert If |
|--------|--------|----------|
| Ticket Success Rate | > 90% | < 80% |
| Login Success Rate | > 95% | < 85% |
| Replay Attempts | < 5/hour | > 20/hour |
| Invalid Tickets | < 10% | > 20% |
| Response Time | < 500ms | > 2s |

---

## 📝 Compliance & Auditing

All events are logged to DynamoDB with:
- Unique audit ID
- Precise timestamp (ISO 8601)
- IP address tracking
- Device fingerprinting
- Result classification

**Retention**: 30 days (configurable via DynamoDB TTL)

**Export**: Available via CloudWatch Logs export to S3

---

## 🔍 Troubleshooting

### Dashboard shows all zeros
**Causes**:
1. No data in audit table
2. API connection failure
3. Time filter too restrictive

**Solutions**:
1. Run `node scripts/seedSecurityEvents.js 100`
2. Check M2 API is running: `curl <API_URL>/security/metrics`
3. Check browser console for errors

### Metrics not updating
**Causes**:
1. Auto-refresh disabled
2. Lambda function errors
3. CORS issues

**Solutions**:
1. Click manual refresh button
2. Check CloudWatch logs
3. Verify API Gateway CORS settings

---

## 🚀 Future Enhancements

Planned metrics additions:
- ✅ ~~Login tracking~~ (✅ **COMPLETED**)
- ✅ ~~Failed login monitoring~~ (✅ **COMPLETED**)
- 🔄 Automatic key rotation tracking (in progress)
- 📊 Geographic heatmap of scan locations
- 📈 Hourly trend charts
- 🔔 Real-time push notifications
- 📧 Email alerts for critical events
- 🤖 ML-based anomaly detection

---

## 📞 Support

**Issues**: Check CloudWatch logs at `/aws/lambda/can2025-secure-gates-dev-*`

**Documentation**: [M2-security-aws/README.md](./README.md)

**API Reference**: [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md)

---

**Last Updated**: 2025-11-24  
**Version**: 2.0 (with authentication tracking)
