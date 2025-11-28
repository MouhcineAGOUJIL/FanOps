# M1 IaaS Deployment - Quick Reference

## 🎯 Quick Start

### Option 1: Azure Portal (GUI)
1. Go to portal.azure.com → Virtual Machines → Create
2. Use settings from `IAAS_IMPLEMENTATION_GUIDE.md` Step 2.1
3. SSH into VM and run `vm-setup.sh`

### Option 2: Azure CLI (Automated)
```bash
cd iaas-deployment
chmod +x deploy-vm.sh
./deploy-vm.sh
```

## 📁 Files in this Directory

- **deploy-vm.sh** - Creates Azure VM via CLI
- **vm-setup.sh** - Installs dependencies on VM
- **README.md** - This file

## 🔧 Manual Deployment Steps

### 1. Create VM
```bash
./deploy-vm.sh
# Save the public IP!
```

### 2. Upload setup script to VM
```bash
scp vm-setup.sh azureuser@<PUBLIC_IP>:~/
```

### 3. SSH into VM
```bash
ssh azureuser@<PUBLIC_IP>
```

### 4. Run setup
```bash
chmod +x vm-setup.sh
./vm-setup.sh
```

### 5. Configure environment
```bash
cd FanOps/M1-flow-azure/monitoring-service
nano .env
# Add your Azure Storage connection string
```

### 6. Restart service
```bash
sudo systemctl restart monitoring
```

### 7. Test
```bash
curl http://<PUBLIC_IP>/
```

## 🧪 Testing

### Health Check
```bash
curl http://<PUBLIC_IP>/
```

### Get Gate Status
```bash
curl http://<PUBLIC_IP>/api/realtime/gates?stadiumId=AGADIR
```

### WebSocket Test
```javascript
// In browser console
const ws = new WebSocket('ws://<PUBLIC_IP>/ws/gates?stadiumId=AGADIR');
ws.onmessage = (e) => console.log(JSON.parse(e.data));
```

## 📊 Monitoring

### Check Service
```bash
sudo systemctl status monitoring
```

### View Logs
```bash
# Service logs
sudo journalctl -u monitoring -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 🔄 Updates

### Pull latest code
```bash
cd /home/azureuser/FanOps
git pull
sudo systemctl restart monitoring
```

## 💰 Cost Estimation

**Azure VM B1s:**
- 1 vCPU, 1GB RAM
- ~$7.50/month (730 hours)
- Add ~$1/month for storage

**Total: ~$8.50/month**

## 🛑 Cleanup

### Delete VM (CLI)
```bash
az vm delete \
  --resource-group rg-fanops-m1 \
  --name vm-m1-monitoring \
  --yes
```

### Delete VM (Portal)
1. Go to Virtual Machines
2. Select `vm-m1-monitoring`
3. Click Delete → Confirm
