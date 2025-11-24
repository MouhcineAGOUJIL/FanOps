#!/usr/bin/env node

/**
 * Seed Security Events - Generate realistic security audit data
 * This script populates the audit table with various types of events:
 * - Successful ticket scans
 * - Invalid ticket attempts
 * - Replay attacks
 * - Login attempts (success/failure)
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DB_FILE = path.join(__dirname, '../.offline-db.json');
const IS_OFFLINE = process.env.IS_OFFLINE !== 'false';

// Sample data
const GATES = ['G1', 'G2', 'G3', 'VIP-ENTRANCE'];
const DEVICES = ['scanner-01', 'scanner-02', 'scanner-03', 'mobile-scanner-A'];
const GATEKEEPERS = ['GK-001', 'GK-002', 'GK-003'];
const USERNAMES = ['admin', 'gk1', 'security_admin', 'operator1'];
const IP_ADDRESSES = ['192.168.1.10', '192.168.1.20', '10.0.0.5', '172.16.0.8', '203.0.113.45'];

// Helper to generate random item from array
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Helper to generate timestamp in last 24 hours
const randomRecentTimestamp = () => {
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    const randomTime = oneDayAgo + Math.random() * (now - oneDayAgo);
    return new Date(randomTime).toISOString();
};

// Load DB
function getDB() {
    try {
        if (!fs.existsSync(DB_FILE)) {
            return { users: {}, audit: [], soldTickets: {}, usedJTI: {} };
        }
        return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch (e) {
        return { users: {}, audit: [], soldTickets: {}, usedJTI: {} };
    }
}

function saveDB(db) {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// Generate events
function generateSecurityEvents(count = 50) {
    const db = getDB();
    const newEvents = [];

    // Get ticket IDs from sold tickets
    const ticketIds = Object.keys(db.soldTickets || {});

    console.log(`\n🎯 Generating ${count} security events...\n`);

    for (let i = 0; i < count; i++) {
        const eventType = Math.random();

        // 60% - Valid ticket scans
        if (eventType < 0.6 && ticketIds.length > 0) {
            const ticketId = randomItem(ticketIds);
            const ticket = db.soldTickets[ticketId];
            newEvents.push({
                auditId: uuidv4(),
                timestamp: randomRecentTimestamp(),
                type: 'ticket_verification',
                jti: uuidv4(),
                ticketId,
                matchId: ticket?.matchId || 'CAN2025-MAR-G1',
                seatNumber: ticket?.seatNumber || 'UNKNOWN',
                gateId: randomItem(GATES),
                deviceId: randomItem(DEVICES),
                gatekeeperId: randomItem(GATEKEEPERS),
                result: 'valid'
            });
        }
        // 15% - Invalid tickets
        else if (eventType < 0.75) {
            newEvents.push({
                auditId: uuidv4(),
                timestamp: randomRecentTimestamp(),
                type: 'ticket_verification',
                ticketJWT: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                gateId: randomItem(GATES),
                deviceId: randomItem(DEVICES),
                gatekeeperId: randomItem(GATEKEEPERS),
                result: 'invalid_jwt',
                error: randomItem(['invalid signature', 'jwt malformed', 'token expired'])
            });
        }
        // 10% - Replay attacks
        else if (eventType < 0.85 && ticketIds.length > 0) {
            const ticketId = randomItem(ticketIds);
            newEvents.push({
                auditId: uuidv4(),
                timestamp: randomRecentTimestamp(),
                type: 'ticket_verification',
                jti: uuidv4(),
                ticketId,
                gateId: randomItem(GATES),
                deviceId: randomItem(DEVICES),
                gatekeeperId: randomItem(GATEKEEPERS),
                result: 'replay_attack',
                message: 'Tentative de rejeu détectée'
            });
        }
        // 10% - Successful logins
        else if (eventType < 0.92) {
            newEvents.push({
                auditId: uuidv4(),
                timestamp: randomRecentTimestamp(),
                type: 'authentication',
                result: 'LOGIN_SUCCESS',
                username: randomItem(USERNAMES),
                role: randomItem(['admin', 'gatekeeper']),
                ipAddress: randomItem(IP_ADDRESSES),
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            });
        }
        // 8% - Failed logins
        else {
            newEvents.push({
                auditId: uuidv4(),
                timestamp: randomRecentTimestamp(),
                type: 'authentication',
                result: 'LOGIN_FAILURE',
                username: randomItem([...USERNAMES, 'hacker123', 'admin123', 'test']),
                reason: randomItem(['invalid_password', 'user_not_found', 'account_locked']),
                ipAddress: randomItem([...IP_ADDRESSES, '198.51.100.42', '203.0.113.99']),
                userAgent: 'curl/7.68.0'
            });
        }
    }

    // Sort by timestamp
    newEvents.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // Add to existing audit logs
    if (!db.audit) db.audit = [];
    db.audit.push(...newEvents);

    // Keep only last 500 events to avoid bloat
    if (db.audit.length > 500) {
        db.audit = db.audit.slice(-500);
    }

    saveDB(db);

    // Calculate statistics
    const validScans = newEvents.filter(e => e.result === 'valid').length;
    const invalidScans = newEvents.filter(e => e.result === 'invalid_jwt').length;
    const replayAttempts = newEvents.filter(e => e.result === 'replay_attack').length;
    const successLogins = newEvents.filter(e => e.result === 'LOGIN_SUCCESS').length;
    const failedLogins = newEvents.filter(e => e.result === 'LOGIN_FAILURE').length;

    console.log('✅ Security events generated!\n');
    console.log('📊 Summary:');
    console.log(`  • Total events generated: ${newEvents.length}`);
    console.log(`  • Valid ticket scans: ${validScans}`);
    console.log(`  • Invalid tickets: ${invalidScans}`);
    console.log(`  • Replay attacks: ${replayAttempts}`);
    console.log(`  • Successful logins: ${successLogins}`);
    console.log(`  • Failed logins: ${failedLogins}`);
    console.log(`\n📁 Total audit entries in DB: ${db.audit.length}\n`);
}

// Run
const eventCount = process.argv[2] ? parseInt(process.argv[2]) : 50;
generateSecurityEvents(eventCount);

console.log('🎉 Done! Refresh your Security Dashboard to see the data.\n');
