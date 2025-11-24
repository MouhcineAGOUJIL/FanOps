# 🚀 Deploy Frontend to Azure Static Web Apps

Complete guide to deploy the CAN 2025 FanOps frontend to Azure.

---

## 📋 **Why Azure Static Web Apps?**

✅ **Perfect for React/Vite apps**  
✅ **Free SSL certificate** (HTTPS)  
✅ **Global CDN** (fast worldwide)  
✅ **GitHub integration** (auto-deploy on push)  
✅ **Custom domains** supported  
✅ **Free tier**: 100GB bandwidth/month  

**Cost**: **FREE** for this project! 🎉

---

## 🎯 **Option 1: Deploy via Azure Portal (GUI)**

### **Step 1: Build Your App**

```bash
cd /home/red/Documents/S5/Cloud/FanOps/frontend

# Build production bundle
npm run build
```

This creates a `dist` folder with optimized files.

### **Step 2: Create Static Web App in Azure**

1. **Go to Azure Portal**: https://portal.azure.com
2. Click **"Create a resource"**
3. Search: **"Static Web App"**
4. Click **"Create"**

### **Step 3: Configure Static Web App**

**Basics Tab:**
- **Subscription**: Your Azure subscription
- **Resource Group**: Create new → `fanops-frontend-rg`
- **Name**: `can2025-fanops` (will be: `can2025-fanops.azurestaticapps.net`)
- **Plan type**: **Free**
- **Region**: **West Europe** (closest to you)

**Deployment Tab:**
- **Source**: GitHub
- **Organization**: Your GitHub account
- **Repository**: `FanOps` (or your repo name)
- **Branch**: `main`

**Build Details:**
- **Build Presets**: `Vite`
- **App location**: `/frontend`
- **Api location**: *(leave empty)*
- **Output location**: `dist`

Click **"Review + Create"** → **"Create"**

### **Step 4: Wait for Deployment** (3-5 minutes)

Azure will:
1. Create the Static Web App
2. Set up GitHub Action in your repo
3. Build and deploy automatically

### **Step 5: Get Your URL**

Once deployed, go to the resource and find:
```
URL: https://can2025-fanops.azurestaticapps.net
```

**Done!** 🎉

---

## 🚀 **Option 2: Deploy via Azure CLI (Faster)**

### **Step 1: Install Azure CLI**

```bash
# Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Login
az login
```

### **Step 2: Create Static Web App**

```bash
# Set variables
RESOURCE_GROUP="fanops-frontend-rg"
APP_NAME="can2025-fanops"
LOCATION="westeurope"

# Create resource group
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION

# Create static web app
az staticwebapp create \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --source https://github.com/YOUR_USERNAME/FanOps \
  --location $LOCATION \
  --branch main \
  --app-location "/frontend" \
  --output-location "dist" \
  --login-with-github
```

### **Step 3: Build and Deploy**

```bash
cd /home/red/Documents/S5/Cloud/FanOps/frontend

# Build
npm run build

# Deploy (if using Azure Static Web Apps CLI)
npx @azure/static-web-apps-cli deploy ./dist \
  --deployment-token YOUR_DEPLOYMENT_TOKEN
```

---

## 🔧 **Option 3: Manual Deploy (No GitHub)**

If you don't want GitHub auto-deploy:

### **Step 1: Build**

```bash
cd /home/red/Documents/S5/Cloud/FanOps/frontend
npm run build
```

### **Step 2: Install SWA CLI**

```bash
npm install -g @azure/static-web-apps-cli
```

### **Step 3: Deploy**

```bash
# Login to Azure
az login

# Deploy the dist folder
swa deploy ./dist \
  --app-name can2025-fanops \
  --resource-group fanops-frontend-rg \
  --env production
```

---

## 📝 **GitHub Actions Auto-Deploy** (Recommended)

When you create via Azure Portal with GitHub, it automatically creates `.github/workflows/azure-static-web-apps-*.yml`

**Example workflow** (auto-generated):

```yaml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

jobs:
  build_and_deploy_job:
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true

      - name: Build And Deploy
        id: builddeploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/frontend"
          api_location: ""
          output_location: "dist"
```

**Every push to `main` = Auto-deploy!** ✨

---

## 🌐 **Custom Domain Setup** (Optional)

### Add your own domain:

1. Go to Azure Portal → Your Static Web App
2. Click **"Custom domains"**
3. Click **"+ Add"**
4. Enter domain: `fanops.yourdomain.com`
5. Add CNAME record in your DNS:
   ```
   fanops.yourdomain.com → can2025-fanops.azurestaticapps.net
   ```
6. Wait for DNS propagation (5-60 minutes)
7. **Free SSL certificate** auto-provisioned!

---

## 🔒 **Environment Variables**

Set environment variables in Azure:

1. Go to **Configuration** in Azure Portal
2. Add variables:
   ```
   VITE_M2_API_URL = https://3cfc8hn4xa.execute-api.eu-west-1.amazonaws.com/dev
   ```

Or create `.env.production` in your repo:

```bash
# frontend/.env.production
VITE_M2_API_URL=https://3cfc8hn4xa.execute-api.eu-west-1.amazonaws.com/dev
```

Commit and push → Auto-deploy with new variables!

---

## 📊 **Monitoring & Logs**

### View deployment logs:

```bash
# Via CLI
az staticwebapp show \
  --name can2025-fanops \
  --resource-group fanops-frontend-rg

# View function logs
az monitor log-analytics query \
  --workspace YOUR_WORKSPACE_ID \
  --analytics-query "traces | where message contains 'fanops'"
```

### In Azure Portal:

1. Go to your Static Web App
2. Click **"Deployments"** → See build history
3. Click **"Metrics"** → Traffic, bandwidth, errors

---

## 💰 **Cost Breakdown**

### Free Tier Limits:
- **Bandwidth**: 100 GB/month
- **Storage**: 0.5 GB
- **Custom domains**: 2
- **SSL**: Free
- **Builds**: Unlimited

### Beyond Free Tier (Standard):
- **$9/month** for standard plan
- **100 GB bandwidth** included
- **$0.20/GB** after that

**Your app will stay FREE!** 🎉

---

## 🧪 **Testing Before Deploy**

Test production build locally:

```bash
cd frontend

# Build
npm run build

# Preview production build
npm run preview

# Or serve with a static server
npx serve dist -p 3000
```

Open: http://localhost:3000

---

## 🚀 **Quick Deploy Script**

Save this script for future deploys:

```bash
#!/bin/bash
# deploy-frontend.sh

cd /home/red/Documents/S5/Cloud/FanOps/frontend

echo "🔨 Building frontend..."
npm run build

echo "☁️  Deploying to Azure..."
az staticwebapp show \
  --name can2025-fanops \
  --resource-group fanops-frontend-rg

echo "✅ Deployment complete!"
echo "🌐 URL: https://can2025-fanops.azurestaticapps.net"
```

Make executable:
```bash
chmod +x deploy-frontend.sh
./deploy-frontend.sh
```

---

## 🔧 **Troubleshooting**

### Build Fails

**Issue**: `npm run build` fails  
**Solution**: Check vite.config.js, fix errors, try again

### 404 Errors on Routes

**Issue**: React Router routes return 404  
**Solution**: Add `staticwebapp.config.json`:

```json
{
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/images/*.{png,jpg,gif}", "/css/*"]
  },
  "routes": [
    {
      "route": "/admin/*",
      "allowedRoles": ["admin"]
    }
  ]
}
```

Place in `frontend/public/staticwebapp.config.json`

### CORS Issues

**Issue**: API calls fail  
**Solution**: Update M2 AWS CORS to allow Azure domain:
```
https://can2025-fanops.azurestaticapps.net
```

---

## ✅ **Deployment Checklist**

- [ ] Frontend builds successfully (`npm run build`)
- [ ] Azure Static Web App created
- [ ] GitHub integration configured
- [ ] Environment variables set
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] CORS updated for Azure domain
- [ ] Test all features on live URL
- [ ] Monitor deployment status

---

## 📞 **Useful Links**

- **Azure Portal**: https://portal.azure.com
- **Static Web Apps Docs**: https://learn.microsoft.com/azure/static-web-apps/
- **Pricing**: https://azure.microsoft.com/pricing/details/app-service/static/
- **Your App** (after deploy): https://can2025-fanops.azurestaticapps.net

---

## 🎯 **Alternative: Deploy to Azure App Service**

If you need backend support:

```bash
# Create App Service
az webapp up \
  --name can2025-fanops-app \
  --resource-group fanops-frontend-rg \
  --runtime "NODE:18-lts" \
  --sku FREE
```

But **Static Web Apps is better for React!**

---

## 🎉 **Summary**

**Easiest**: Azure Portal → Static Web App → Connect GitHub → Done  
**Fastest**: Azure CLI + SWA CLI  
**Best**: GitHub Actions (auto-deploy on every push)

**Recommended**: Use Azure Portal with GitHub integration! 🚀

---

**Ready to deploy? Let me know if you need help!**
