# 🔐 AWS KMS & ACM Implementation Guide

## Overview

This guide shows you how to implement **AWS KMS** for encryption key management and **AWS ACM** for SSL/TLS certificates in your M2 Security Service.

---

## 🔑 Part 1: AWS KMS (Key Management Service)

### What is KMS?

AWS KMS manages encryption keys for your application. Use it to:
- ✅ Encrypt JWT secrets
- ✅ Encrypt environment variables
- ✅ Encrypt DynamoDB data
- ✅ Rotate keys automatically
- ✅ Audit key usage via CloudTrail

---

### Use Case 1: Encrypt JWT Secret with KMS

#### Step 1: Create KMS Key

```bash
# Create a KMS key for JWT secret
aws kms create-key \
  --description "M2 Security JWT Secret Key" \
  --region eu-west-1

# Output will include KeyId
{
  "KeyMetadata": {
    "KeyId": "1234abcd-12ab-34cd-56ef-1234567890ab",
    "Arn": "arn:aws:kms:eu-west-1:123456789012:key/1234abcd...",
    ...
  }
}
```

#### Step 2: Create Key Alias

```bash
# Create a friendly alias
aws kms create-alias \
  --alias-name alias/can2025-jwt-secret \
  --target-key-id 1234abcd-12ab-34cd-56ef-1234567890ab \
  --region eu-west-1
```

#### Step 3: Encrypt JWT Secret

```bash
# Encrypt your JWT secret
aws kms encrypt \
  --key-id alias/can2025-jwt-secret \
  --plaintext "can2025-secret-key-production" \
  --region eu-west-1 \
  --output text \
  --query CiphertextBlob

# Output: AQICAHh... (base64 encrypted text)
```

#### Step 4: Store in SSM Parameter Store

```bash
# Store encrypted secret in SSM
aws ssm put-parameter \
  --name /can2025/prod/jwt-secret \
  --value "AQICAHh..." \
  --type SecureString \
  --kms-key-id alias/can2025-jwt-secret \
  --region eu-west-1
```

---

### Use Case 2: Lambda Function Integration

#### Update serverless.yml

```yaml
# serverless.yml
provider:
  name: aws
  runtime: nodejs18.x
  region: eu-west-1
  
  # Grant Lambda permission to use KMS
  iamRoleStatements:
    - Effect: Allow
      Action:
        - kms:Decrypt
        - kms:DescribeKey
      Resource: 
        - arn:aws:kms:eu-west-1:*:key/*
    
    - Effect: Allow
      Action:
        - ssm:GetParameter
        - ssm:GetParameters
      Resource:
        - arn:aws:ssm:eu-west-1:*:parameter/can2025/*
  
  environment:
    JWT_SECRET_PARAM: /can2025/prod/jwt-secret

functions:
  verifyTicket:
    handler: src/handlers/verifyTicket.handler
    environment:
      # KMS will decrypt automatically
      JWT_SECRET: ${ssm:/can2025/prod/jwt-secret~true}
```

#### Use in Lambda Code

```javascript
// src/utils/kmsHelper.js
const AWS = require('aws-sdk');
const kms = new AWS.KMS({ region: 'eu-west-1' });
const ssm = new AWS.SSM({ region: 'eu-west-1' });

/**
 * Decrypt JWT secret from SSM using KMS
 */
async function getJWTSecret() {
  try {
    const paramName = process.env.JWT_SECRET_PARAM || '/can2025/prod/jwt-secret';
    
    const response = await ssm.getParameter({
      Name: paramName,
      WithDecryption: true // KMS decrypts automatically
    }).promise();
    
    return response.Parameter.Value;
  } catch (error) {
    console.error('Failed to get JWT secret:', error);
    throw error;
  }
}

/**
 * Decrypt data using KMS directly
 */
async function decryptData(encryptedData) {
  const params = {
    CiphertextBlob: Buffer.from(encryptedData, 'base64')
  };
  
  const result = await kms.decrypt(params).promise();
  return result.Plaintext.toString('utf-8');
}

/**
 * Encrypt data using KMS
 */
async function encryptData(plaintext, keyId = 'alias/can2025-jwt-secret') {
  const params = {
    KeyId: keyId,
    Plaintext: plaintext
  };
  
  const result = await kms.encrypt(params).promise();
  return result.CiphertextBlob.toString('base64');
}

module.exports = {
  getJWTSecret,
  decryptData,
  encryptData
};
```

#### Updated auth.js

```javascript
// src/handlers/auth.js
const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getJWTSecret } = require('../utils/kmsHelper');

let cachedSecret = null;

exports.login = async (event) => {
  try {
    // Get JWT secret from KMS (cached)
    if (!cachedSecret) {
      cachedSecret = await getJWTSecret();
    }
    
    const { username, password } = JSON.parse(event.body);
    
    // ... authentication logic ...
    
    // Generate token with KMS-managed secret
    const token = jwt.sign(
      {
        sub: user.username,
        role: user.role
      },
      cachedSecret, // Decrypted by KMS
      { expiresIn: '8h' }
    );
    
    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, token })
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, message: 'Internal error' })
    };
  }
};
```

---

### Use Case 3: DynamoDB Encryption at Rest

#### Enable Encryption on Tables

```yaml
# serverless.yml
resources:
  Resources:
    AuditTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: ${self:service}-audit-${self:provider.stage}
        # Enable KMS encryption
        SSESpecification:
          SSEEnabled: true
          SSEType: KMS
          KMSMasterKeyId: alias/can2025-dynamodb
        AttributeDefinitions:
          - AttributeName: auditId
            AttributeType: S
        KeySchema:
          - AttributeName: auditId
            KeyType: HASH
        BillingMode: PAY_PER_REQUEST
```

#### Create DynamoDB KMS Key

```bash
# Create dedicated key for DynamoDB
aws kms create-key \
  --description "M2 Security DynamoDB Encryption" \
  --region eu-west-1

aws kms create-alias \
  --alias-name alias/can2025-dynamodb \
  --target-key-id <KEY_ID> \
  --region eu-west-1
```

---

### Use Case 4: Automatic Key Rotation

```bash
# Enable automatic key rotation (yearly)
aws kms enable-key-rotation \
  --key-id alias/can2025-jwt-secret \
  --region eu-west-1

# Verify rotation is enabled
aws kms get-key-rotation-status \
  --key-id alias/can2025-jwt-secret \
  --region eu-west-1
```

---

## 🔒 Part 2: AWS ACM (Certificate Manager)

### What is ACM?

AWS ACM manages SSL/TLS certificates for your API Gateway. Use it to:
- ✅ Secure API Gateway with HTTPS
- ✅ Use custom domains (e.g., api.fanops.com)
- ✅ Auto-renew certificates
- ✅ Free SSL/TLS certificates

---

### Use Case 1: Custom Domain for API Gateway

#### Step 1: Request SSL Certificate

```bash
# Request certificate for your custom domain
aws acm request-certificate \
  --domain-name api.fanops.com \
  --subject-alternative-names "*.api.fanops.com" \
  --validation-method DNS \
  --region eu-west-1

# Output:
{
  "CertificateArn": "arn:aws:acm:eu-west-1:123456789012:certificate/abc123..."
}
```

#### Step 2: Validate Certificate (DNS)

```bash
# Get validation DNS records
aws acm describe-certificate \
  --certificate-arn arn:aws:acm:eu-west-1:123456789012:certificate/abc123... \
  --region eu-west-1

# Output will include CNAME records to add to your DNS
{
  "Certificate": {
    "DomainValidationOptions": [
      {
        "DomainName": "api.fanops.com",
        "ResourceRecord": {
          "Name": "_abc123.api.fanops.com",
          "Type": "CNAME",
          "Value": "_xyz456.acm-validations.aws."
        }
      }
    ]
  }
}
```

**Add CNAME to your DNS provider** (e.g., Route53, Cloudflare, GoDaddy):
```
Name: _abc123.api.fanops.com
Type: CNAME
Value: _xyz456.acm-validations.aws.
```

#### Step 3: Wait for Validation

```bash
# Check certificate status
aws acm describe-certificate \
  --certificate-arn arn:aws:acm:eu-west-1:123456789012:certificate/abc123... \
  --region eu-west-1 \
  --query 'Certificate.Status'

# Should return: "ISSUED" when validated
```

#### Step 4: Create Custom Domain in API Gateway

```yaml
# serverless.yml
provider:
  name: aws
  runtime: nodejs18.x
  region: eu-west-1

custom:
  customDomain:
    domainName: api.fanops.com
    certificateArn: arn:aws:acm:eu-west-1:123456789012:certificate/abc123...
    basePath: ''
    stage: ${self:provider.stage}
    createRoute53Record: true
    endpointType: 'regional'

plugins:
  - serverless-domain-manager

# Deploy custom domain
# sls create_domain --stage prod
# sls deploy --stage prod
```

Or using AWS CLI:

```bash
# Create custom domain
aws apigateway create-domain-name \
  --domain-name api.fanops.com \
  --regional-certificate-arn arn:aws:acm:eu-west-1:123456789012:certificate/abc123... \
  --endpoint-configuration types=REGIONAL \
  --region eu-west-1

# Create base path mapping
aws apigateway create-base-path-mapping \
  --domain-name api.fanops.com \
  --rest-api-id <API_ID> \
  --stage prod \
  --region eu-west-1
```

#### Step 5: Update DNS Records

```bash
# Get CloudFront/API Gateway domain
aws apigateway get-domain-name \
  --domain-name api.fanops.com \
  --region eu-west-1

# Output:
{
  "regionalDomainName": "d-abc123.execute-api.eu-west-1.amazonaws.com"
}
```

**Add CNAME to DNS**:
```
Name: api.fanops.com
Type: CNAME
Value: d-abc123.execute-api.eu-west-1.amazonaws.com
```

Or use Route53:

```bash
# Create Route53 record
aws route53 change-resource-record-sets \
  --hosted-zone-id Z1234567890ABC \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "api.fanops.com",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z2FDTNDATAQYW2",
          "DNSName": "d-abc123.execute-api.eu-west-1.amazonaws.com",
          "EvaluateTargetHealth": false
        }
      }
    }]
  }'
```

---

### Use Case 2: Frontend HTTPS with CloudFront + ACM

#### Step 1: Request Certificate in us-east-1

**IMPORTANT**: CloudFront requires certificates in **us-east-1**

```bash
# Request certificate for frontend
aws acm request-certificate \
  --domain-name fanops.com \
  --subject-alternative-names "www.fanops.com" \
  --validation-method DNS \
  --region us-east-1
```

#### Step 2: Create CloudFront Distribution

```yaml
# CloudFront with ACM
Resources:
  FrontendCDN:
    Type: AWS::CloudFront::Distribution
    Properties:
      DistributionConfig:
        Enabled: true
        Aliases:
          - fanops.com
          - www.fanops.com
        ViewerCertificate:
          AcmCertificateArn: arn:aws:acm:us-east-1:123456789012:certificate/xyz...
          SslSupportMethod: sni-only
          MinimumProtocolVersion: TLSv1.2_2021
        Origins:
          - Id: S3Origin
            DomainName: fanops-frontend.s3.amazonaws.com
            S3OriginConfig:
              OriginAccessIdentity: ''
        DefaultCacheBehavior:
          TargetOriginId: S3Origin
          ViewerProtocolPolicy: redirect-to-https
```

---

## 📊 Complete Implementation Example

### serverless.yml with KMS & ACM

```yaml
service: can2025-secure-gates

frameworkVersion: '3'

provider:
  name: aws
  runtime: nodejs18.x
  region: eu-west-1
  stage: ${opt:stage, 'dev'}
  
  # KMS Permissions
  iamRoleStatements:
    - Effect: Allow
      Action:
        - kms:Decrypt
        - kms:DescribeKey
        - kms:Encrypt
      Resource: 
        - arn:aws:kms:${self:provider.region}:*:key/*
    
    - Effect: Allow
      Action:
        - ssm:GetParameter
        - ssm:GetParameters
      Resource:
        - arn:aws:ssm:${self:provider.region}:*:parameter/can2025/*
    
    - Effect: Allow
      Action:
        - dynamodb:GetItem
        - dynamodb:PutItem
        - dynamodb:Scan
      Resource:
        - !GetAtt AuditTable.Arn
        - !GetAtt UsersTable.Arn
  
  environment:
    # JWT secret from SSM (KMS encrypted)
    JWT_SECRET: ${ssm:/can2025/${self:provider.stage}/jwt-secret~true}
    AUDIT_TABLE: ${self:service}-audit-${self:provider.stage}
    USERS_TABLE: ${self:service}-users-${self:provider.stage}

# ACM Custom Domain
custom:
  customDomain:
    domainName: api.fanops.com
    certificateArn: arn:aws:acm:eu-west-1:123456789012:certificate/abc123...
    basePath: ''
    stage: ${self:provider.stage}
    createRoute53Record: true
    endpointType: 'regional'

functions:
  login:
    handler: src/handlers/auth.login
    events:
      - http:
          path: auth/login
          method: post
          cors: true

plugins:
  - serverless-domain-manager
  - serverless-offline

resources:
  Resources:
    # DynamoDB with KMS encryption
    AuditTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: ${self:service}-audit-${self:provider.stage}
        SSESpecification:
          SSEEnabled: true
          SSEType: KMS
          KMSMasterKeyId: alias/can2025-dynamodb
        AttributeDefinitions:
          - AttributeName: auditId
            AttributeType: S
        KeySchema:
          - AttributeName: auditId
            KeyType: HASH
        BillingMode: PAY_PER_REQUEST
    
    UsersTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: ${self:service}-users-${self:provider.stage}
        SSESpecification:
          SSEEnabled: true
          SSEType: KMS
          KMSMasterKeyId: alias/can2025-dynamodb
        AttributeDefinitions:
          - AttributeName: userId
            AttributeType: S
        KeySchema:
          - AttributeName: userId
            KeyType: HASH
        BillingMode: PAY_PER_REQUEST
```

---

## 🚀 Deployment Steps

### 1. Create KMS Keys

```bash
# JWT Secret Key
aws kms create-key --description "M2 JWT Secret" --region eu-west-1
aws kms create-alias --alias-name alias/can2025-jwt-secret --target-key-id <KEY_ID>

# DynamoDB Key
aws kms create-key --description "M2 DynamoDB Encryption" --region eu-west-1
aws kms create-alias --alias-name alias/can2025-dynamodb --target-key-id <KEY_ID>

# Enable rotation
aws kms enable-key-rotation --key-id alias/can2025-jwt-secret
```

### 2. Store Secrets in SSM

```bash
# Encrypt and store JWT secret
aws ssm put-parameter \
  --name /can2025/prod/jwt-secret \
  --value "your-production-secret-key" \
  --type SecureString \
  --kms-key-id alias/can2025-jwt-secret \
  --region eu-west-1
```

### 3. Request ACM Certificate

```bash
# For API Gateway (eu-west-1)
aws acm request-certificate \
  --domain-name api.fanops.com \
  --validation-method DNS \
  --region eu-west-1

# For CloudFront (us-east-1)
aws acm request-certificate \
  --domain-name fanops.com \
  --subject-alternative-names "www.fanops.com" \
  --validation-method DNS \
  --region us-east-1
```

### 4. Validate Certificates

Add CNAME records to your DNS provider.

### 5. Deploy with Custom Domain

```bash
# Install plugin
npm install --save-dev serverless-domain-manager

# Create custom domain
serverless create_domain --stage prod

# Deploy
serverless deploy --stage prod
```

### 6. Update DNS

Point your domain to API Gateway CloudFront distribution.

---

## 💰 Cost Estimate

### KMS Costs
- **Key storage**: $1/month per key
- **API requests**: $0.03 per 10,000 requests
- **Example**: 2 keys + 100K requests = $2.30/month

### ACM Costs
- **Public certificates**: **FREE** ✅
- **Auto-renewal**: FREE
- **Private CA**: $400/month (not needed for this use case)

**Total additional cost**: ~$2.30/month for KMS only

---

## 🔐 Security Benefits

### With KMS:
- ✅ Secrets never stored in plaintext
- ✅ Automatic key rotation
- ✅ Audit trail via CloudTrail
- ✅ Compliance (HIPAA, PCI-DSS ready)

### With ACM:
- ✅ HTTPS everywhere
- ✅ Auto-renewing certificates
- ✅ Custom professional domains
- ✅ Better SEO ranking

---

## 📚 Next Steps

1. **Create KMS keys** for JWT and DynamoDB
2. **Migrate secrets** from .env to SSM Parameter Store
3. **Request ACM certificates** for your domain
4. **Update serverless.yml** with KMS and ACM config
5. **Deploy** and test

---

## 🔍 Testing

### Test KMS Encryption

```bash
# Encrypt test data
aws kms encrypt \
  --key-id alias/can2025-jwt-secret \
  --plaintext "test-secret" \
  --region eu-west-1 \
  --output text \
  --query CiphertextBlob

# Decrypt
aws kms decrypt \
  --ciphertext-blob fileb://<(echo "<ENCRYPTED_TEXT>" | base64 -d) \
  --region eu-west-1 \
  --output text \
  --query Plaintext | base64 -d
```

### Test HTTPS Endpoint

```bash
# Test custom domain
curl https://api.fanops.com/dev/security/metrics

# Check SSL certificate
openssl s_client -connect api.fanops.com:443 -servername api.fanops.com
```

---

**Want me to help you implement KMS and ACM for your M2 project? Let me know which use case you'd like to start with!**
