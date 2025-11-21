#!/bin/bash

echo "🚀 Starting Serverless Offline (Bypassing npm)..."
echo "------------------------------------------------"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "❌ node_modules not found. Please run 'npm install' (or fix your npm installation) first."
    exit 1
fi

# Run serverless directly
./node_modules/.bin/serverless offline start
