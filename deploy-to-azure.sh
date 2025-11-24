#!/bin/bash

# Quick Deploy Frontend to Azure Static Web Apps

set -e  # Exit on error

cd "$(dirname "$0")/frontend"

echo "🎯 CAN 2025 FanOps - Azure Deployment"
echo "======================================"
echo ""

# Step 1: Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist

# Step 2: Install dependencies
echo "📦 Installing dependencies..."
npm install

# Step 3: Build production bundle
echo "🔨 Building production bundle..."
npm run build

# Step 4: Check build output
echo ""
echo "✅ Build complete!"
echo "📁 Output: $(du -sh dist | cut -f1)"
echo ""

# Step 5: Test locally (optional)
read -p "🧪 Test build locally? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "🌐 Starting preview server..."
    echo "Open: http://localhost:4173"
    npm run preview
fi

echo ""
echo "✅ Ready to deploy!"
echo ""
echo "Choose deployment method:"
echo "1. Azure Portal (GUI) - Easiest"
echo "2. Azure CLI - Fastest"
echo "3. Manual upload"
echo ""
echo "📖 See AZURE_FRONTEND_DEPLOYMENT.md for detailed instructions"
