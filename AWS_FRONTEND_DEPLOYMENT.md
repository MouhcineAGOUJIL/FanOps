# 🚀 Deploy Frontend to AWS

Complete guide to deploy CAN 2025 FanOps frontend to AWS using S3 + CloudFront.

---

## 📋 **Why AWS S3 + CloudFront?**

✅ **Super fast** - CloudFront CDN with global edge locations  
✅ **Cheap** - ~$1-2/month for small traffic  
✅ **Scalable** - Handles millions of users  
✅ **HTTPS** - Free SSL certificate  
✅ **Same platform as M2** - Everything in one place  

---

## 🎯 **Option 1: S3 + CloudFront (Recommended)**

Most common and cost-effective way to host React apps on AWS.

### **Step 1: Build Your App**

```bash
cd /home/red/Documents/S5/Cloud/FanOps/frontend

# Build production bundle
npm run build

# Output is in: ./dist
```

### **Step 2: Create S3 Bucket**

```bash
# Set variables
BUCKET_NAME="can2025-fanops-frontend"
REGION="eu-west-1"  # Same region as M2

# Create bucket
aws s3 mb s3://$BUCKET_NAME --region $REGION

# Configure for static website hosting
aws s3 website s3://$BUCKET_NAME \
  --index-document index.html \
  --error-document index.html
```

### **Step 3: Set Bucket Policy (Public Read)**

```bash
# Create policy file
cat > bucket-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::can2025-fanops-frontend/*"
    }
  ]
}
EOF

# Apply policy
aws s3api put-bucket-policy \
  --bucket $BUCKET_NAME \
  --policy file://bucket-policy.json
```

### **Step 4: Upload Built Files**

```bash
cd /home/red/Documents/S5/Cloud/FanOps/frontend

# Upload everything to S3
aws s3 sync ./dist s3://$BUCKET_NAME \
  --delete \
  --cache-control "max-age=31536000,public" \
  --exclude "index.html"

# Upload index.html separately (no cache)
aws s3 cp ./dist/index.html s3://$BUCKET_NAME/index.html \
  --cache-control "max-age=0,no-cache,no-store,must-revalidate"
```

### **Step 5: Get S3 Website URL**

```bash
echo "http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
```

**Your app is now live!** (HTTP only - we'll add HTTPS next)

---

## 🔒 **Step 6: Add CloudFront (HTTPS + CDN)**

### **Create CloudFront Distribution:**

```bash
# Create distribution config
cat > cloudfront-config.json << EOF
{
  "CallerReference": "can2025-$(date +%s)",
  "Comment": "CAN 2025 FanOps Frontend",
  "Enabled": true,
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-can2025-fanops",
        "DomainName": "$BUCKET_NAME.s3-website-$REGION.amazonaws.com",
        "CustomOriginConfig": {
          "HTTPPort": 80,
          "HTTPSPort": 443,
          "OriginProtocolPolicy": "http-only"
        }
      }
    ]
  },
  "DefaultRootObject": "index.html",
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-can2025-fanops",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"]
    },
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {"Forward": "none"}
    },
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000,
    "Compress": true
  },
  "ViewerCertificate": {
    "CloudFrontDefaultCertificate": true
  }
}
EOF

# Create distribution
aws cloudfront create-distribution \
  --distribution-config file://cloudfront-config.json
```

Or **use AWS Console** (easier):

1. Go to CloudFront Console: https://console.aws.amazon.com/cloudfront/
2. Click **"Create Distribution"**
3. **Origin domain**: Select your S3 bucket
4. **Viewer protocol policy**: Redirect HTTP to HTTPS
5. **Default cache behavior**: Compress objects
6. **Default root object**: `index.html`
7. Click **"Create Distribution"**

### **Wait 5-15 minutes for deployment**

CloudFront URL: `https://d1234abcd.cloudfront.net`

---

## 🌐 **Step 7: Custom Error Pages (Handle React Router)**

CloudFront needs to serve `index.html` for all 404s (SPA routing):

```bash
aws cloudfront update-distribution \
  --id YOUR_DISTRIBUTION_ID \
  --distribution-config '{
    "CustomErrorResponses": {
      "Quantity": 1,
      "Items": [{
        "ErrorCode": 404,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      }]
    }
  }'
```

Or in Console:
1. CloudFront → Your distribution → Error Pages
2. Create custom error response:
   - **HTTP Error Code**: 404
   - **Response Page Path**: `/index.html`
   - **HTTP Response Code**: 200

---

## 🚀 **Option 2: AWS Amplify (Easiest)**

AWS Amplify is specifically designed for frontend apps.

### **Deploy with Amplify CLI:**

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Configure Amplify
amplify configure

# Initialize in your project
cd /home/red/Documents/S5/Cloud/FanOps/frontend
amplify init

# Add hosting
amplify add hosting
# Choose: Hosting with Amplify Console
# Choose: Manual deployment

# Publish
amplify publish
```

### **Or Deploy via Amplify Console (GitHub):**

1. Go to AWS Amplify Console: https://console.aws.amazon.com/amplify/
2. Click **"New app"** → **"Host web app"**
3. **Connect GitHub** repository
4. **Branch**: main
5. **Build settings**:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - cd frontend
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: frontend/dist
       files:
         - '**/*'
     cache:
       paths:
         - frontend/node_modules/**/*
   ```
6. Click **"Save and deploy"**

**URL**: `https://main.d1234abcd.amplifyapp.com`

**Auto-deploys on every GitHub push!** ✨

---

## 📜 **Quick Deploy Script**

Save this as `deploy-aws-frontend.sh`:

```bash
#!/bin/bash

set -e

BUCKET_NAME="can2025-fanops-frontend"
REGION="eu-west-1"
DISTRIBUTION_ID=""  # Add after creating CloudFront

cd "$(dirname "$0")/frontend"

echo "🔨 Building frontend..."
npm run build

echo "☁️  Uploading to S3..."
aws s3 sync ./dist s3://$BUCKET_NAME \
  --delete \
  --cache-control "max-age=31536000,public" \
  --exclude "index.html"

aws s3 cp ./dist/index.html s3://$BUCKET_NAME/index.html \
  --cache-control "max-age=0,no-cache,no-store,must-revalidate"

if [ -n "$DISTRIBUTION_ID" ]; then
  echo "♻️  Invalidating CloudFront cache..."
  aws cloudfront create-invalidation \
    --distribution-id $DISTRIBUTION_ID \
    --paths "/*"
fi

echo "✅ Deployment complete!"
echo "🌐 URL: https://$DISTRIBUTION_ID.cloudfront.net"
```

Make executable:
```bash
chmod +x deploy-aws-frontend.sh
./deploy-aws-frontend.sh
```

---

## 💰 **Cost Breakdown**

### **S3 Costs:**
- Storage: $0.023/GB/month
- Requests: $0.0004 per 1,000 requests
- Data transfer: First 1 GB free, then $0.09/GB

**Example**: 100 MB site, 10K visits/month = **~$0.50/month**

### **CloudFront Costs:**
- First 1 TB: Free (first 12 months)
- After free tier: $0.085/GB
- Requests: $0.0075 per 10,000 HTTPS requests

**Example**: 10K visits, 50 GB transfer = **~$1.50/month**

### **Amplify Costs:**
- Build time: Free (1000 minutes/month)
- Storage: Free (15 GB)
- Data transfer: $0.15/GB

**Example**: 10K visits = **~$2/month**

**Total: $1-3/month** 💰

---

## 🔧 **Environment Variables**

Set production environment variables:

### **Option 1: In Build**

Create `frontend/.env.production`:

```bash
VITE_M2_API_URL=https://3cfc8hn4xa.execute-api.eu-west-1.amazonaws.com/dev
```

Rebuild and redeploy.

### **Option 2: Runtime (Advanced)**

Use AWS Systems Manager Parameter Store:

```bash
aws ssm put-parameter \
  --name "/fanops/frontend/api-url" \
  --value "https://api.example.com" \
  --type String
```

---

## 🧪 **Testing Before Deploy**

```bash
cd frontend

# Build
npm run build

# Test locally
npx serve dist -p 3000

# Open http://localhost:3000
```

---

## 🔄 **Continuous Deployment**

### **GitHub Actions** (Auto-deploy on push):

Create `.github/workflows/deploy-aws.yml`:

```yaml
name: Deploy to AWS S3

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
          
      - name: Build
        run: |
          cd frontend
          npm run build
          
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: eu-west-1
          
      - name: Deploy to S3
        run: |
          cd frontend
          aws s3 sync ./dist s3://can2025-fanops-frontend --delete
          
      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/*"
```

Add secrets in GitHub: Settings → Secrets → Actions:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `CLOUDFRONT_DISTRIBUTION_ID`

---

## 🚨 **Troubleshooting**

### **Blank page / 404 errors**

**Issue**: React Router routes don't work  
**Solution**: Configure CloudFront custom error pages (Step 7)

### **CSS/JS not loading**

**Issue**: Wrong paths  
**Solution**: Set `base` in `vite.config.js`:
```javascript
export default defineConfig({
  base: '/',
  // ...
})
```

### **CORS errors**

**Issue**: API calls blocked  
**Solution**: Update M2 CORS to allow CloudFront domain:
```
https://d1234abcd.cloudfront.net
```

---

## 📊 **Comparison: S3+CloudFront vs Amplify**

| Feature | S3 + CloudFront | Amplify |
|---------|-----------------|---------|
| **Ease** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Cost** | ~$1-2/month | ~$2-3/month |
| **Speed** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **GitHub CI/CD** | Manual setup | Built-in ✅ |
| **Custom domain** | ✅ | ✅ |
| **SSL** | ✅ Free | ✅ Free |

**Recommendation**: 
- **Amplify** if you want GitHub auto-deploy (easier)
- **S3+CloudFront** if you want full control (cheaper)

---

## ✅ **Deployment Checklist**

- [ ] Build completes successfully
- [ ] S3 bucket created and configured
- [ ] Files uploaded to S3
- [ ] CloudFront distribution created
- [ ] Custom error pages configured
- [ ] HTTPS working
- [ ] All routes work (React Router)
- [ ] API calls work
- [ ] Environment variables set

---

## 🎯 **Quick Start (Choose One)**

### Fastest: Amplify Console
1. Go to AWS Amplify Console
2. Connect GitHub
3. Click deploy
4. Done! ✨

### Most Control: S3 + CloudFront Script
1. Run: `./deploy-aws-frontend.sh`
2. Create CloudFront distribution
3. Done! 🚀

---

**Which option do you want to try? I recommend Amplify for simplicity!** 🎯
