const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { getJWTSecret } = require('../utils/kmsHelper');

// Configuration
const USERS_TABLE = process.env.USERS_TABLE || 'can2025-users';
const AUDIT_TABLE = process.env.AUDIT_TABLE || 'can2025-ticket-audit';
const IS_OFFLINE = process.env.IS_OFFLINE === 'true';
const JWT_SECRET = process.env.JWT_SECRET || 'can2025-secret-key-local';

// Cache for KMS-retrieved secret
// Cache for KMS-retrieved secret
let cachedJWTSecret = null;

// DB Setup (Offline Support)
let dynamodb;
if (IS_OFFLINE) {
    const DB_FILE = path.join(__dirname, '../../.offline-db.json');

    // Helper to read/write DB
    const getDB = () => {
        try {
            if (!fs.existsSync(DB_FILE)) return { users: {}, audit: [] };
            return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
        } catch (e) { return { users: {}, audit: [] }; }
    };

    const saveDB = (db) => fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));

    dynamodb = {
        get: (params) => ({
            promise: async () => {
                const db = getDB();
                const item = db.users ? db.users[params.Key.username] : null;
                return item ? { Item: item } : {};
            }
        }),
        put: (params) => ({
            promise: async () => {
                const db = getDB();
                if (params.TableName.includes('audit')) {
                    if (!db.audit) db.audit = [];
                    db.audit.push(params.Item);
                    saveDB(db);
                }
                return {};
            }
        })
    };
} else {
    dynamodb = new AWS.DynamoDB.DocumentClient();
}

// Helper function to log audit events
async function logAuditEvent(eventData) {
    const auditEntry = {
        auditId: uuidv4(),
        timestamp: new Date().toISOString(),
        type: 'authentication',
        ...eventData
    };

    try {
        await dynamodb.put({
            TableName: AUDIT_TABLE,
            Item: auditEntry
        }).promise();
        console.log('✅ Audit logged:', eventData.result);
    } catch (error) {
        console.error('Failed to log audit:', error);
    }
}

/**
 * Login Handler
 */
exports.login = async (event) => {
    const ipAddress = event.requestContext?.identity?.sourceIp || event.headers?.['X-Forwarded-For'] || 'unknown';
    const userAgent = event.headers?.['User-Agent'] || 'unknown'; // Corrected syntax error here

    try {
        const { username, password } = JSON.parse(event.body);

        if (!username || !password) {
            await logAuditEvent({
                type: 'authentication',
                result: 'LOGIN_FAILURE',
                username: username || 'unknown',
                reason: 'missing_credentials',
                ipAddress: event.requestContext?.identity?.sourceIp,
                userAgent: event.requestContext?.identity?.userAgent
            });
            return createResponse(400, { message: 'Username and password are required' });
        }

        // Get JWT Secret (from KMS or Env)
        let secret = JWT_SECRET;
        if (!IS_OFFLINE) {
            try {
                secret = await getJWTSecret();
            } catch (err) {
                console.error('Failed to fetch KMS secret, using fallback');
            }
        }

        // Fetch user (Scan because we don't have userId, only username)
        // In production, use a GSI on username for performance
        const result = await dynamodb.scan({
            TableName: USERS_TABLE,
            FilterExpression: 'username = :username',
            ExpressionAttributeValues: {
                ':username': username
            }
        }).promise();

        const user = result.Items && result.Items.length > 0 ? result.Items[0] : null;

        if (!user || user.password !== password) { // In prod use bcrypt.compare
            await logAuditEvent({
                type: 'authentication',
                result: 'LOGIN_FAILURE',
                username,
                reason: !user ? 'user_not_found' : 'invalid_password',
                ipAddress: event.requestContext?.identity?.sourceIp,
                userAgent: event.requestContext?.identity?.userAgent
            });
            return createResponse(401, { message: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                id: user.userId || user.username,
                username: user.username,
                role: user.role
            },
            secret,
            { expiresIn: '24h' }
        );

        await logAuditEvent({
            type: 'authentication',
            result: 'LOGIN_SUCCESS',
            username,
            role: user.role,
            ipAddress: event.requestContext?.identity?.sourceIp,
            userAgent: event.requestContext?.identity?.userAgent
        });

        return createResponse(200, {
            token,
            user: { username: user.username, role: user.role }
        });

    } catch (error) {
        console.error('Login error:', error);
        await logAuditEvent({
            result: 'LOGIN_ERROR',
            username: 'unknown',
            error: error.message,
            ipAddress,
            userAgent
        });
        return createResponse(500, { ok: false, message: 'Internal server error' });
    }
};

/**
 * Logout Handler
 */
exports.logout = async (event) => {
    // Stateless JWT logout is client-side only (discard token).
    // Server-side we just return success.
    return createResponse(200, { ok: true, message: 'Logged out successfully' });
};

function createResponse(statusCode, body) {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify(body)
    };
}
