# 🚀 M1 IaaS Implementation - Step-by-Step Guide

## 📋 Overview

This guide adds a **persistent real-time monitoring VM** alongside your existing Azure Functions.

**What Changes:**
- ✅ **Azure Functions (PaaS)**: Keep as-is, still handles all APIs
- ✅ **Frontend**: Works as before + optional WebSocket for real-time updates
- 🆕 **Azure VM (IaaS)**: New 24/7 monitoring daemon

**Backward Compatibility:** 100% - existing frontend & APIs work unchanged.

---

## Step 1: Create Monitoring Service (Local Development)

### 1.1 Create Project Structure

```bash
cd M1-flow-azure
mkdir -p monitoring-service
cd monitoring-service
```

### 1.2 Create Files

I'll create these files for you:
- `main.py` - FastAPI app with WebSocket
- `stream_processor.py` - Real-time data streaming
- `metrics_aggregator.py` - Metrics calculation
- `config.py` - Configuration
- `requirements.txt` - Dependencies

### 1.3 Install & Test Locally

```bash
# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# OR
source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Run locally
uvicorn main:app --host 0.0.0.0 --port 8080 --reload
```

**Test:**
```bash
# Health check
curl http://localhost:8080/

# Get current gates
curl http://localhost:8080/api/realtime/gates?stadiumId=AGADIR

# WebSocket test (use browser dev tools)
ws = new WebSocket('ws://localhost:8080/ws/gates?stadiumId=AGADIR')
ws.onmessage = (e) => console.log(JSON.parse(e.data))
```

---

## Step 2: Create Azure VM

### 2.1 Via Azure Portal (Easiest)

1. **Go to Azure Portal** → Search "Virtual Machines" → **Create**

2. **Basics:**
   - **Resource Group**: `rg-fanops-m1` (same as Functions)
   - **VM Name**: `vm-m1-monitoring`
   - **Region**: `France Central`
   - **Image**: `Ubuntu Server 22.04 LTS`
   - **Size**: `Standard_B1s` (1 vCPU, 1GB RAM, ~$7.50/month)
   - **Authentication**: SSH public key
     - Username: `azureuser`
     - Generate new key pair → Download `vm-m1-monitoring.pem`

3. **Disks:**
   - OS disk: `30GB Standard SSD`

4. **Networking:**
   - **Virtual Network**: Create new or use existing
   - **Public IP**: Yes (Standard)
   - **Inbound ports**: `22 (SSH), 80 (HTTP), 443 (HTTPS), 8080 (WebSocket)`

5. **Management:**
   - **Auto-shutdown**: Enable (e.g., 11 PM daily to save costs during dev)

6. **Review + Create** → Wait ~5 minutes

7. **Download SSH key** when prompted

### 2.2 Via Azure CLI (Faster)

```bash
# Create VM
az vm create \
  --resource-group rg-fanops-m1 \
  --name vm-m1-monitoring \
  --image Ubuntu2204 \
  --size Standard_B1s \
  --admin-username azureuser \
  --generate-ssh-keys \
  --public-ip-sku Standard \
  --location francecentral

# Open ports
az vm open-port --resource-group rg-fanops-m1 --name vm-m1-monitoring --port 22 --priority 1000
az vm open-port --resource-group rg-fanops-m1 --name vm-m1-monitoring --port 80 --priority 1001
az vm open-port --resource-group rg-fanops-m1 --name vm-m1-monitoring --port 443 --priority 1002
az vm open-port --resource-group rg-fanops-m1 --name vm-m1-monitoring --port 8080 --priority 1003

# Get public IP
az vm show -d --resource-group rg-fanops-m1 --name vm-m1-monitoring --query publicIps -o tsv
```

**Save the Public IP** - you'll need it!

---

## Step 3: Deploy to Azure VM

### 3.1 SSH into VM

```bash
# Set permissions on SSH key
chmod 400 vm-m1-monitoring.pem

# SSH into VM (replace with your public IP)
ssh -i vm-m1-monitoring.pem azureuser@<PUBLIC_IP>
```

### 3.2 Install Dependencies on VM

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python 3.11
sudo apt install -y python3.11 python3.11-venv python3-pip

# Install supervisor (for process management)
sudo apt install -y supervisor

# Install nginx (reverse proxy)
sudo apt install -y nginx

# Install git
sudo apt install -y git
```

### 3.3 Deploy Application

```bash
# Clone your repo (or upload files via SCP)
git clone https://github.com/YOUR_USERNAME/FanOps.git
cd FanOps/M1-flow-azure/monitoring-service

# Create venv
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
nano .env
```

**Add to `.env`:**
```env
AZURE_STORAGE_CONNECTION_STRING=<your_connection_string>
TABLE_NAME_GATES=gatestatus
STADIUM_ID=AGADIR
LOG_LEVEL=INFO
```

### 3.4 Configure Systemd Service

```bash
sudo nano /etc/systemd/system/monitoring.service
```

**Add:**
```ini
[Unit]
Description=M1 Monitoring Service
After=network.target

[Service]
User=azureuser
WorkingDirectory=/home/azureuser/FanOps/M1-flow-azure/monitoring-service
Environment="PATH=/home/azureuser/FanOps/M1-flow-azure/monitoring-service/venv/bin"
ExecStart=/home/azureuser/FanOps/M1-flow-azure/monitoring-service/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8080
Restart=always

[Install]
WantedBy=multi-user.target
```

**Enable and start:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable monitoring
sudo systemctl start monitoring
sudo systemctl status monitoring
```

### 3.5 Configure Nginx Reverse Proxy

```bash
sudo nano /etc/nginx/sites-available/monitoring
```

**Add:**
```nginx
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Enable:**
```bash
sudo ln -s /etc/nginx/sites-available/monitoring /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Step 4: Frontend Integration (Optional WebSocket)

### 4.1 Update Frontend .env

```env
VITE_MONITORING_VM_URL=http://<VM_PUBLIC_IP>
VITE_WS_URL=ws://<VM_PUBLIC_IP>/ws/gates
```

### 4.2 Create WebSocket Service

**`frontend/src/services/monitoringService.js`:**

```javascript
class MonitoringService {
  constructor() {
    this.ws = null;
    this.reconnectInterval = 5000;
    this.listeners = [];
  }

  connect(stadiumId) {
    const wsUrl = import.meta.env.VITE_WS_URL;
    this.ws = new WebSocket(`${wsUrl}?stadiumId=${stadiumId}`);

    this.ws.onopen = () => {
      console.log('✅ WebSocket connected');
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.listeners.forEach(callback => callback(data));
    };

    this.ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('🔌 WebSocket closed, reconnecting...');
      setTimeout(() => this.connect(stadiumId), this.reconnectInterval);
    };
  }

  subscribe(callback) {
    this.listeners.push(callback);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const monitoringService = new MonitoringService();
```

### 4.3 Update FlowManagement.jsx (Optional)

**Add real-time updates:**

```javascript
import { monitoringService } from '../../services/monitoringService';

useEffect(() => {
  // Connect WebSocket for real-time updates
  monitoringService.connect('AGADIR');
  
  monitoringService.subscribe((data) => {
    setGateStatus(data);  // Auto-updates UI
  });

  return () => monitoringService.disconnect();
}, []);
```

---

## Step 5: Testing

### 5.1 Test VM Service

```bash
# From your local machine
curl http://<VM_PUBLIC_IP>/

# Should return: {"status":"healthy","service":"M1 Monitoring"}
```

### 5.2 Test WebSocket

**Browser Console:**
```javascript
const ws = new WebSocket('ws://<VM_PUBLIC_IP>/ws/gates?stadiumId=AGADIR');
ws.onmessage = (e) => console.log(JSON.parse(e.data));
```

### 5.3 Send Test Data

```bash
# Send data to Azure Functions (existing API)
curl -X POST https://func-m1-fanops-comehdi....azurewebsites.net/api/flow/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "stadiumId": "AGADIR",
    "gateId": "G1",
    "ts": "2025-11-26T11:00:00Z",
    "perMinuteCount": 50,
    "avgProcessingTime": 4.0,
    "queueLength": 150
  }'

# WebSocket should receive update immediately!
```

---

## Step 6: CORS Configuration

### 6.1 Add VM to Azure Functions CORS

```bash
# Get VM public IP
VM_IP=<your_vm_ip>

# Add to Functions CORS
az functionapp cors add \
  --resource-group rg-fanops-m1 \
  --name func-m1-fanops-comehdi \
  --allowed-origins http://$VM_IP
```

---

## Architecture Comparison

### Before (PaaS Only):
```
Frontend (React)
    ↓ HTTP Polling every 3s
Azure Functions (Serverless)
    ↓
Azure Storage
```

### After (Hybrid PaaS + IaaS):
```
Frontend (React)
    ↓ HTTP (existing) OR WebSocket (new, optional)
    ├─→ Azure Functions (PaaS) - APIs, ML, AI
    │       ↓
    │   Azure Storage
    │       ↑
    └─→ Azure VM (IaaS) - Real-time monitoring, WebSocket
```

---

## UI Communication Changes

### Option 1: Keep HTTP (No Changes)
```javascript
// Existing code - continues to work
const status = await flowService.getGateStatus('AGADIR');
```

### Option 2: Add WebSocket (Enhanced)
```javascript
// New real-time updates
monitoringService.connect('AGADIR');
monitoringService.subscribe((data) => {
  updateDashboard(data);  // Live updates, no polling
});
```

### Option 3: Hybrid (Recommended)
```javascript
// Initial load from Functions API
const status = await flowService.getGateStatus('AGADIR');
setGateStatus(status);

// Then subscribe to real-time updates
monitoringService.subscribe((data) => {
  setGateStatus(data);  // Automatic updates
});
```

---

## Cost Breakdown

| Component | Monthly Cost |
|-----------|--------------|
| Azure Functions | ~$2 |
| Azure Storage | ~$1 |
| OpenAI API | ~$10 |
| **Azure VM B1s** | **+$7.50** |
| **Total** | **~$20.50** |

**Savings Tip:** Enable auto-shutdown during nights/weekends for dev.

---

## Monitoring & Maintenance

### Check Service Status
```bash
ssh -i vm-m1-monitoring.pem azureuser@<VM_IP>
sudo systemctl status monitoring
sudo journalctl -u monitoring -f  # Live logs
```

### Restart Service
```bash
sudo systemctl restart monitoring
```

### Update Code
```bash
cd /home/azureuser/FanOps
git pull
cd M1-flow-azure/monitoring-service
source venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart monitoring
```

---

## Next Steps

1. **Create monitoring service code** (I'll do this next)
2. **Create deployment scripts** (automated setup)
3. **Test locally**
4. **Deploy to Azure VM**
5. **Update frontend** (optional WebSocket)

Ready to proceed? I'll create all the service code now!
