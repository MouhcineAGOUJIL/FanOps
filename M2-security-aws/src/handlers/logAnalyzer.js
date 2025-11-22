const AWS = require('aws-sdk');

// In a real scenario, we might use a persistent store (Redis/DynamoDB) for state.
// For this prototype/lambda, we'll demonstrate the logic. 
// Note: Lambda state is not guaranteed to persist between invocations, 
// so a real implementation would query DynamoDB for "recent failures".
// Here we will simulate the logic assuming we receive a batch of records.

exports.handler = async (event) => {
    console.log('Processing DynamoDB Stream records:', JSON.stringify(event, null, 2));

    for (const record of event.Records) {
        if (record.eventName === 'INSERT') {
            const newImage = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);
            await analyzeRecord(newImage);
        }
    }
};

async function analyzeRecord(record) {
    const { type, details, timestamp } = record;

    // 1. Brute Force Detection
    if (type === 'LOGIN_FAILURE') {
        await checkBruteForce(record);
    }

    // 2. Impossible Travel Detection
    if (type === 'TICKET_SCANNED') {
        await checkImpossibleTravel(record);
    }
}

async function checkBruteForce(record) {
    // In a real app, query DB for failures from this IP in last 5 mins.
    // For this demo, we'll just log the check.
    console.log(`[SECURITY CHECK] Checking Brute Force for IP: ${record.ipAddress}`);

    // Simulation: If details contains "SimulatedBruteForce", trigger alert
    if (record.details && record.details.includes('SimulatedBruteForce')) {
        console.error(`[ALERT] POTENTIAL BRUTE FORCE ATTACK DETECTED from IP: ${record.ipAddress}`);
        // Trigger SNS or block IP logic here
    }
}

async function checkImpossibleTravel(record) {
    console.log(`[SECURITY CHECK] Checking Travel for User: ${record.userId} at Gate: ${record.gateId}`);

    // Simulation: If details contains "SimulatedImpossibleTravel", trigger alert
    if (record.details && record.details.includes('SimulatedImpossibleTravel')) {
        console.error(`[ALERT] IMPOSSIBLE TRAVEL DETECTED for User: ${record.userId}. Gate: ${record.gateId}`);
        // Trigger SNS or revoke token logic here
    }
}
