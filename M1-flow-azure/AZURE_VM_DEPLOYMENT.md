# 🚀 Azure VM Deployment - Quick Guide

## Prerequisites Checklist
- ✅ Local testing passed
- ✅ Azure CLI installed (`az --version`)
- ✅ Azure CLI logged in (`az login`)
- ✅ Git repository accessible (for cloning to VM)

---

## Step 1: Create Azure VM (Choose One Method)

### Option A: Automated Script (Recommended - 5 minutes)

```bash
cd M1-flow-azure/iaas-deployment

# Make script executable (Git Bash on Windows)
chmod +x deploy-vm.sh

# Run deployment
./deploy-vm.sh
```

**This will:**
- Create VM `vm-m1-monitoring` in `rg-fanops-m1`
- Open ports 22, 80, 443, 8080
- Output the public IP

**Save the public IP!** You'll need it.

---

### Option B: Manual Azure Portal (15 minutes)

1. **Go to**: https://portal.azure.com
2. **Search**: "Virtual Machines" → **Create**
3. **Configure**:
   - Resource Group: `rg-fanops-m1`
   - VM Name: `vm-m1-monitoring`
   - Region: `France Central`
   - Image: `Ubuntu Server 22.04 LTS`
   - Size: `Standard_B1s` (1 vCPU, 1GB RAM)
   - Authentication: SSH public key
     - Username: `azureuser`
     - Generate new key pair → **Download the .pem file**
4. **Networking**:
   - Public IP: Yes
   - Inbound ports: 22, 80, 443, 8080
5. **Review + Create** → Wait ~5 min

**Get Public IP:** VM → Overview → Public IP address

---

## Step 2: Prepare Deployment Files

### 2.1 Get Storage Connection String

**Azure Portal:**
1. Go to your Storage Account (the one Functions uses)
2. Security + networking → Access keys
3. **Copy** "Connection string" from key1

**Azure CLI:**
```bash
az storage account show-connection-string \
  --name <YOUR_STORAGE_ACCOUNT> \
  --resource-group rg-fanops-m1 \
  --query connectionString -o tsv
```

Save this - you'll need it in Step 4!

### 2.2 Prepare .env File

Create the production .env file locally:
```bash
cd M1-flow-azure/monitoring-service
cp .env.example .env.production

# Edit .env.production with production values
notepad .env.production
```

**Add:**
```env
AZURE_STORAGE_CONNECTION_STRING=<YOUR_CONNECTION_STRING_FROM_STEP_2.1>
TABLE_NAME_GATES=gatestatus
STADIUM_ID=AGADIR
LOG_LEVEL=INFO
```

---

## Step 3: Upload Files to VM

### 3.1 Upload Setup Script

**Using SCP (Git Bash on Windows):**
```bash
cd M1-flow-azure/iaas-deployment

# Upload setup script
scp -i ~/.ssh/id_rsa vm-setup.sh azureuser@<VM_PUBLIC_IP>:~/

# Upload .env file
scp -i ~/.ssh/id_rsa ../monitoring-service/.env.production azureuser@<VM_PUBLIC_IP>:~/.env
```

**Or manually copy later via nano/vim after SSH**

---

## Step 4: SSH into VM

```bash
# SSH into VM
ssh azureuser@<VM_PUBLIC_IP>

# If using downloaded .pem file:
chmod 400 vm-m1-monitoring.pem
ssh -i vm-m1-monitoring.pem azureuser@<VM_PUBLIC_IP>
```

You should see Ubuntu welcome message!

---

## Step 5: Install on VM

### 5.1 Upload Code (Choose One)

**Option A: Git Clone (if repo is public/accessible)**
```bash
git clone https://github.com/YOUR_USERNAME/FanOps.git
cd FanOps/M1-flow-azure
```

**Option B: Upload via SCP (from local machine)**
```bash
# From your local machine (new terminal)
cd M1-flow-azure
tar -czf monitoring-service.tar.gz monitoring-service/
scp monitoring-service.tar.gz azureuser@<VM_IP>:~/

# Back on VM
tar -xzf monitoring-service.tar.gz
cd monitoring-service
```

### 5.2 Run Setup Script

```bash
# Make executable
chmod +x ~/vm-setup.sh

# Run setup
./vm-setup.sh
```

**This will install:**
- Python 3.11
- Nginx
- Supervisor
- All dependencies
- Configure systemd service
- Start the monitoring service

### 5.3 Configure Environment

```bash
# Edit .env file
cd /home/azureuser/FanOps/M1-flow-azure/monitoring-service
nano .env

# Paste your connection string from Step 2.1
# Save: Ctrl+X, Y, Enter
```

**Or if you uploaded .env earlier:**
```bash
mv ~/.env /home/azureuser/FanOps/M1-flow-azure/monitoring-service/.env
```

### 5.4 Restart Service

```bash
sudo systemctl restart monitoring
sudo systemctl status monitoring
```

Should show: **Active: active (running)**

---

## Step 6: Test Deployment

### 6.1 Health Check

```bash
# From VM
curl http://localhost:8080/

# From your local machine
curl http://<VM_PUBLIC_IP>/
```

**Expected:**
```json
{"status":"healthy","service":"M1 Monitoring","version":"1.0.0"}
```

### 6.2 Test Gate Status

```bash
curl http://<VM_PUBLIC_IP>/api/realtime/gates?stadiumId=AGADIR
```

### 6.3 Test WebSocket

**Browser Console:**
```javascript
const ws = new WebSocket('ws://<VM_PUBLIC_IP>/ws/gates?stadiumId=AGADIR');
ws.onmessage = (e) => console.log('Update:', JSON.parse(e.data));
ws.onopen = () => console.log('✅ Connected!');
```

---

## Step 7: Update Frontend (Optional)

### 7.1 Update .env

```bash
cd frontend
nano .env
```

**Add:**
```env
VITE_MONITORING_VM_URL=http://<VM_PUBLIC_IP>
VITE_WS_URL=ws://<VM_PUBLIC_IP>/ws/gates
```

### 7.2 No code changes needed!

The monitoring service is now available, but frontend continues to work with existing Functions API.

---

## Step 8: Configure CORS on Azure Functions

```bash
# Add VM to Functions CORS
az functionapp cors add \
  --resource-group rg-fanops-m1 \
  --name func-m1-fanops-comehdi \
  --allowed-origins http://<VM_PUBLIC_IP>
```

---

## ✅ Success Checklist

- [ ] VM created and accessible via SSH
- [ ] Monitoring service running (`systemctl status monitoring`)
- [ ] Health check works (`curl http://<VM_IP>/`)
- [ ] Gate status API works
- [ ] WebSocket connects from browser
- [ ] Nginx reverse proxy working (port 80)
- [ ] Service auto-starts on VM reboot

---

## 🔍 Troubleshooting

### Service won't start
```bash
# Check logs
sudo journalctl -u monitoring -f

# Check Python errors
sudo journalctl -u monitoring --no-pager | grep -i error
```

### Can't connect from outside
```bash
# Check firewall (should allow 80, 8080)
sudo ufw status

# Check nginx
sudo systemctl status nginx
sudo nginx -t
```

### No data from Azure Tables
```bash
# Verify .env has correct connection string
cat .env | grep AZURE_STORAGE

# Test connection manually
cd monitoring-service
source venv/bin/activate
python -c "from config import settings; print(settings.AZURE_STORAGE_CONNECTION_STRING[:50])"
```

---

## 📊 Monitoring the VM

### View Logs
```bash
# Service logs
sudo journalctl -u monitoring -f

# Nginx access
sudo tail -f /var/log/nginx/access.log

# Nginx errors
sudo tail -f /var/log/nginx/error.log
```

### Restart Service
```bash
sudo systemctl restart monitoring
```

### Update Code
```bash
cd /home/azureuser/FanOps
git pull
sudo systemctl restart monitoring
```

---

## 💰 Cost Management

**Auto-shutdown:**
```bash
# Via Azure Portal
VM → Auto-shutdown → Enable
Set time: 11:00 PM daily
```

**Monthly cost: ~$7.50**

---

## 🎉 You're Done!

Your monitoring service is now running 24/7 on Azure VM!

**URLs:**
- Health: `http://<VM_IP>/`
- API: `http://<VM_IP>/api/realtime/gates?stadiumId=AGADIR`
- WebSocket: `ws://<VM_IP>/ws/gates?stadiumId=AGADIR`

**Next:** Update your frontend to use WebSocket for real-time updates (optional)
