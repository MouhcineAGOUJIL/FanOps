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
        const metrics = {
            alerts: detectAlerts(recentEvents),
            recentEvents: recentEvents.slice(0, 10), // Latest 10
            statistics: calculateStats(recentEvents),
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
    if (IS_OFFLINE) {
        // Read from file-based DB
        if (!fs.existsSync(DB_FILE)) {
            return [];
        }
        const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
        const auditLogs = db.AuditTable || [];

        // Filter last 24h
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        return auditLogs
            .filter(log => new Date(log.timestamp).getTime() > oneDayAgo)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } else {
        // In production, use DynamoDB Scan with filter
        // For better performance, consider using a GSI on timestamp
        const result = await dynamodb.scan({
            TableName: AUDIT_TABLE,
            // In production, add FilterExpression for last 24h
        }).promise();

        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        return result.Items
            .filter(log => new Date(log.timestamp).getTime() > oneDayAgo)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
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

    return {
        totalEvents: last24h.length,
        ticketScans: last24h.filter(e => e.type === 'TICKET_SCANNED').length,
        loginAttempts: last24h.filter(e => e.type === 'LOGIN_SUCCESS' || e.type === 'LOGIN_FAILURE').length,
        failedLogins: last24h.filter(e => e.type === 'LOGIN_FAILURE').length,
        securityAlerts: last24h.filter(e => e.type === 'SECURITY_ALERT').length
    };
}
