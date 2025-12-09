#!/bin/bash

# Get the table name (assuming dev stage by default, adjust if needed)
TABLE_NAME="can2025-secure-gates-sold-tickets-dev"
REGION="eu-west-1"

echo "Fetching valid JWTs from DynamoDB table: $TABLE_NAME..."

# Scan for valid tickets and extract JWTs
aws dynamodb scan \
    --table-name "$TABLE_NAME" \
    --filter-expression "#s = :v" \
    --expression-attribute-names '{"#s": "status"}' \
    --expression-attribute-values '{":v": {"S": "valid"}}' \
    --region "$REGION" \
    --query "Items[*].jwt.S" \
    --output text
