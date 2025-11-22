# AWS KMS & SSM Parameter Store Setup Guide

This guide walks you through setting up AWS KMS encryption and SSM Parameter Store for secure secret management in production.

## Prerequisites
- AWS Account with administrative access
- AWS CLI configured
- Serverless Framework installed

## Step 1: Create KMS Customer Master Key (CMK)

### Via AWS Console:
1. Navigate to **AWS KMS** service
2. Click **Create key**
3. Configure key:
   - Key type: **Symmetric**
   - Key usage: **Encrypt and decrypt**
   - Alias: `can2025-secrets-key`
   - Description: "Encryption key for CAN2025 secrets"
4. Define key administrators (your IAM user/role)
5. Define key users:
   - Add the Lambda execution role: `can2025-secure-gates-{stage}-{region}-lambdaRole`
6. Review and create
7. **Copy the Key ARN** - you'll need it later

### Via AWS CLI:
```bash
aws kms create-key \
  --description "CAN2025 Secrets Encryption Key" \
  --key-usage ENCRYPT_DECRYPT \
  --origin AWS_KMS
```

## Step 2: Create SSM Parameters

### Development/Staging Secret
```bash
aws ssm put-parameter \
  --name "/can2025/dev/jwt-secret" \
  --value "$(openssl rand -hex 64)" \
  --type "SecureString" \
  --key-id "alias/can2025-secrets-key" \
  --description "JWT signing secret for dev environment" \
  --tags "Key=Environment,Value=dev" "Key=Service,Value=can2025-secure-gates"
```

### Production Secret
```bash
aws ssm put-parameter \
  --name "/can2025/prod/jwt-secret" \
  --value "$(openssl rand -hex 64)" \
  --type "SecureString" \
  --key-id "alias/can2025-secrets-key" \
  --description "JWT signing secret for production environment" \
  --tags "Key=Environment,Value=prod" "Key=Service,Value=can2025-secure-gates"
```

## Step 3: Update serverless.yml

The `serverless.yml` has already been configured to reference SSM parameters:

```yaml
environment:
  JWT_SECRET: ${ssm:/can2025/${opt:stage}/jwt-secret~true, 'can2025-secret-key-local'}
```

The `~true` flag tells Serverless to decrypt the parameter value.

## Step 4: Deploy to AWS

Deploy to staging:
```bash
sls deploy --stage dev
```

Deploy to production:
```bash
sls deploy --stage prod
```

## Step 5: Configure Automatic Key Rotation

### Enable EventBridge Schedule (Commented out in serverless.yml)

Uncomment the `rotateKey` function's `events` section:

```yaml
rotateKey:
  handler: src/handlers/rotateKey.handler
  events:
    - schedule: cron(0 0 1 * ? *)  # 1st of every month at midnight
```

Redeploy:
```bash
sls deploy --stage prod
```

### Manual Rotation Trigger

To manually trigger rotation:
```bash
aws lambda invoke \
  --function-name can2025-secure-gates-prod-rotateKey \
  --region eu-west-1 \
  response.json
```

## Step 6: Verification

### Verify SSM Parameter
```bash
aws ssm get-parameter \
  --name "/can2025/prod/jwt-secret" \
  --with-decryption
```

### Test Lambda can access secret
Check CloudWatch Logs for any Lambda function. You should NOT see errors related to KMS or SSM.

## Rotation Strategy

The `rotateKey` Lambda follows a **grace period** approach:

1. **First Invocation**: Creates a NEW pending secret at `{path}-new`
2. **Second Invocation** (24h later): 
   - Promotes pending secret to active
   - Archives old secret for audit
   - Deletes pending marker

This ensures:
- Active JWTs remain valid during rotation
- Zero downtime
- Audit trail of all secrets

## Troubleshooting

### Error: "User is not authorized to perform: kms:Decrypt"
- Verify Lambda execution role has KMS decrypt permissions
- Check KMS key policy allows the Lambda role

### Error: "ParameterNotFound"
- Verify the parameter path matches exactly
- Check you're in the correct region
- Ensure you've run Step 2

### Error: "AccessDeniedException"
- Verify IAM role has `ssm:GetParameter` permission
- Check SSM parameter's resource ARN in IAM policy

## Cost Optimization

- **KMS**: ~$1/month per CMK
- **SSM Parameters**: Free for standard parameters
- **Lambda**: Rotation runs once/month, negligible cost

## Security Best Practices

1. **Never log secrets**: The rotateKey handler only logs the first 10 characters
2. **Restrict KMS key access**: Only grant to necessary IAM roles
3. **Enable CloudTrail**: Audit all SSM and KMS operations
4. **Tag resources**: For billing and access control
5. **Regular audits**: Review who has access to secrets quarterly
