#!/bin/bash

# Configuration
# REPLACE THIS WITH YOUR API URL
TARGET_URL="https://3cfc8hn4xa.execute-api.eu-west-1.amazonaws.com/dev"
# REPLACE THIS WITH YOUR BUCKET NAME (Check AWS Console after deployment)
BUCKET_NAME="can2025-secure-gates-security-reports-dev"

echo "🚀 Starting ZAP Installation..."

# 1. Update and install dependencies
sudo apt-get update
sudo apt-get install -y default-jdk awscli wget

# 2. Install OWASP ZAP
echo "📦 Downloading ZAP..."
wget https://github.com/zaproxy/zaproxy/releases/download/v2.14.0/ZAP_2.14.0_Linux.tar.gz
tar -xvf ZAP_2.14.0_Linux.tar.gz
sudo mv ZAP_2.14.0 /opt/zap
sudo ln -s /opt/zap/zap.sh /usr/bin/zap

# 3. Create Scan Script
echo "📝 Creating scan script..."
cat <<EOF > /home/ubuntu/daily_scan.sh
#!/bin/bash
DATE=\$(date +%Y-%m-%d)
REPORT_NAME="zap-report-\$DATE.html"
TARGET_URL="$TARGET_URL"
BUCKET_NAME="$BUCKET_NAME"

echo "Running ZAP Scan against \$TARGET_URL..."
# Run ZAP Quick Scan
/opt/zap/zap.sh -cmd -quickurl \$TARGET_URL -quickout /tmp/\$REPORT_NAME

echo "Uploading report to S3..."
# Upload to S3
aws s3 cp /tmp/\$REPORT_NAME s3://\$BUCKET_NAME/reports/\$REPORT_NAME
echo "Done!"
EOF

chmod +x /home/ubuntu/daily_scan.sh
chown ubuntu:ubuntu /home/ubuntu/daily_scan.sh

# 4. Setup Cron Job (Daily at 2 AM)
echo "⏰ Setting up Cron Job..."
(crontab -l 2>/dev/null; echo "0 2 * * * /home/ubuntu/daily_scan.sh >> /var/log/zap-cron.log 2>&1") | crontab -

echo "✅ Installation Complete!"
echo "You can run the scan manually now with: ./daily_scan.sh"
