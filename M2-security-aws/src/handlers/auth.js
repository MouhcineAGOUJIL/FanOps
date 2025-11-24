const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Configuration
const USERS_TABLE = process.env.USERS_TABLE || 'can2025-users';
const AUDIT_TABLE = process.env.AUDIT_TABLE || 'can2025-ticket-audit';
const JWT_SECRET = process.env.JWT_SECRET || 'can2025-secret-key-local';
const isOffline = process.env.IS_OFFLINE || process.env.AWS_SAM_LOCAL;

// DB Setup (Offline Support)
let dynamodb;
if (isOffline) {
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
    const userAgent = event.headers?.['User-Agent'] || 'unknown';

    try {
        const { username, password } = JSON.parse(event.body);

        if (!username || !password) {
            await logAuditEvent({
                result: 'LOGIN_FAILURE',
                username: username || 'missing',
                reason: 'missing_credentials',
                ipAddress,
                userAgent
            });
            return createResponse(400, { ok: false, message: 'Username and password required' });
        }

        // 1. Fetch User
        const params = {
            TableName: USERS_TABLE,
            Key: { username }
        };
        const result = await dynamodb.get(params).promise();
        const user = result.Item;

        if (!user) {
            await logAuditEvent({
                result: 'LOGIN_FAILURE',
                username,
                reason: 'user_not_found',
                ipAddress,
                userAgent
            });
            return createResponse(401, { ok: false, message: 'Invalid credentials' });
        }

        // 2. Verify Password
        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) {
            await logAuditEvent({
                result: 'LOGIN_FAILURE',
                username,
                reason: 'invalid_password',
                ipAddress,
                userAgent
            });
            return createResponse(401, { ok: false, message: 'Invalid credentials' });
        }

        // 3. Generate Token
        const token = jwt.sign(
            {
                sub: user.username,
                role: user.role,
                gateId: user.gateId // Optional, for gatekeepers
            },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        // 4. Log successful login
        await logAuditEvent({
            result: 'LOGIN_SUCCESS',
            username,
            role: user.role,
            ipAddress,
            userAgent
        });

        return createResponse(200, {
            ok: true,
            token,
            user: {
                username: user.username,
                role: user.role,
                gateId: user.gateId
            }
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
