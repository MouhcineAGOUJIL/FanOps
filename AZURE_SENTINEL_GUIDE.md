# 🛡️ Azure Sentinel SIEM Implementation Guide

## Overview
This guide explains how to implement **Azure Sentinel** as the central SIEM (Security Information and Event Management) for your FanOps project. By connecting your AWS M2 Security Service to Azure, you achieve a **Multi-Cloud Security Architecture**.

---

## 🏗️ Architecture

```mermaid
graph LR
    subgraph AWS [AWS Cloud (M2)]
        Lambda[Lambda Functions] --> CW[CloudWatch Logs]
        CT[CloudTrail] --> S3[S3 Bucket]
        EC2[Security VM (IaaS)] --> Agent[Azure Arc Agent]
    end

    subgraph Azure [Azure Cloud]
        Sentinel[Azure Sentinel]
        LAW[Log Analytics Workspace]
    end

    CW --> |Data Connector| Sentinel
    CT --> |Data Connector| Sentinel
    Agent --> |Syslog/Security Events| LAW
```

---

## 🚀 Step 1: Set up Azure Sentinel

1.  **Create Log Analytics Workspace**:
    *   Go to Azure Portal > Search "Log Analytics workspaces".
    *   Click **Create**.
    *   Resource Group: `FanOps-Security`.
    *   Name: `fanops-sentinel-workspace`.
    *   Region: `West Europe` (closest to AWS eu-west-1).

2.  **Enable Sentinel**:
    *   Search "Microsoft Sentinel".
    *   Click **Create**.
    *   Select the workspace you just created (`fanops-sentinel-workspace`).
    *   Click **Add**.

---

## 🔌 Step 2: Connect AWS Data

To ingest logs from AWS (M2) into Azure:

### Option A: AWS CloudTrail (Management Logs)
1.  In Sentinel, go to **Content Hub** (or Data Connectors).
2.  Search for **Amazon Web Services**.
3.  Select **Amazon Web Services (AWS)** (Legacy or New).
4.  **Configuration**:
    *   Create an IAM Role in AWS with `AWSCloudTrailReadOnlyAccess`.
    *   Enter the Role ARN in Azure Sentinel.
    *   Select the region (`eu-west-1`).
    *   Click **Connect**.

### Option B: CloudWatch Logs (Lambda Application Logs)
1.  **Create S3 Bucket** in AWS (e.g., `fanops-logs-archive`).
2.  **Export CloudWatch Logs** to this S3 bucket (can be automated via Lambda).
3.  Use the **AWS S3** connector in Sentinel to ingest these logs.

---

## 💻 Step 3: Connect IaaS (EC2)

Your EC2 instance (`SecurityTestInstance`) is an IaaS component. To monitor it:

1.  **Install Azure Arc** (optional but recommended for multi-cloud):
    *   In Azure, go to **Azure Arc** > **Servers** > **Add**.
    *   Generate a script for Linux (Ubuntu).
    *   SSH into your AWS EC2 instance.
    *   Run the script.
    
2.  **Install Log Analytics Agent**:
    *   Once connected via Arc, use Azure Policy to push the **Azure Monitor Agent (AMA)** to your AWS EC2.
    *   Configure it to collect `Syslog` and `auth.log`.

---

## 🔍 Step 4: Threat Detection (KQL)

Use **Kusto Query Language (KQL)** in Sentinel to detect threats.

### 1. Detect Failed Logins (from AWS Logs)
```kusto
AWSCloudTrail
| where EventName == "ConsoleLogin"
| where ResponseElements has "Failure"
| project TimeGenerated, UserIdentityArn, SourceIpAddress, ErrorMessage
```

### 2. Detect High Volume of Ticket Scans (Potential DDoS)
```kusto
AWSCloudWatchLogs
| where Message has "verifyTicket"
| summarize Count=count() by bin(TimeGenerated, 5m)
| where Count > 100
```

### 3. Correlate AWS and Azure Events
If you had Azure AD login logs, you could correlate them with AWS access:
```kusto
SigninLogs
| join kind=inner (
    AWSCloudTrail 
    | where EventName == "ConsoleLogin"
) on $left.UserPrincipalName == $right.UserIdentityUserName
```

---

## 📊 What Sentinel Provides

1.  **Incidents**: High-fidelity alerts grouped into incidents (e.g., "Multi-stage attack detected").
2.  **Workbooks**: Interactive dashboards (like Grafana) to visualize AWS traffic.
3.  **Playbooks**: Automation (Logic Apps) to respond to threats (e.g., "Block IP in AWS WAF when Sentinel detects brute force").
4.  **Hunting**: Proactive search for hidden threats using KQL.

---

## 📝 Summary

By implementing this, you achieve:
- **Single Pane of Glass**: View AWS M2 security alongside any future Azure resources.
- **Advanced AI**: Leverage Microsoft's security AI on your AWS data.
- **Compliance**: Long-term log retention in Log Analytics.
