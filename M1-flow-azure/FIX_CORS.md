# 🔧 Fix CORS Error - Enable Frontend Access

## Problem
Frontend at `http://localhost:5173` can't access M1 APIs due to CORS policy.

Error:
```
Access-Control-Allow-Origin' header is not present
```

---

## ✅ Solution: Enable CORS in Azure Portal

### Method 1: Azure Portal (EASIEST - 2 minutes)

1. **Go to Azure Portal**: https://portal.azure.com
2. **Find your Function App**: `func-m1-fanops-comehdi`
3. **Click on "CORS"** (in left menu under "API")
4. **Add Allowed Origins**:
   ```
   http://localhost:5173
   http://localhost:3000
   *
   ```
  > **Note**: Using `*` allows all origins (development only). For production, specify exact domains.

5. **Click "Save"**
6. **Wait 30 seconds** for it to apply

---

### Method 2: Azure CLI (ALTERNATIVE)

If you prefer command line:

```bash
az functionapp cors add \
  --resource-group rg-fanops-m1 \
  --name func-m1-fanops-comehdi \
  --allowed-origins http://localhost:5173 http://localhost:3000 *
```

---

### Method 3: Quick Test (allows all origins temporarily)

```bash
az functionapp cors add \
  --resource-group rg-fanops-m1 \
  --name func-m1-fanops-comehdi \
  --allowed-origins *
```

---

## Verify It Worked

1. **Refresh your browser** (F5)
2. **Check console** - CORS error should be gone
3. **Dashboard should load** gate data successfully

---

## Expected Result

✅ **Before CORS fix**:
```
Access-Control-Allow-Origin' header is not present
Failed to fetch gates
```

✅ **After CORS fix**:
```
GET /api/flow/status?stadiumId=AGADIR 200 OK
Gates loaded successfully
```

---

## 🚀 Quick Check

Test this in browser:
```
https://func-m1-fanops-comehdi-fwgeaxhwambjcsev.francecentral-01.azurewebsites.net/api/flow/status?stadiumId=AGADIR
```

If it opens → M1 works  
If frontend fails → CORS not enabled yet

---

**Do this now in Azure Portal and the frontend will immediately connect!** 🎉
