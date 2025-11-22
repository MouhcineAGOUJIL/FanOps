const { handler } = require('../src/handlers/logAnalyzer');
const AWS = require('aws-sdk');

// Mock DynamoDB Stream Event
const createMockEvent = (records) => ({
    Records: records.map(record => ({
        eventName: 'INSERT',
        dynamodb: {
            NewImage: AWS.DynamoDB.Converter.marshall(record)
        }
    }))
});

async function runTests() {
    console.log('--- TEST 1: Brute Force Scenario ---');
    const bruteForceEvent = createMockEvent([
        {
            auditId: 'log-1',
            type: 'LOGIN_FAILURE',
            ipAddress: '192.168.1.100',
            timestamp: new Date().toISOString(),
            details: 'SimulatedBruteForce: 5th failure'
        }
    ]);
    await handler(bruteForceEvent);

    console.log('\n--- TEST 2: Impossible Travel Scenario ---');
    const travelEvent = createMockEvent([
        {
            auditId: 'log-2',
            type: 'TICKET_SCANNED',
            userId: 'user-123',
            gateId: 'Gate-Z', // Far away from previous Gate-A
            timestamp: new Date().toISOString(),
            details: 'SimulatedImpossibleTravel: Gate-A to Gate-Z in 1s'
        }
    ]);
    await handler(travelEvent);
}

runTests();
