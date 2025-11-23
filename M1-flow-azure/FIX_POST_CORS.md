# 🔧 Fix POST Request CORS Issue (URGENT)

## Problem
- ✅ GET requests work (Status, AI Insights)
- ❌ POST requests fail (Ingest endpoint)
- Error: "Network Error"

## Root Cause
Azure Functions CORS is blocking POST requests because it needs:
1. ✅ Allowed Origins: `*` (already done)
2. ❌ Allowed Methods: Missing `POST` and `OPTIONS`
3. ❌ Allowed Headers: Missing `Content-Type`

---

## Solution: Add to host.json

Your collaborator needs to add this to the `host.json` file in the M1 project:

### Step 1: Edit host.json

Open `M1-flow-azure/host.json` and update it to:

```json
{
  "version": "2.0",
  "logging": {
    "applicationInsights": {
      "samplingSettings": {
        "isEnabled": true,
        "maxTelemetryItemsPerSecond": 20
      }
    }
  },
  "extensions": {
    "http": {
      "routePrefix": "api",
      "cors": {
        "allowedOrigins": ["*"],
        "allowedMethods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allowedHeaders": ["*"],
        "exposedHeaders": ["*"],
        "maxAge": 3600
      }
    }
  }
}
```

### Step 2: Commit and Push

```bash
cd M1-flow-azure
git add host.json
git commit -m "Fix CORS for POST requests"
git push
```

### Step 3: Wait for Deployment

- GitHub Actions will automatically deploy (3-5 minutes)
- Or manually redeploy from Azure Portal

---

## Alternative: Configure via Azure Portal

If they can't modify the code, do this in Azure Portal:

### Step 1: Go to Function App Configuration

1. Azure Portal → `func-m1-fanops-comehdi`
2. **Settings** → **Configuration** (not CORS!)
3. Click **"+ New application setting"**

Add these settings:

```
Name: CORS_ALLOWED_METHODS
Value: GET,POST,PUT,DELETE,OPTIONS
```

```
Name: CORS_ALLOWED_HEADERS
Value: Content-Type,Authorization,X-Requested-With
```

4. Click **Save**
5. **Restart** the Function App

---

## Quick Test After Fix

Run this curl to verify OPTIONS method works:

```bash
curl -X OPTIONS \
  -H "Origin: http://localhost:5174" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  "https://func-m1-fanops-comehdi-fwgeaxhwambjcsev.francecentral-01.azurewebsites.net/api/flow/ingest" \
  -v
```

Should return:
```
HTTP/1.1 200 OK
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, OPTIONS, GET
Access-Control-Allow-Headers: Content-Type
```

Then test POST:

```bash
curl -X POST \
  "https://func-m1-fanops-comehdi-fwgeaxhwambjcsev.francecentral-01.azurewebsites.net/api/flow/ingest" \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:5174" \
  -d '{"stadiumId":"AGADIR","gateId":"G1","ts":"2025-11-23T18:00:00Z","perMinuteCount":30,"avgProcessingTime":3.0,"queueLength":50}' \
  -v
```

Should return: `{"status": "accepted", "gateId": "G1"}`

---

## Summary for Collaborator

> The CORS `*` in Azure Portal only allows origins, not methods.
> 
> **You need to add this to `host.json`:**
> 
> ```json
> "extensions": {
>   "http": {
>     "cors": {
>       "allowedOrigins": ["*"],
>       "allowedMethods": ["GET", "POST", "OPTIONS"]
>     }
>   }
> }
> ```
> 
> Then push to GitHub. POST requests will work after deployment!

---

## Why This Happens

1. Browser sends **OPTIONS** request first (CORS preflight)
2. Azure checks if POST method is allowed
3. If not configured → Blocks the request
4. Browser shows "Network Error"

**Setting CORS to `*` only allows any ORIGIN, not any METHOD!**
