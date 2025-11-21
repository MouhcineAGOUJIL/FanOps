const { handler } = require('../src/handlers/verifyTicket');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const JWT_SECRET = process.env.JWT_SECRET || 'can2025-secret-key-local-test';

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
    process.env.IS_OFFLINE = 'true';
    process.env.JWT_SECRET = JWT_SECRET;
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
    const validJWT = generateTestJWT({ jti });

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

});