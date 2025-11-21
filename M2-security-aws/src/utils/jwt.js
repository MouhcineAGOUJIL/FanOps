// src/utils/jwt.js
const jwt = require('jsonwebtoken');
const { validate: uuidValidate } = require('uuid');
const { v4: uuidv4 } = require('uuid');

// DEBUG: Log the secret being used
const JWT_SECRET = process.env.JWT_SECRET || 'can2025-super-secret-key-for-local-development';
console.log('🔑 JWT Module - Secret being used:', JWT_SECRET ? '✓ Environment variable' : '✗ Default fallback');

/**
 * Generates a JWT for a ticket.
 */
function generateTicketJWT(ticketId, userId, scopes = ['fan'], additionalClaims = {}) {
  console.log('🎫 Generating JWT with secret length:', JWT_SECRET.length);
  
  if (!uuidValidate(ticketId)) {
    throw new Error('Invalid ticketId format. Must be a UUID.');
  }
  if (!userId) {
    throw new Error('User ID is required.');
  }

  const payload = {
    sub: userId,
    ticketId,
    scopes,
    jti: uuidv4(),
    matchId: additionalClaims.matchId || 'CAN2025-TEST-MATCH',
    seatNumber: additionalClaims.seatNumber || 'TEST-SEAT',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
  };

  const token = jwt.sign(payload, JWT_SECRET);
  console.log('✅ JWT Generated successfully');
  return token;
}

/**
 * Verifies a ticket JWT.
 */
function verifyTicketJWT(token) {
  console.log('🔍 Verifying JWT with secret length:', JWT_SECRET.length);
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ JWT Verification SUCCESS');
    return decoded;
  } catch (error) {
    console.log('❌ JWT Verification FAILED:', error.message);
    throw new Error('Invalid or expired token.');
  }
}

/**
 * Generates a JWT for ticket verification.
 */
function generateVerificationJWT(gateId, deviceId) {
  if (!gateId || !deviceId) {
    throw new Error('Gate ID and Device ID are required.');
  }

  const payload = {
    sub: 'gate-device',
    gateId,
    deviceId,
    scopes: ['gate-ops'],
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '5m' });
}

/**
 * Verifies a verification JWT.
 */
function verifyVerificationJWT(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('JWT verification failed:', error.message);
    throw new Error('Invalid or expired verification token.');
  }
}

module.exports = {
  generateTicketJWT,
  verifyTicketJWT,
  generateVerificationJWT,
  verifyVerificationJWT,
};