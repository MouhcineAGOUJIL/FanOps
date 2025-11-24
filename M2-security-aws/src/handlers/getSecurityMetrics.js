const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const IS_OFFLINE = process.env.IS_OFFLINE === 'true';
const AUDIT_TABLE = process.env.AUDIT_TABLE;

// File-based DB for offline mode
const DB_FILE = path.join(__dirname, '../../.offline-db.json');

exports.handler = async (event) => {
    console.log('Fetching security metrics...');

    try {
        // Get recent audit logs (last 24 hours)
        const recentEvents = await getRecentEvents();

        // Aggregate metrics
        const stats = calculateStats(recentEvents);

        const metrics = {
            total: stats.totalEvents,
            valid: stats.validScans,
            invalid: stats.invalidScans,
            replay: stats.replayAttempts,
            activeGates: stats.uniqueGates,
            alerts: detectAlerts(recentEvents),
            recentEvents: recentEvents.slice(0, 10), // Latest 10
            statistics: stats,
            systemHealth: {
                lastKeyRotation: 'N/A (Manual rotation required)',
                apiStatus: 'Healthy',
                databaseStatus: 'Healthy'
            },
            timestamp: new Date().toISOString()
        };

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify(metrics)
        };

    } catch (error) {
        console.error('Error fetching security metrics:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({ error: 'Failed to fetch security metrics' })
        };
    }
};

async function getRecentEvents() {
    try {
        if (IS_OFFLINE) {
            // Read from file-based DB
            if (!fs.existsSync(DB_FILE)) {
                return [];
            }
            const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
            const auditLogs = db.audit || [];

            // Filter last 24h
            const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
            return auditLogs
                .filter(log => new Date(log.timestamp).getTime() > oneDayAgo)
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        } else {
            // In production, use DynamoDB Scan
            if (!AUDIT_TABLE) {
                console.warn('AUDIT_TABLE not configured');
                return [];
            }

            const result = await dynamodb.scan({
                TableName: AUDIT_TABLE,
                Limit: 100 // Limit to last 100 events for performance
            }).promise();

            if (!result.Items || result.Items.length === 0) {
                console.log('No audit events found');
                return [];
            }

            const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
            return result.Items
                .filter(log => new Date(log.timestamp).getTime() > oneDayAgo)
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        }
    } catch (error) {
        console.error('Error fetching recent events:', error);
        return []; // Return empty array on error instead of throwing
    }
}

function detectAlerts(events) {
    const alerts = [];

    // Detect brute force patterns
    const loginFailures = events.filter(e => e.type === 'LOGIN_FAILURE');
    const ipFailures = {};

    loginFailures.forEach(failure => {
        const ip = failure.ipAddress || 'unknown';
        ipFailures[ip] = (ipFailures[ip] || 0) + 1;
    });

    Object.entries(ipFailures).forEach(([ip, count]) => {
        if (count >= 3) {
            alerts.push({
                severity: 'high',
                type: 'BRUTE_FORCE',
                message: `${count} failed login attempts from IP ${ip}`,
                timestamp: new Date().toISOString()
            });
        }
    });

    // Detect impossible travel (simplified)
    const travelEvents = events.filter(e =>
        e.details && e.details.includes('SimulatedImpossibleTravel')
    );

    travelEvents.forEach(event => {
        alerts.push({
            severity: 'critical',
            type: 'IMPOSSIBLE_TRAVEL',
            message: `Suspicious travel detected for user ${event.userId}`,
            timestamp: event.timestamp
        });
    });

    return alerts;
}

function calculateStats(events) {
    const last24h = events;

    // Count by result field (valid, invalid_ticket, replay, etc.)
    const validScans = last24h.filter(e => e.result === 'valid').length;
    const invalidScans = last24h.filter(e =>
        e.result === 'invalid_ticket' ||
        e.result === 'invalid_jwt' ||
        e.result === 'expired'
    ).length;
    const replayAttempts = last24h.filter(e =>
        e.result === 'replay' ||
        e.result === 'replay_attack'
    ).length;

    // Count unique gates
    const uniqueGates = new Set(last24h.map(e => e.gateId).filter(Boolean)).size;

    // Track authentication events
    const loginSuccesses = last24h.filter(e => e.result === 'LOGIN_SUCCESS').length;
    const loginFailures = last24h.filter(e => e.result === 'LOGIN_FAILURE').length;
    const loginAttempts = loginSuccesses + loginFailures;

    // Total ticket scans (exclude authentication events)
    const ticketEvents = last24h.filter(e =>
        e.type !== 'authentication' &&
        !e.result?.startsWith('LOGIN')
    );
    const ticketScans = ticketEvents.length;

    return {
        totalEvents: last24h.length,
        validScans,
        invalidScans,
        replayAttempts,
        uniqueGates,
        ticketScans,
        loginAttempts,
        failedLogins: loginFailures,
        successfulLogins: loginSuccesses,
        securityAlerts: replayAttempts + invalidScans + loginFailures
    };
}
