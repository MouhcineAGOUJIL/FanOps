# 🎯 M2 Security Dashboard - Quick Start

## 🚀 Generate Test Data

```bash
cd M2-security-aws
node scripts/seedSecurityEvents.js 100
```

**Output**:
```
✅ Security events generated!
📊 Summary:
  • Total events: 100
  • Valid ticket scans: 64
  • Invalid tickets: 19
  • Replay attacks: 7
  • Successful logins: 4
  • Failed logins: 6
```

---

## 👀 View Dashboard

1. **Start frontend** (if not running):
   ```bash
   cd frontend
   npm run dev
   ```

2. **Open in browser**:
   ```
   http://localhost:5174/admin/security
   ```

3. **Login credentials**:
   - Username: `admin`
   - Password: `admin123`

---

## 📊 What You'll See

### Ticket Scanning Metrics
- **Total Scans**: 90
- **Valid**: 64 (71%)
- **Invalid**: 19 (21%)
- **Replay Attacks**: 7 (8%)

### Authentication Metrics ✅ NEW
- **Login Attempts**: 10
- **Successful**: 4 (40%)
- **Failed**: 6 (60%)

### Success Rates
- **Ticket Success**: 71% (green bar)
- **Login Success**: 40% (purple bar) ✅ NEW

---

## 🔄 Generate More Data

```bash
# Add 50 more events
node scripts/seedSecurityEvents.js 50

# Add 200 events for larger dataset
node scripts/seedSecurityEvents.js 200

# Click "Refresh" in dashboard to see updates
```

---

## 📖 Full Documentation

- **Metrics Guide**: `M2-security-aws/SECURITY_METRICS_GUIDE.md`
- **Implementation**: `M2_SECURITY_DASHBOARD_COMPLETE.md`
- **M2 README**: `M2-security-aws/README.md`

---

## ✅ Key Features

- ✅ Real-time data (no more zeros!)
- ✅ Login tracking (successful + failed)
- ✅ Replay attack detection
- ✅ Auto-refresh every 30 seconds
- ✅ Professional glassmorphism UI
- ✅ Color-coded metrics (green, red, orange, purple)

---

**Status**: ✅ Complete and Working!
