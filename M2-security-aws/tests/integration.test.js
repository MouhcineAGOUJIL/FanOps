const axios = require('axios');
const { generateTicketJWT } = require('../src/utils/jwt');
const { v4: uuidv4 } = require('uuid');

const API_BASE = 'http://localhost:3000/dev';

describe('Integration Tests', () => {
  test('Full ticket validation flow', async () => {
    // Generate a valid JWT
    const ticketId = uuidv4();
    const jwt = generateTicketJWT(ticketId, 'USER-INTEGRATION-001', ['fan'], {
      matchId: 'CAN2025-MAR-G1',
      seatNumber: 'VIP-01'
    });

    // Test validation
    const response = await axios.post(`${API_BASE}/security/verifyTicket`, {
      jwt,
      gateId: 'G1',
      deviceId: 'integration-test'
    });

    expect(response.status).toBe(200);
    expect(response.data.ok).toBe(true);
    expect(response.data.ticketId).toBe(ticketId);
  });

  test('Gate reporting flow', async () => {
    const response = await axios.post(`${API_BASE}/security/reportGate`, {
      gateId: 'G1',
      deviceId: 'scanner-01',
      reportType: 'stats',
      validTickets: 100,
      invalidTickets: 2,
      replayAttempts: 1,
      avgScanTime: 1.2,
      errors: [],
      message: 'Integration test report'
    });

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.reportId).toBeDefined();
  });
});