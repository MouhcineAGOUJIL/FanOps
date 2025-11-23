# 🌐 Enable M1 API Access from Anywhere

## Quick Solution: Allow All Origins

### Step 1: Go to Azure Portal
1. Open: https://portal.azure.com
2. Search: **`func-m1-fanops-comehdi`**
3. Click on the Function App

### Step 2: Configure CORS for All Origins
1. Left menu → **API** → **CORS**
2. In the "Allowed Origins" section, **check the box**:
   ```
   ☑️ Enable Access-Control-Allow-Credentials
   ```
3. Add this single origin:
   ```
   *
   ```
   (Just type asterisk and click Add)

4. **Remove** any specific localhost entries (optional, if * is present)
5. Click **"Save"**

---

## What This Does

✅ **Allows access from:**
- Any localhost port (5173, 5174, etc.)
- Any IP address
- Any domain
- Any deployed frontend

---

## ⚠️ Security Note

**For Development/Demo:**
- ✅ Using `*` is **fine** for development and demos
- ✅ Makes testing easier
- ✅ Allows team members to access from anywhere

**For Production:**
- ⚠️ Using `*` is **less secure** but acceptable if:
  - API has authentication (function keys)
  - Data is not sensitive
  - You want public access

**For High Security Production:**
Replace `*` with specific domains:
```
https://your-frontend.azurewebsites.net
https://your-custom-domain.com
```

---

## Alternative: Enable CORS in Function Code

If your collaborator can't access Azure Portal, add this to `host.json`:

```json
{
  "version": "2.0",
  "extensions": {
    "http": {
      "routePrefix": "api",
      "cors": {
        "allowedOrigins": ["*"],
        "allowedMethods": ["GET", "POST", "OPTIONS"],
        "allowedHeaders": ["*"],
        "exposedHeaders": ["*"]
      }
    }
  }
}
```

Then redeploy the function.

---

## Verify It Works

After enabling `*`:

```bash
# Test from browser - should work now
curl -H "Origin: http://any-domain.com" \
  "https://func-m1-fanops-comehdi-fwgeaxhwambjcsev.francecentral-01.azurewebsites.net/api/flow/status?stadiumId=AGADIR"
```

Frontend will work from:
- ✅ localhost (any port)
- ✅ Your IP address
- ✅ Deployed Azure Static Web App
- ✅ Any other hosting

---

## Summary

**Tell your collaborator:**

> In Azure Portal → Function App → CORS settings:
> 1. Add: `*`
> 2. Click Save
> 
> This allows the API to be called from anywhere!
