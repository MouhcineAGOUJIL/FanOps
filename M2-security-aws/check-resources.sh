#!/bin/bash

REGION="eu-west-1"
FILTER="can2025"

echo "🔍 Checking for resources containing '$FILTER' in $REGION..."
echo "========================================================"

echo -e "\n☁️  CloudFormation Stacks:"
aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE --region $REGION --query "StackSummaries[?contains(StackName, '$FILTER')].StackName" --output text

echo -e "\n💻 EC2 Instances:"
aws ec2 describe-instances --region $REGION --filters "Name=tag:Name,Values=*$FILTER*" --query "Reservations[].Instances[].{ID:InstanceId,State:State.Name,Name:Tags[?Key=='Name'].Value|[0]}" --output table

echo -e "\nλ  Lambda Functions:"
aws lambda list-functions --region $REGION --query "Functions[?contains(FunctionName, '$FILTER')].FunctionName" --output text

echo -e "\n🗄️  DynamoDB Tables:"
aws dynamodb list-tables --region $REGION --query "TableNames[?contains(@, '$FILTER')]" --output text

echo -e "\n🚪 API Gateways:"
aws apigateway get-rest-apis --region $REGION --query "items[?contains(name, '$FILTER')].name" --output text

echo -e "\n========================================================"
echo "✅ Check complete."
