# 🛡️ FanOps Security Operations Guide (Unified Portal)

Since Microsoft has unified **Sentinel** and **Defender**, you now manage everything in the **Microsoft Defender Portal** (security.microsoft.com).

This guide explains how to connect the final piece (Amplify) and how to use the advanced SOC features in the new interface.

---

## 🔌 Part 1: Connecting AWS Amplify to Sentinel

You have already connected the **Application** (Frontend code) via Application Insights. This is the most important part.

To connect the **Hosting Infrastructure** (Amplify Access Logs) to see "who visited the URL" even if the React app didn't load:

1.  **Enable Access Logs in AWS**:
    *   Go to **AWS Amplify Console** > Your App > **Access logs**.
    *   Click **Enable**.
    *   *Note: Amplify stores these logs in S3.*

2.  **Ingest into Sentinel**:
    *   In the **Microsoft Defender Portal**, go to **Settings** > **Microsoft Sentinel** > **Data Connectors**.
    *   Search for **"Amazon Web Services S3"**.
    *   Configure it to pull logs from the S3 bucket where Amplify saves its logs.

*Recommendation: For this project, the **Application Insights** connection you already built is sufficient for 95% of security use cases.*

---

## 🚨 Part 2: Incidents (The "Inbox" of Security)

When Sentinel detects a threat (like the "Brute Force" rule we created), it creates an **Incident**.

1.  **Navigate**: Go to **Incidents & alerts** > **Incidents**.
2.  **Triage**:
    *   Click an incident to see the **Attack Story**.
    *   **Graph View**: Shows you the visual link between the *User*, the *IP Address*, and the *Failed Login Event*.
3.  **Action**:
    *   **Investigate**: Right-click an IP to see "Geo location" or "Related alerts".
    *   **Remediate**: If you had the AWS connector fully write-enabled, you could click "Isolate Machine" (for EC2). For now, you manually block the user in DynamoDB.

---

## 🕵️ Part 3: Threat Hunting (Advanced Hunting)

This is where you run the KQL queries. In the new portal, it's called **Advanced Hunting**.

1.  **Navigate**: Go to **Hunting** > **Advanced hunting**.
2.  **Run Queries**: Use the `AppEvents` table we fixed.

**Scenario: Find "Impossible Travel" (Login from 2 countries in 1 hour)**
```kusto
AppEvents
| where Name == "Login_Success"
| extend City = tostring(Properties.client_City) // App Insights adds this automatically
| summarize Cities = make_set(City) by tostring(Properties.username), bin(TimeGenerated, 1h)
| where array_length(Cities) > 1
```

---

## ⚙️ Part 4: SOC Optimization

This is a new feature that helps you tune your security center.

1.  **Navigate**: Go to **System** > **SOC optimization** (or search "SOC Optimization" in the top bar).
2.  **What it does**:
    *   **Recommendations**: It will tell you "You are ingesting AWS logs but don't have an alert for 'Root User Login'. Click here to enable it."
    *   **False Positive Tuning**: If your "Brute Force" alert fires too often (e.g., when you are testing), it will suggest: "This alert fires 50 times a day. Do you want to increase the threshold?"

---

## 🏆 Summary of Your Security Stack

| Layer | Technology | Status | Where to View |
| :--- | :--- | :--- | :--- |
| **Frontend Code** | App Insights SDK | ✅ Connected | `AppEvents` table |
| **Backend Code** | AWS Lambda | ✅ Connected | `AWSCloudWatch` table |
| **Infrastructure** | AWS Amplify | ⚠️ Optional | `AWSCloudTrail` (if enabled) |
| **Management** | Microsoft Defender | ✅ Ready | **Incidents** Blade |
