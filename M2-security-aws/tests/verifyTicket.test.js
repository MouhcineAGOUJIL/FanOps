const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

process.env.IS_OFFLINE = 'true';
const JWT_SECRET = process.env.JWT_SECRET || 'can2025-secret-key-local-test';
process.env.JWT_SECRET = JWT_SECRET;

const { handler, mockStorage } = require('../src/handlers/verifyTicket');

function generateTestJWT(payload = {}) {
  const defaultPayload = {
    sub: 'USER-TEST',
    ticketId: uuidv4(),
    scopes: ['fan'],
    jti: uuidv4(),
    matchId: 'CAN2025-MAR-G1',
    seatNumber: 'A-42',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600
  };

  return jwt.sign({ ...defaultPayload, ...payload }, JWT_SECRET);
}

describe('verifyTicket Lambda', () => {

  beforeAll(() => {
    // Seed mock DB
    mockStorage.soldTickets.set('TEST-001', {
      ticketId: 'TEST-001',
      status: 'active',
      matchId: 'CAN2025-MAR-G1'
    });

    mockStorage.soldTickets.set('TEST-GK-001', {
      ticketId: 'TEST-GK-001',
      status: 'active',
      matchId: 'CAN2025-MAR-G1'
    });

    mockStorage.soldTickets.set('TEST-CANCELLED', {
      ticketId: 'TEST-CANCELLED',
      status: 'cancelled',
      matchId: 'CAN2025-MAR-G1'
    });
  });

  test('Devrait accepter un billet valide', async () => {
    const validJWT = generateTestJWT({
      ticketId: 'TEST-001',
      matchId: 'CAN2025-MAR-G1'
    });

    const event = {
      body: JSON.stringify({
        jwt: validJWT,
        gateId: 'G1',
        deviceId: 'test-scanner'
      })
    };

    const response = await handler(event);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.reason).toBe('valid');
  });

  test('Devrait rejeter un JWT invalide', async () => {
    const event = {
      body: JSON.stringify({
        jwt: 'invalid.jwt.token',
        gateId: 'G1',
        deviceId: 'test-scanner'
      })
    };

    const response = await handler(event);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(body.ok).toBe(false);
    expect(body.reason).toBe('invalid_jwt');
  });

  test('Devrait rejeter si paramètres manquants', async () => {
    const event = {
      body: JSON.stringify({
        jwt: 'some.jwt.token'
      })
    };

    const response = await handler(event);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(400);
    expect(body.ok).toBe(false);
    expect(body.reason).toBe('missing_parameters');
  });

  test('Devrait détecter une attaque de rejeu', async () => {
    const jti = uuidv4();
    const ticketId = 'TEST-REPLAY-001';

    // Register ticket
    mockStorage.soldTickets.set(ticketId, {
      ticketId,
      status: 'active',
      matchId: 'CAN2025-MAR-G1'
    });

    const validJWT = generateTestJWT({ jti, ticketId });

    const event = {
      body: JSON.stringify({
        jwt: validJWT,
        gateId: 'G1',
        deviceId: 'test-scanner'
      })
    };

    // Premier appel (doit réussir)
    const response1 = await handler(event);
    const body1 = JSON.parse(response1.body);
    expect(body1.ok).toBe(true);

    // Deuxième appel avec même JWT (doit échouer - rejeu)
    const response2 = await handler(event);
    const body2 = JSON.parse(response2.body);
    expect(body2.ok).toBe(false);
    expect(body2.reason).toBe('replay');
  });

  test('Devrait accepter un billet avec gatekeeperId', async () => {
    const validJWT = generateTestJWT({
      ticketId: 'TEST-GK-001',
      matchId: 'CAN2025-MAR-G1'
    });

    const event = {
      body: JSON.stringify({
        jwt: validJWT,
        gateId: 'G1',
        deviceId: 'test-scanner',
        gatekeeperId: 'GK-123'
      })
    };

    const response = await handler(event);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.reason).toBe('valid');
  });

  test('Devrait rejeter un billet non vendu', async () => {
    const validJWT = generateTestJWT({
      ticketId: 'UNKNOWN-TICKET',
      matchId: 'CAN2025-MAR-G1'
    });

    const event = {
      body: JSON.stringify({
        jwt: validJWT,
        gateId: 'G1',
        deviceId: 'test-scanner'
      })
    };

    const response = await handler(event);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(body.ok).toBe(false);
    expect(body.reason).toBe('invalid_ticket');
    expect(body.message).toContain('non vendu');
  });

  test('Devrait rejeter un billet annulé', async () => {
    const validJWT = generateTestJWT({
      ticketId: 'TEST-CANCELLED',
      matchId: 'CAN2025-MAR-G1'
    });

    const event = {
      body: JSON.stringify({
        jwt: validJWT,
        gateId: 'G1',
        deviceId: 'test-scanner'
      })
    };

    const response = await handler(event);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(body.ok).toBe(false);
    expect(body.reason).toBe('invalid_ticket');
    expect(body.message).toContain('invalide');
  });

});