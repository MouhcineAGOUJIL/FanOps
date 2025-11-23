# M1 Flow CORS Fix Guide

## Problem
Browser is blocking requests to M1 Azure Functions due to CORS policy.
- ✅ Curl works (no CORS)
- ❌ Browser fails (CORS blocked)

## Solution: Configure CORS in Azure Functions

### Option 1: Azure Portal (Quick - Recommended)

1. **Go to Azure Portal**: https://portal.azure.com
2. **Navigate to your Function App**: `func-m1-fanops-comehdi`
3. **Settings** → **CORS** (in left menu)
4. **Add allowed origins**:
   ```
   http://localhost:5173
   http://localhost:5174
   http://localhost:5175
   ```
5. **Click Save**

### Option 2: local.settings.json (Local Development)

Add to `M1-flow-azure/local.settings.json`:

```json
{
  "IsEncrypted": false,
  "Values": {
    ...
  },
  "Host": {
    "CORS": "*",
    "CORSCredentials": false
  }
}
```

Then restart the Functions.

### Option 3: Azure CLI

```bash
az functionapp cors add \
  --name func-m1-fanops-comehdi \
  --resource-group rg-fanops-m1 \
  --allowed-origins http://localhost:5174
```

---

## Temporary Fix: Use Browser Extension

Install **CORS Unblock** extension for Chrome/Firefox to bypass CORS during development.

---

## Verify CORS is Working

After configuring CORS, test:

```bash
# Check CORS headers
curl -H "Origin: http://localhost:5174" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS \
  "https://func-m1-fanops-comehdi-fwgeaxhwambjcsev.francecentral-01.azurewebsites.net/api/flow/status?stadiumId=AGADIR" \
  -v
```

Should return:
```
Access-Control-Allow-Origin: http://localhost:5174
```

---

## Production Setup

For production, add your actual domain:
```
https://yourfrontend.azurewebsites.net
```

**⚠️ Never use `*` in production!**
