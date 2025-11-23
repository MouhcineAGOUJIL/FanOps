#!/bin/bash

# Configuration
FUNCTION_NAME="m4-sponsor-ai"
REGION="europe-west1" # Change as needed
RUNTIME="python310"
ENTRY_POINT="sponsor_recommendation"
MEMORY="512MB"

echo "🚀 Deploying $FUNCTION_NAME to GCP..."

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null
then
    echo "❌ gcloud CLI could not be found. Please install it first."
    exit 1
fi

# Deploy Command
gcloud functions deploy $FUNCTION_NAME \
    --gen2 \
    --region=$REGION \
    --runtime=$RUNTIME \
    --memory=$MEMORY \
    --trigger-http \
    --entry-point=$ENTRY_POINT \
    --allow-unauthenticated \
    --set-env-vars GCP_MODEL_BUCKET=fanops-m4-models

echo "✅ Deployment initiated. Check GCP Console for status."
