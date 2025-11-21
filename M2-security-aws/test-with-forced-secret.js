// test-with-forced-secret.js
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// Force the same secret everywhere
const FORCED_SECRET = 'can2025-super-secret-key-for-local-development';

console.log('🔧 Forced Secret Test\n');

const payload = {
    sub: 'USER-FORCED-001',
    ticketId: uuidv4(),
    scopes: ['fan'],
    jti: uuidv4(),
    matchId: 'CAN2025-MAR-G1',
    seatNumber: 'A-42',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600
};

console.log('1. Generating with forced secret...');
const token = jwt.sign(payload, FORCED_SECRET);
console.log('✅ JWT:', token);

console.log('\n2. Test this JWT:');
console.log(`curl -X POST http://localhost:3000/dev/security/verifyTicket \\`);
console.log(`  -H "Content-Type: application/json" \\`);
console.log(`  -d '{"jwt":"${token}","gateId":"G1","deviceId":"test"}'`);