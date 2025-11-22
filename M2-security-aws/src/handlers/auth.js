const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Configuration
const USERS_TABLE = process.env.USERS_TABLE || 'can2025-users';
const JWT_SECRET = process.env.JWT_SECRET || 'can2025-secret-key-local';
const isOffline = process.env.IS_OFFLINE || process.env.AWS_SAM_LOCAL;

// DB Setup (Offline Support)
let dynamodb;
if (isOffline) {
    const DB_FILE = path.join(__dirname, '../../.offline-db.json');

    // Helper to read/write DB
    const getDB = () => {
        try {
            if (!fs.existsSync(DB_FILE)) return { users: {} };
            return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
        } catch (e) { return { users: {} }; }
    };

    dynamodb = {
        get: (params) => ({
            promise: async () => {
                const db = getDB();
                const item = db.users ? db.users[params.Key.username] : null;
                return item ? { Item: item } : {};
            }
        })
    };
} else {
    dynamodb = new AWS.DynamoDB.DocumentClient();
}

/**
 * Login Handler
 */
exports.login = async (event) => {
    try {
        const { username, password } = JSON.parse(event.body);

        if (!username || !password) {
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
            return createResponse(401, { ok: false, message: 'Invalid credentials' });
        }

        // 2. Verify Password
        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) {
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
