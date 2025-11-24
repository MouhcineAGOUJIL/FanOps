#!/usr/bin/env node

/**
 * Seed AWS DynamoDB with Security Events
 * This script populates the production AWS audit table with realistic data
 */

const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

// Configure AWS
AWS.config.update({ region: 'eu-west-1' });
const dynamodb = new AWS.DynamoDB.DocumentClient();

const AUDIT_TABLE = 'can2025-secure-gates-audit-dev';
const SOLD_TICKETS_TABLE = 'can2025-secure-gates-sold-tickets-dev';

// Sample data
const GATES = ['G1', 'G2', 'G3', 'VIP-ENTRANCE'];
const DEVICES = ['scanner-01', 'scanner-02', 'scanner-03', 'mobile-scanner-A'];
const GATEKEEPERS = ['GK-001', 'GK-002', 'GK-003'];
const USERNAMES = ['admin', 'gk1', 'security_admin', 'operator1'];
const IP_ADDRESSES = ['192.168.1.10', '192.168.1.20', '10.0.0.5', '172.16.0.8', '203.0.113.45'];

// Helper functions
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const randomRecentTimestamp = () => {
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    const randomTime = oneDayAgo + Math.random() * (now - oneDayAgo);
    return new Date(randomTime).toISOString();
};

// Get sold tickets from AWS
async function getSoldTickets() {
    try {
        const result = await dynamodb.scan({
            TableName: SOLD_TICKETS_TABLE,
            Limit: 100
        }).promise();
        return result.Items || [];
    } catch (error) {
        console.error('❌ Error fetching sold tickets:', error.message);
        return [];
    }
}

// Write event to AWS DynamoDB
async function writeEvent(event) {
    try {
        await dynamodb.put({
            TableName: AUDIT_TABLE,
            Item: event
        }).promise();
        return true;
    } catch (error) {
        console.error(`❌ Error writing event: ${error.message}`);
        return false;
    }
}

// Generate and upload events
async function seedAWSEvents(count = 50) {
    console.log('\n🚀 Seeding AWS DynamoDB with security events...\n');
    console.log(`📡 Region: eu-west-1`);
    console.log(`📋 Audit Table: ${AUDIT_TABLE}\n`);

    // Get sold tickets
    console.log('📥 Fetching sold tickets from AWS...');
    const soldTickets = await getSoldTickets();
    console.log(`✅ Found ${soldTickets.length} sold tickets\n`);

    const events = [];
    let successCount = 0;
    let failCount = 0;

    // Generate events
    for (let i = 0; i < count; i++) {
        const eventType = Math.random();
        let event = null;

        // 60% - Valid ticket scans
        if (eventType < 0.6 && soldTickets.length > 0) {
            const ticket = randomItem(soldTickets);
            event = {
                auditId: uuidv4(),
                timestamp: randomRecentTimestamp(),
                type: 'ticket_verification',
                jti: uuidv4(),
                ticketId: ticket.ticketId,
                matchId: ticket.matchId || 'CAN2025-MAR-G1',
                seatNumber: ticket.seatNumber || 'UNKNOWN',
                gateId: randomItem(GATES),
                deviceId: randomItem(DEVICES),
                gatekeeperId: randomItem(GATEKEEPERS),
                result: 'valid'
            };
        }
        // 15% - Invalid tickets
        else if (eventType < 0.75) {
            event = {
                auditId: uuidv4(),
                timestamp: randomRecentTimestamp(),
                type: 'ticket_verification',
                ticketJWT: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                gateId: randomItem(GATES),
                deviceId: randomItem(DEVICES),
                gatekeeperId: randomItem(GATEKEEPERS),
                result: 'invalid_jwt',
                error: randomItem(['invalid signature', 'jwt malformed', 'token expired'])
            };
        }
        // 10% - Replay attacks
        else if (eventType < 0.85 && soldTickets.length > 0) {
            const ticket = randomItem(soldTickets);
            event = {
                auditId: uuidv4(),
                timestamp: randomRecentTimestamp(),
                type: 'ticket_verification',
                jti: uuidv4(),
                ticketId: ticket.ticketId,
                gateId: randomItem(GATES),
                deviceId: randomItem(DEVICES),
                gatekeeperId: randomItem(GATEKEEPERS),
                result: 'replay_attack',
                message: 'Tentative de rejeu détectée'
            };
        }
        // 10% - Successful logins
        else if (eventType < 0.92) {
            event = {
                auditId: uuidv4(),
                timestamp: randomRecentTimestamp(),
                type: 'authentication',
                result: 'LOGIN_SUCCESS',
                username: randomItem(USERNAMES),
                role: randomItem(['admin', 'gatekeeper']),
                ipAddress: randomItem(IP_ADDRESSES),
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            };
        }
        // 8% - Failed logins
        else {
            event = {
                auditId: uuidv4(),
                timestamp: randomRecentTimestamp(),
                type: 'authentication',
                result: 'LOGIN_FAILURE',
                username: randomItem([...USERNAMES, 'hacker123', 'admin123', 'test']),
                reason: randomItem(['invalid_password', 'user_not_found', 'account_locked']),
                ipAddress: randomItem([...IP_ADDRESSES, '198.51.100.42', '203.0.113.99']),
                userAgent: 'curl/7.68.0'
            };
        }

        if (event) {
            events.push(event);
        }
    }

    // Upload events to AWS
    console.log(`📤 Uploading ${events.length} events to AWS DynamoDB...\n`);

    for (let i = 0; i < events.length; i++) {
        const event = events[i];
        const success = await writeEvent(event);

        if (success) {
            successCount++;
            process.stdout.write(`\r✅ Progress: ${successCount}/${events.length}`);
        } else {
            failCount++;
        }

        // Rate limit to avoid throttling
        if (i % 10 === 0 && i > 0) {
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }

    console.log('\n');

    // Calculate statistics
    const validScans = events.filter(e => e.result === 'valid').length;
    const invalidScans = events.filter(e => e.result === 'invalid_jwt').length;
    const replayAttempts = events.filter(e => e.result === 'replay_attack').length;
    const successLogins = events.filter(e => e.result === 'LOGIN_SUCCESS').length;
    const failedLogins = events.filter(e => e.result === 'LOGIN_FAILURE').length;

    console.log('✅ AWS seeding complete!\n');
    console.log('📊 Summary:');
    console.log(`  • Total events: ${events.length}`);
    console.log(`  • Successfully uploaded: ${successCount}`);
    console.log(`  • Failed: ${failCount}`);
    console.log(`  • Valid ticket scans: ${validScans}`);
    console.log(`  • Invalid tickets: ${invalidScans}`);
    console.log(`  • Replay attacks: ${replayAttempts}`);
    console.log(`  • Successful logins: ${successLogins}`);
    console.log(`  • Failed logins: ${failedLogins}`);
    console.log('\n🎉 Done! Refresh your dashboard to see the data.\n');
}

// Run
const eventCount = process.argv[2] ? parseInt(process.argv[2]) : 50;

seedAWSEvents(eventCount)
    .then(() => process.exit(0))
    .catch(error => {
        console.error('\n❌ Fatal error:', error);
        process.exit(1);
    });
