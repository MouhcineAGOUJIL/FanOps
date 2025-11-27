#!/bin/bash

# VM Setup Script - Run this on the Azure VM after SSH
# This script installs dependencies and sets up the monitoring service

set -e

echo "🔧 M1 Monitoring Service - VM Setup"
echo "===================================="

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Python 3.11
echo "🐍 Installing Python 3.11..."
sudo apt install -y python3.11 python3.11-venv python3-pip

# Install system dependencies
echo "⚙️  Installing system dependencies..."
sudo apt install -y supervisor nginx git

# Clone repository (update with your repo URL)
echo "📂 Cloning repository..."
cd /home/azureuser
if [ ! -d "FanOps" ]; then
    echo "ℹ️  Please clone your repo manually:"
    echo "   git clone https://github.com/YOUR_USERNAME/FanOps.git"
    echo "   Then run this script again."
    exit 1
fi

# Navigate to monitoring service
cd FanOps/M1-flow-azure/monitoring-service

# Create virtual environment
echo "🔨 Creating Python virtual environment..."
python3.11 -m venv venv
source venv/bin/activate

# Install Python dependencies
echo "📚 Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file
echo "📝 Creating .env file..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "⚠️  Please edit .env and add your Azure Storage connection string:"
    echo "   nano .env"
fi

# Create systemd service
echo "⚙️  Creating systemd service..."
sudo tee /etc/systemd/system/monitoring.service > /dev/null <<EOF
[Unit]
Description=M1 Monitoring Service
After=network.target

[Service]
User=azureuser
WorkingDirectory=/home/azureuser/FanOps/M1-flow-azure/monitoring-service
Environment="PATH=/home/azureuser/FanOps/M1-flow-azure/monitoring-service/venv/bin"
ExecStart=/home/azureuser/FanOps/M1-flow-azure/monitoring-service/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8080
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Configure nginx
echo "🌐 Configuring Nginx..."
sudo tee /etc/nginx/sites-available/monitoring > /dev/null <<'EOF'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # WebSocket support
        proxy_read_timeout 86400;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/monitoring /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

# Enable and start service
echo "🚀 Starting monitoring service..."
sudo systemctl daemon-reload
sudo systemctl enable monitoring
sudo systemctl start monitoring

# Check status
echo ""
echo "✅ Setup Complete!"
echo ""
echo "📊 Service Status:"
sudo systemctl status monitoring --no-pager || true
echo ""
echo "🔗 Service URL: http://$(curl -s ifconfig.me)/"
echo ""
echo "📝 Useful Commands:"
echo "   Check logs:    sudo journalctl -u monitoring -f"
echo "   Restart:       sudo systemctl restart monitoring"
echo "   Stop:          sudo systemctl stop monitoring"
echo "   Nginx logs:    sudo tail -f /var/log/nginx/error.log"
echo ""
echo "⚠️  Don't forget to:"
echo "   1. Edit .env file: nano /home/azureuser/FanOps/M1-flow-azure/monitoring-service/.env"
echo "   2. Restart service: sudo systemctl restart monitoring"
