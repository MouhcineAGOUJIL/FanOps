#!/usr/bin/env node
require('dotenv').config();
const { generateTicketJWT } = require('../src/utils/jwt');
const { v4: uuidv4 } = require('uuid');

console.log('\n🎫 CAN 2025 - Générateur de JWT de Test (Complet)\n');
console.log('='.repeat(50));

// Use the same secret as the server
const JWT_SECRET = process.env.JWT_SECRET || 'can2025-super-secret-key-for-local-development';
console.log('Using JWT Secret:', JWT_SECRET);

// Generate JWTs with all required fields
const testScenarios = [
  {
    name: 'Billet Valide Standard',
    ticketId: uuidv4(),
    userId: 'USER-001',
    additional: {
      matchId: 'CAN2025-MAR-G1',
      seatNumber: 'A-42'
    }
  },
  {
    name: 'Billet VIP',
    ticketId: uuidv4(),
    userId: 'USER-002', 
    additional: {
      matchId: 'CAN2025-MAR-G1',
      seatNumber: 'VIP-10',
      category: 'VIP'
    }
  }
];

testScenarios.forEach(scenario => {
  console.log(`\n📌 ${scenario.name}:`);
  const jwt = generateTicketJWT(
    scenario.ticketId, 
    scenario.userId, 
    ['fan'],
    scenario.additional
  );
  console.log('JWT:', jwt);
  console.log(`TicketID: ${scenario.ticketId}`);
  console.log(`UserID: ${scenario.userId}`);
  console.log(`MatchID: ${scenario.additional.matchId}`);
  console.log(`Seat: ${scenario.additional.seatNumber}`);
});

console.log('\n' + '='.repeat(50));
console.log('\n✅ Test avec curl:\n');
console.log('curl -X POST http://localhost:3000/dev/security/verifyTicket \\');
console.log('  -H "Content-Type: application/json" \\');
console.log('  -d \'{"jwt":"PASTE-JWT-HERE","gateId":"G1","deviceId":"test"}\'');
console.log('\n');