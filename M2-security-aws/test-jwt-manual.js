#!/usr/bin/env node
require('dotenv').config();

console.log('🧪 Manual JWT Test\n');

// Use the exact same imports as your Lambda
const { generateTicketJWT } = require('./src/utils/jwt');
const { v4: uuidv4 } = require('uuid');

console.log('1. Generating JWT...');
const ticketId = uuidv4();
const userId = 'USER-TEST-001';

try {
    const jwtToken = generateTicketJWT(ticketId, userId, ['fan'], {
        matchId: 'CAN2025-MAR-G1',
        seatNumber: 'A-42'
    });
    
    console.log('✅ JWT Generated:', jwtToken);
    console.log('TicketID:', ticketId);
    console.log('UserID:', userId);
    
    console.log('\n2. Testing with curl command:');
    console.log(`curl -X POST http://localhost:3000/dev/security/verifyTicket \\`);
    console.log(`  -H "Content-Type: application/json" \\`);
    console.log(`  -d '{"jwt":"${jwtToken}","gateId":"G1","deviceId":"test"}'`);
    
} catch (error) {
    console.log('❌ Error:', error.message);
}