#!/usr/bin/env node

/**
 * Fetch CloudWatch Metrics for M2 Security Dashboard
 * This script demonstrates how to fetch operational metrics from AWS CloudWatch
 */

const AWS = require('aws-sdk');

// Configure AWS
AWS.config.update({ region: 'eu-west-1' });
const cloudwatch = new AWS.CloudWatch();

// Configuration
const FUNCTION_PREFIX = 'can2025-secure-gates-dev';
const API_NAME = 'dev-can2025-secure-gates';
const AUDIT_TABLE = 'can2025-secure-gates-audit-dev';

// Helper to get time ranges
const getTimeRange = (hours = 1) => ({
    StartTime: new Date(Date.now() - hours * 3600000),
    EndTime: new Date()
});

// Fetch Lambda Metrics
async function getLambdaMetrics(functionName) {
    try {
        const timeRange = getTimeRange(1);

        const invocations = await cloudwatch.getMetricStatistics({
            Namespace: 'AWS/Lambda',
            MetricName: 'Invocations',
            Dimensions: [{ Name: 'FunctionName', Value: functionName }],
            StartTime: timeRange.StartTime,
            EndTime: timeRange.EndTime,
            Period: 3600, // 1 hour
            Statistics: ['Sum']
        }).promise();

        const errors = await cloudwatch.getMetricStatistics({
            Namespace: 'AWS/Lambda',
            MetricName: 'Errors',
            Dimensions: [{ Name: 'FunctionName', Value: functionName }],
            StartTime: timeRange.StartTime,
            EndTime: timeRange.EndTime,
            Period: 3600,
            Statistics: ['Sum']
        }).promise();

        const duration = await cloudwatch.getMetricStatistics({
            Namespace: 'AWS/Lambda',
            MetricName: 'Duration',
            Dimensions: [{ Name: 'FunctionName', Value: functionName }],
            StartTime: timeRange.StartTime,
            EndTime: timeRange.EndTime,
            Period: 3600,
            Statistics: ['Average', 'Maximum']
        }).promise();

        return {
            invocations: invocations.Datapoints[0]?.Sum || 0,
            errors: errors.Datapoints[0]?.Sum || 0,
            avgDuration: Math.round(duration.Datapoints[0]?.Average || 0),
            maxDuration: Math.round(duration.Datapoints[0]?.Maximum || 0)
        };
    } catch (error) {
        console.error(`Error fetching Lambda metrics for ${functionName}:`, error.message);
        return { invocations: 0, errors: 0, avgDuration: 0, maxDuration: 0 };
    }
}

// Fetch API Gateway Metrics
async function getAPIGatewayMetrics() {
    try {
        const timeRange = getTimeRange(1);

        const count = await cloudwatch.getMetricStatistics({
            Namespace: 'AWS/ApiGateway',
            MetricName: 'Count',
            Dimensions: [{ Name: 'ApiName', Value: API_NAME }],
            StartTime: timeRange.StartTime,
            EndTime: timeRange.EndTime,
            Period: 3600,
            Statistics: ['Sum']
        }).promise();

        const error4xx = await cloudwatch.getMetricStatistics({
            Namespace: 'AWS/ApiGateway',
            MetricName: '4XXError',
            Dimensions: [{ Name: 'ApiName', Value: API_NAME }],
            StartTime: timeRange.StartTime,
            EndTime: timeRange.EndTime,
            Period: 3600,
            Statistics: ['Sum']
        }).promise();

        const error5xx = await cloudwatch.getMetricStatistics({
            Namespace: 'AWS/ApiGateway',
            MetricName: '5XXError',
            Dimensions: [{ Name: 'ApiName', Value: API_NAME }],
            StartTime: timeRange.StartTime,
            EndTime: timeRange.EndTime,
            Period: 3600,
            Statistics: ['Sum']
        }).promise();

        const latency = await cloudwatch.getMetricStatistics({
            Namespace: 'AWS/ApiGateway',
            MetricName: 'Latency',
            Dimensions: [{ Name: 'ApiName', Value: API_NAME }],
            StartTime: timeRange.StartTime,
            EndTime: timeRange.EndTime,
            Period: 3600,
            Statistics: ['Average', 'Maximum', 'p95']
        }).promise();

        const totalRequests = count.Datapoints[0]?.Sum || 0;
        const total4xx = error4xx.Datapoints[0]?.Sum || 0;
        const total5xx = error5xx.Datapoints[0]?.Sum || 0;

        return {
            totalRequests,
            error4xx: total4xx,
            error5xx: total5xx,
            errorRate: totalRequests > 0 ? ((total4xx + total5xx) / totalRequests * 100).toFixed(2) + '%' : '0%',
            avgLatency: Math.round(latency.Datapoints[0]?.Average || 0),
            maxLatency: Math.round(latency.Datapoints[0]?.Maximum || 0),
            p95Latency: Math.round(latency.Datapoints[0]?.['p95'] || 0)
        };
    } catch (error) {
        console.error('Error fetching API Gateway metrics:', error.message);
        return { totalRequests: 0, error4xx: 0, error5xx: 0, errorRate: '0%', avgLatency: 0, maxLatency: 0, p95Latency: 0 };
    }
}

// Fetch DynamoDB Metrics
async function getDynamoDBMetrics(tableName) {
    try {
        const timeRange = getTimeRange(1);

        const readCapacity = await cloudwatch.getMetricStatistics({
            Namespace: 'AWS/DynamoDB',
            MetricName: 'ConsumedReadCapacityUnits',
            Dimensions: [{ Name: 'TableName', Value: tableName }],
            StartTime: timeRange.StartTime,
            EndTime: timeRange.EndTime,
            Period: 3600,
            Statistics: ['Sum']
        }).promise();

        const writeCapacity = await cloudwatch.getMetricStatistics({
            Namespace: 'AWS/DynamoDB',
            MetricName: 'ConsumedWriteCapacityUnits',
            Dimensions: [{ Name: 'TableName', Value: tableName }],
            StartTime: timeRange.StartTime,
            EndTime: timeRange.EndTime,
            Period: 3600,
            Statistics: ['Sum']
        }).promise();

        return {
            readCapacityUnits: Math.round(readCapacity.Datapoints[0]?.Sum || 0),
            writeCapacityUnits: Math.round(writeCapacity.Datapoints[0]?.Sum || 0)
        };
    } catch (error) {
        console.error(`Error fetching DynamoDB metrics for ${tableName}:`, error.message);
        return { readCapacityUnits: 0, writeCapacityUnits: 0 };
    }
}

// Main function
async function fetchAllMetrics() {
    console.log('\n📊 Fetching CloudWatch Metrics for M2 Security Dashboard...\n');
    console.log('⏰ Time Range: Last 1 hour');
    console.log('🌍 Region: eu-west-1\n');

    // Fetch all metrics in parallel
    const [
        verifyTicketMetrics,
        loginMetrics,
        apiMetrics,
        dynamoMetrics
    ] = await Promise.all([
        getLambdaMetrics(`${FUNCTION_PREFIX}-verifyTicket`),
        getLambdaMetrics(`${FUNCTION_PREFIX}-login`),
        getAPIGatewayMetrics(),
        getDynamoDBMetrics(AUDIT_TABLE)
    ]);

    // Display results
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔹 LAMBDA FUNCTIONS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    console.log('\n📦 verifyTicket Function:');
    console.log(`  • Invocations: ${verifyTicketMetrics.invocations}`);
    console.log(`  • Errors: ${verifyTicketMetrics.errors} ${verifyTicketMetrics.errors > 0 ? '⚠️' : '✅'}`);
    console.log(`  • Avg Duration: ${verifyTicketMetrics.avgDuration}ms`);
    console.log(`  • Max Duration: ${verifyTicketMetrics.maxDuration}ms`);

    console.log('\n🔐 login Function:');
    console.log(`  • Invocations: ${loginMetrics.invocations}`);
    console.log(`  • Errors: ${loginMetrics.errors} ${loginMetrics.errors > 0 ? '⚠️' : '✅'}`);
    console.log(`  • Avg Duration: ${loginMetrics.avgDuration}ms`);
    console.log(`  • Max Duration: ${loginMetrics.maxDuration}ms`);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔹 API GATEWAY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  • Total Requests: ${apiMetrics.totalRequests}`);
    console.log(`  • 4xx Errors: ${apiMetrics.error4xx} ${apiMetrics.error4xx > 0 ? '⚠️' : '✅'}`);
    console.log(`  • 5xx Errors: ${apiMetrics.error5xx} ${apiMetrics.error5xx > 0 ? '❌' : '✅'}`);
    console.log(`  • Error Rate: ${apiMetrics.errorRate}`);
    console.log(`  • Avg Latency: ${apiMetrics.avgLatency}ms`);
    console.log(`  • P95 Latency: ${apiMetrics.p95Latency}ms`);
    console.log(`  • Max Latency: ${apiMetrics.maxLatency}ms`);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔹 DYNAMODB');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  • Read Capacity Units: ${dynamoMetrics.readCapacityUnits}`);
    console.log(`  • Write Capacity Units: ${dynamoMetrics.writeCapacityUnits}`);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Summary for dashboard
    const dashboardData = {
        lambda: {
            verifyTicket: verifyTicketMetrics,
            login: loginMetrics
        },
        apiGateway: apiMetrics,
        dynamodb: dynamoMetrics,
        timestamp: new Date().toISOString()
    };

    console.log('📋 JSON Output (for dashboard integration):\n');
    console.log(JSON.stringify(dashboardData, null, 2));
    console.log('\n✅ Done!\n');

    return dashboardData;
}

// Run if called directly
if (require.main === module) {
    fetchAllMetrics()
        .then(() => process.exit(0))
        .catch(error => {
            console.error('\n❌ Fatal error:', error);
            process.exit(1);
        });
}

module.exports = { fetchAllMetrics, getLambdaMetrics, getAPIGatewayMetrics, getDynamoDBMetrics };
