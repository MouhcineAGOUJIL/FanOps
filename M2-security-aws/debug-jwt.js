#!/usr/bin/env node
require('dotenv').config();

console.log('🔍 JWT Secret Debugging\n');

// Check what secret each part is using
const jwt = require('jsonwebtoken');

// Check environment
console.log('1. Environment Check:');
console.log('   IS_OFFLINE:', process.env.IS_OFFLINE);
console.log('   JWT_SECRET from env:', process.env.JWT_SECRET ? '✓ SET' : '✗ NOT SET');
console.log('   JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 'N/A');
console.log('   JWT_SECRET value:', process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 10) + '...' : 'N/A');

// Check what the JWT module uses
console.log('\n2. JWT Module Check:');
try {
    const { generateTicketJWT } = require('./src/utils/jwt');
    console.log('   JWT module loaded successfully');
} catch (error) {
    console.log('   Error loading JWT module:', error.message);
}

// Test JWT generation and verification
console.log('\n3. JWT Generation Test:');
const testSecret = process.env.JWT_SECRET || 'can2025-super-secret-key-for-local-development';
const testPayload = { sub: 'test-user', ticketId: 'test-123' };

try {
    const token = jwt.sign(testPayload, testSecret);
    console.log('   Generated JWT:', token.substring(0, 50) + '...');
    
    const decoded = jwt.verify(token, testSecret);
    console.log('   ✓ JWT verification SUCCESS');
    console.log('   Decoded:', decoded);
} catch (error) {
    console.log('   ✗ JWT verification FAILED:', error.message);
}

// Test with different secrets
console.log('\n4. Secret Mismatch Test:');
try {
    const token = jwt.sign(testPayload, 'secret1');
    jwt.verify(token, 'secret2'); // Different secret
    console.log('   ✗ This should not happen!');
} catch (error) {
    console.log('   ✓ Expected failure with different secrets:', error.message);
}