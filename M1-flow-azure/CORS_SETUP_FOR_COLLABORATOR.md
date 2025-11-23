# 🔧 Enable CORS for M1 Flow Frontend Integration

## Issue
The M1 Flow Management API works with curl but fails in the browser due to CORS restrictions.

## What You Need to Do (5 minutes)

### Step 1: Go to Azure Portal
1. Open **Azure Portal**: https://portal.azure.com
2. Sign in with your account

### Step 2: Find the Function App
1. In the search bar at the top, type: **`func-m1-fanops-comehdi`**
2. Click on your Function App from the results

### Step 3: Configure CORS
1. In the left sidebar, scroll down to **"API"** section
2. Click on **"CORS"**
3. You'll see a list of "Allowed Origins"

### Step 4: Add Localhost Origins
In the "Enter an origin" field, add these THREE URLs (one at a time):

```
http://localhost:5173
```

Click **"Add"** or press Enter

```
http://localhost:5174
```

Click **"Add"** or press Enter

```
http://localhost:5175
```

Click **"Add"** or press Enter

### Step 5: Save Changes
1. Click **"Save"** button at the top of the page
2. Wait for the confirmation message: "Successfully updated CORS rules"

---

## ✅ That's It!

The frontend will now be able to connect to the M1 API from the browser.

---

## Visual Guide (What You'll See)

```
Azure Portal
  ├── Search: func-m1-fanops-comehdi
  ├── Click on Function App
  ├── Left Menu → API → CORS
  ├── Allowed Origins:
  │   ├── http://localhost:5173  ✅
  │   ├── http://localhost:5174  ✅
  │   └── http://localhost:5175  ✅
  └── Click "Save" button
```

---

## Why This is Needed

- **Browsers enforce CORS** security policy
- **Curl doesn't have CORS** (that's why it works)
- **Azure Functions block browsers by default** unless origins are whitelisted
- **Adding localhost** allows the frontend to make API calls during development

---

## For Production Later

When deploying to production, also add:
```
https://your-production-frontend-url.azurewebsites.net
```

**Important**: Remove localhost origins in production!

---

## Questions?

If you have any issues:
1. Make sure you clicked "Save" after adding origins
2. Try refreshing the Function App page
3. The change takes effect immediately (no restart needed)
