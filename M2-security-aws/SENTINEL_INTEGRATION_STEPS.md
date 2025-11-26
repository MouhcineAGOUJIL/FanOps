# 🛡️ Azure Sentinel Integration Steps

You have successfully set up the basics. Now let's connect the data pipes!

## 1. ☁️ AWS Lambda Logs (M2) -> Sentinel

We have added a **Log Shipper** function to your Serverless configuration. It will automatically forward logs from `login`, `verifyTicket`, and `reportGate` to Sentinel.

### 🔑 Get Credentials
1.  Go to **Azure Portal**.
2.  Navigate to your **Log Analytics Workspace** (`fanops-sentinel-core`).
3.  In the left menu, under **Settings**, click **Agents management** (or "Agents").
4.  Copy:
    *   **Workspace ID**
    *   **Primary Key**

### 🚀 Deploy the Shipper
Run the following commands in your terminal (replace values with yours):

```bash
cd M2-security-aws

# Export credentials (temporary)
export SENTINEL_WORKSPACE_ID="YOUR_WORKSPACE_ID_HERE"
export SENTINEL_SHARED_KEY="YOUR_PRIMARY_KEY_HERE"

# Deploy
serverless deploy --stage dev
```

---

## 2. 💻 Frontend Telemetry -> Sentinel

Connect your React app to capture user-side errors and performance.

### 🔑 Get Connection String
1.  Go to **Azure Portal**.
2.  Navigate to **Application Insights** (`fanops-frontend-insights`).
    *   *If you haven't created it yet, create it and link it to your Log Analytics Workspace.*
3.  Copy the **Connection String** from the Overview blade.

### ⚙️ Configure Frontend
1.  Open `frontend/.env` (create it if missing).
2.  Add the connection string:

```env
VITE_APP_INSIGHTS_CONNECTION_STRING=InstrumentationKey=...;IngestionEndpoint=...
```

3.  Restart your frontend:
```bash
# In frontend directory
npm run dev
```

---

## 3. 🔍 Verify Data in Sentinel

After deploying and generating some traffic (login, scan tickets):

1.  Go to **Azure Sentinel** > **Logs**.
2.  Run this query to see **AWS Logs**:
    ```kusto
    FanOps_M2_CL
    | sort by TimeGenerated desc
    ```
3.  Run this query to see **Frontend Logs** (Page Views & API Calls):
    ```kusto
    AppRequests
    | sort by TimeGenerated desc
    ```

4.  Run this query to see **Custom Events** (Login/Logout):
    ```kusto
    AppEvents
    | where Name startswith "Login" or Name startswith "API"
    | sort by TimeGenerated desc
    ```

---

## 4. 🚨 Set Up Alerts

Go to **Sentinel** > **Analytics** > **Create** > **Scheduled Query Rule** and use the KQL queries from `SENTINEL_ALL_SERVICES_CONFIG.md`.
