#!/bin/bash

# Deploy Frontend to AWS S3 + CloudFront
# CAN 2025 FanOps Project

set -e  # Exit on error

# Configuration
BUCKET_NAME="can2025-fanops-frontend"
REGION="eu-west-1"
DISTRIBUTION_ID=""  # Will be set after CloudFront creation

cd "$(dirname "$0")/frontend"

echo "🎯 Deploying CAN 2025 FanOps to AWS"
echo "===================================="
echo ""

# Step 1: Build
echo "🔨 Building production bundle..."
npm run build

if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist folder not found"
    exit 1
fi

echo "✅ Build complete!"
echo ""

# Step 2: Check if bucket exists
echo "🪣 Checking S3 bucket..."
if ! aws s3 ls "s3://$BUCKET_NAME" 2>/dev/null; then
    echo "Creating S3 bucket: $BUCKET_NAME"
    
    # Create bucket
    aws s3 mb "s3://$BUCKET_NAME" --region $REGION
    
    # Configure for static website
    aws s3 website "s3://$BUCKET_NAME" \
        --index-document index.html \
        --error-document index.html
    
    # Set bucket policy
    cat > /tmp/bucket-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
    }
  ]
}
EOF
    
    aws s3api put-bucket-policy \
        --bucket $BUCKET_NAME \
        --policy file:///tmp/bucket-policy.json
    
    echo "✅ Bucket created and configured"
else
    echo "✅ Bucket exists"
fi

echo ""

# Step 3: Upload files
echo "☁️  Uploading to S3..."

# Upload all files except index.html with long cache
aws s3 sync ./dist "s3://$BUCKET_NAME" \
    --delete \
    --cache-control "max-age=31536000,public" \
    --exclude "index.html"

# Upload index.html with no cache
aws s3 cp ./dist/index.html "s3://$BUCKET_NAME/index.html" \
    --cache-control "max-age=0,no-cache,no-store,must-revalidate"

echo "✅ Files uploaded to S3"
echo ""

# Step 4: Invalidate CloudFront (if configured)
if [ -n "$DISTRIBUTION_ID" ]; then
    echo "♻️  Invalidating CloudFront cache..."
    aws cloudfront create-invalidation \
        --distribution-id $DISTRIBUTION_ID \
        --paths "/*" > /dev/null
    echo "✅ CloudFront cache invalidated"
else
    echo "⚠️  No CloudFront distribution configured"
    echo "   To add CloudFront, set DISTRIBUTION_ID in this script"
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Deployment Summary:"
echo "---------------------"
echo "Bucket: $BUCKET_NAME"
echo "Region: $REGION"
echo ""
echo "🌐 URLs:"
echo "S3 Website: http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
if [ -n "$DISTRIBUTION_ID" ]; then
    echo "CloudFront: https://$DISTRIBUTION_ID.cloudfront.net"
fi
echo ""
echo "📝 Next Steps:"
if [ -z "$DISTRIBUTION_ID" ]; then
    echo "1. Create CloudFront distribution for HTTPS"
    echo "2. Set DISTRIBUTION_ID in this script"
    echo "3. Configure custom error pages for React Router"
    echo ""
    echo "See: AWS_FRONTEND_DEPLOYMENT.md for instructions"
fi
