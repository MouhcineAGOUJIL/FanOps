#!/bin/bash

# Azure VM Deployment Script for M1 Monitoring Service
# This script creates an Azure VM and deploys the monitoring service

set -e  # Exit on any error

echo "🚀 M1 IaaS Deployment - Creating Azure VM..."

# Configuration
RESOURCE_GROUP="rg-fanops-m1"
VM_NAME="vm-m1-monitoring"
LOCATION="francecentral"
VM_SIZE="Standard_B1s"
IMAGE="Ubuntu2204"
ADMIN_USER="azureuser"

# Check if Azure CLI is logged in
if ! az account show &> /dev/null; then
    echo "❌ Please login to Azure CLI first: az login"
    exit 1
fi

# Create VM
echo "📦 Creating VM: $VM_NAME..."
az vm create \
  --resource-group $RESOURCE_GROUP \
  --name $VM_NAME \
  --image $IMAGE \
  --size $VM_SIZE \
  --admin-username $ADMIN_USER \
  --generate-ssh-keys \
  --public-ip-sku Standard \
  --location $LOCATION \
  --verbose

# Open required ports
echo "🔓 Opening ports (22, 80, 443, 8080)..."
az vm open-port --resource-group $RESOURCE_GROUP --name $VM_NAME --port 22 --priority 1000
az vm open-port --resource-group $RESOURCE_GROUP --name $VM_NAME --port 80 --priority 1001
az vm open-port --resource-group $RESOURCE_GROUP --name $VM_NAME --port 443 --priority 1002
az vm open-port --resource-group $RESOURCE_GROUP --name $VM_NAME --port 8080 --priority 1003

# Get public IP
PUBLIC_IP=$(az vm show -d --resource-group $RESOURCE_GROUP --name $VM_NAME --query publicIps -o tsv)

echo "✅ VM Created Successfully!"
echo ""
echo "📝 VM Details:"
echo "   Name: $VM_NAME"
echo "   Public IP: $PUBLIC_IP"
echo "   SSH Command: ssh $ADMIN_USER@$PUBLIC_IP"
echo ""
echo "🔗 Next Steps:"
echo "   1. SSH into the VM: ssh $ADMIN_USER@$PUBLIC_IP"
echo "   2. Run the setup script: ./vm-setup.sh"
echo "   3. Configure .env file with Azure credentials"
echo "   4. Test the service: curl http://$PUBLIC_IP/"
echo ""
echo "💰 Estimated Cost: ~\$7.50/month"
