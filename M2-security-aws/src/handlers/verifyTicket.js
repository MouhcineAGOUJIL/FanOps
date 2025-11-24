// src/handlers/verifyTicket.js
console.log('🚀 verifyTicket.js loaded');
console.log('🔑 Process JWT_SECRET:', process.env.JWT_SECRET ? `✓ (length: ${process.env.JWT_SECRET.length})` : '✗ NOT SET');
console.log('🔑 Using JWT_SECRET:', process.env.JWT_SECRET || 'can2025-secret-key-change-in-production');

const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { getJWTSecret } = require('../utils/kmsHelper');

// Configure AWS SDK for offline development
const isOffline = process.env.IS_OFFLINE === 'true' || process.env.AWS_SAM_LOCAL === 'true';
const JWT_SECRET = process.env.JWT_SECRET || 'can2025-secret-key-local';

console.log('🌍 Running mode:', isOffline ? 'OFFLINE (local)' : 'AWS Lambda');
console.log('🔑 JWT_SECRET:', JWT_SECRET);
// Mock storage for offline mode
const mockStorage = {
  usedJTI: new Map(),
  audit: [],
  soldTickets: new Map()
};

let dynamodb, sqs;

const fs = require('fs');
const path = require('path');
const DB_FILE = path.join(__dirname, '../../.offline-db.json');

if (isOffline) {
  console.log('🔧 Running in OFFLINE mode - using File-based Mock DB');
  console.log('📂 DB File:', DB_FILE);

  // Helper to read/write DB
  const getDB = () => {
    try {
      if (!fs.existsSync(DB_FILE)) return { usedJTI: {}, audit: [], soldTickets: {} };
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch (e) { return { usedJTI: {}, audit: [], soldTickets: {} }; }
  };

  const saveDB = (db) => fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));

  // Mock DynamoDB with File Persistence
  dynamodb = {
    get: (params) => ({
      promise: async () => {
        const db = getDB();
        if (params.TableName.includes('used-jti')) {
          const item = db.usedJTI[params.Key.jti];
          return item ? { Item: item } : {};
        } else if (params.TableName.includes('sold-tickets')) {
          const item = db.soldTickets[params.Key.ticketId];
          return item ? { Item: item } : {};
        }
        return {};
      }
    }),
    put: (params) => ({
      promise: async () => {
        const db = getDB();
        if (params.TableName.includes('used-jti')) {
          db.usedJTI[params.Item.jti] = params.Item;
        } else if (params.TableName.includes('audit')) {
          db.audit.push(params.Item);
        } else if (params.TableName.includes('sold-tickets')) {
          db.soldTickets[params.Item.ticketId] = params.Item;
        }
        saveDB(db);
        console.log(`📝 Mock DB: Saved to ${params.TableName}`);
        return {};
      }
    })
  };

  // Mock SQS
  sqs = {
    sendMessage: (params) => ({
      promise: async () => {
        console.log('🚨 MOCK SECURITY ALERT:', JSON.parse(params.MessageBody));
        return {};
      }
    })
  };
} else {
  // Production AWS services
  dynamodb = new AWS.DynamoDB.DocumentClient();
  sqs = new AWS.SQS();
}

const USED_JTI_TABLE = process.env.USED_JTI_TABLE || 'can2025-used-jti';
const AUDIT_TABLE = process.env.AUDIT_TABLE || 'can2025-ticket-audit';
const SOLD_TICKETS_TABLE = process.env.SOLD_TICKETS_TABLE || 'can2025-sold-tickets';
const SECURITY_QUEUE_URL = process.env.SECURITY_QUEUE_URL;

/**
 * Lambda Handler - Vérification de billet
 */
exports.mockStorage = mockStorage;
exports.handler = async (event) => {
  console.log('📨 Event received');

  try {
    // Parse le body
    const body = JSON.parse(event.body);
    const { jwt: ticketJWT, gateId, deviceId, gatekeeperId } = body;

    // Validation des paramètres
    if (!ticketJWT || !gateId || !deviceId) {
      return createResponse(400, {
        ok: false,
        reason: 'missing_parameters',
        message: 'jwt, gateId et deviceId sont requis'
      });
    }

    // 1. Vérifier et décoder le JWT
    let decoded;
    try {
      // Get JWT Secret (from KMS or Env)
      let secret = JWT_SECRET;
      if (!isOffline) {
        try {
          secret = await getJWTSecret();
        } catch (err) {
          console.error('Failed to fetch KMS secret, using fallback');
        }
      }

      decoded = jwt.verify(ticketJWT, secret);
      console.log('✅ JWT decoded successfully');
    } catch (error) {
      console.log('❌ JWT verification failed:', error.message);
      await logAudit({
        ticketJWT: ticketJWT.substring(0, 50) + '...',
        gateId,
        deviceId,
        gatekeeperId,
        result: 'invalid_jwt',
        error: error.message
      });

      return createResponse(200, {
        ok: false,
        reason: 'invalid_jwt',
        message: 'Token JWT invalide ou expiré'
      });
    }

    // 2. Vérifier les claims du JWT
    const { jti, ticketId, matchId, seatNumber, exp, sub } = decoded;

    // In offline mode, we might not have all fields, so be more flexible
    if (!ticketId || !sub) {
      return createResponse(200, {
        ok: false,
        reason: 'invalid_claims',
        message: 'Claims JWT manquants (ticketId et sub requis)'
      });
    }

    // 3. Vérifier l'expiration
    const now = Math.floor(Date.now() / 1000);
    if (exp && exp < now) {
      await logAudit({
        jti: jti || 'unknown',
        ticketId,
        gateId,
        deviceId,
        gatekeeperId,
        result: 'expired',
        exp,
        now
      });

      return createResponse(200, {
        ok: false,
        reason: 'expired',
        message: 'Le billet a expiré'
      });
    }

    // 4. Vérifier si le billet a bien été VENDU (Base de référence)
    const ticketStatus = await checkSoldTicket(ticketId);
    if (!ticketStatus.valid) {
      console.log('🚫 Unsold/Invalid ticket detected:', ticketId);
      await logAudit({
        ticketId,
        gateId,
        deviceId,
        gatekeeperId,
        result: 'invalid_ticket',
        message: ticketStatus.message
      });

      return createResponse(200, {
        ok: false,
        reason: 'invalid_ticket',
        message: ticketStatus.message
      });
    }

    // 5. ANTI-REJEU : Vérifier si le JTI a déjà été utilisé
    const jtiExists = await checkJTIExists(jti);
    if (jtiExists) {
      console.log('🚫 Replay attack detected for JTI:', jti);
      await logAudit({
        jti,
        ticketId,
        gateId,
        deviceId,
        gatekeeperId,
        result: 'replay_attack',
        message: 'Tentative de rejeu détectée'
      });

      await sendSecurityAlert({
        type: 'REPLAY_ATTACK',
        jti,
        ticketId,
        gateId,
        deviceId,
        timestamp: new Date().toISOString()
      });

      return createResponse(200, {
        ok: false,
        reason: 'replay',
        message: 'Ce billet a déjà été utilisé'
      });
    }

    // 5. Marquer le JTI comme utilisé
    await markJTIAsUsed(jti, ticketId, gateId);

    // 6. Logger l'audit (succès)
    await logAudit({
      jti: jti || uuidv4(),
      ticketId,
      matchId: matchId || 'CAN2025-TEST-MATCH',
      seatNumber: seatNumber || 'TEST-SEAT',
      gateId,
      deviceId,
      gatekeeperId,
      result: 'valid',
      timestamp: new Date().toISOString()
    });

    console.log('🎫 Ticket validated successfully:', ticketId);

    // 7. Réponse succès
    return createResponse(200, {
      ok: true,
      reason: 'valid',
      ticketId,
      matchId: matchId || 'CAN2025-TEST-MATCH',
      seatNumber: seatNumber || 'TEST-SEAT',
      message: 'Billet valide, accès autorisé'
    });

  } catch (error) {
    console.error('💥 Error:', error);

    return createResponse(500, {
      ok: false,
      reason: 'internal_error',
      message: 'Erreur interne du serveur: ' + error.message
    });
  }

  /**
   * Vérifier si le billet existe dans la base des ventes
   */
  async function checkSoldTicket(ticketId) {
    try {
      const params = {
        TableName: SOLD_TICKETS_TABLE,
        Key: { ticketId }
      };

      const result = await dynamodb.get(params).promise();
      const ticket = result.Item;

      if (!ticket) {
        return { valid: false, message: 'Billet inconnu (non vendu)' };
      }

      if (ticket.status && ticket.status !== 'active' && ticket.status !== 'valid') {
        return { valid: false, message: `Billet invalide (Statut: ${ticket.status})` };
      }

      return { valid: true };
    } catch (error) {
      console.error('Error checking sold ticket:', error.message);

      if (isOffline) {
        console.log('OFFLINE: Assuming ticket is sold and active');
        return { valid: true };
      }
      // En cas d'erreur DB, on bloque par sécurité (fail-closed)
      return { valid: false, message: 'Erreur de vérification des ventes' };
    }
  }
};

/**
 * Vérifier si un JTI existe déjà (anti-rejeu)
 */
async function checkJTIExists(jti) {
  try {
    const params = {
      TableName: USED_JTI_TABLE,
      Key: { jti }
    };

    const result = await dynamodb.get(params).promise();
    return !!result.Item;
  } catch (error) {
    console.error('Error checking JTI:', error.message);

    // In offline mode with mocks, this shouldn't fail
    if (isOffline) {
      console.log('OFFLINE: Assuming JTI does not exist');
      return false;
    }
    throw error;
  }
}

/**
 * Marquer un JTI comme utilisé
 */
async function markJTIAsUsed(jti, ticketId, gateId) {
  const params = {
    TableName: USED_JTI_TABLE,
    Item: {
      jti,
      ticketId,
      gateId,
      usedAt: new Date().toISOString(),
      ttl: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // Expire après 24h
    }
  };

  try {
    await dynamodb.put(params).promise();
    console.log('📌 JTI marked as used:', jti);
  } catch (error) {
    console.error('Error marking JTI:', error.message);

    if (isOffline) {
      console.log('OFFLINE: JTI marking simulated');
    }
  }
}

/**
 * Logger dans la table d'audit
 */
async function logAudit(data) {
  const params = {
    TableName: AUDIT_TABLE,
    Item: {
      auditId: uuidv4(),
      timestamp: new Date().toISOString(),
      ...data
    }
  };

  try {
    await dynamodb.put(params).promise();
    console.log('📊 Audit logged:', data.result);
  } catch (error) {
    console.error('Error logging audit:', error.message);

    if (isOffline) {
      console.log('OFFLINE: Audit event simulated:', data.result);
    }
  }
}

/**
 * Envoyer une alerte de sécurité via SQS
 */
async function sendSecurityAlert(alert) {
  if (!SECURITY_QUEUE_URL && !isOffline) {
    console.warn('Security queue URL not configured');
    return;
  }

  try {
    if (isOffline) {
      console.log('🚨 MOCK SECURITY ALERT:', alert);
      return;
    }

    const params = {
      QueueUrl: SECURITY_QUEUE_URL,
      MessageBody: JSON.stringify(alert),
      MessageAttributes: {
        alertType: {
          DataType: 'String',
          StringValue: alert.type
        },
        severity: {
          DataType: 'String',
          StringValue: 'HIGH'
        }
      }
    };

    await sqs.sendMessage(params).promise();
    console.log('Security alert sent:', alert.type);
  } catch (error) {
    console.error('Error sending security alert:', error.message);
  }
}

/**
 * Créer une réponse HTTP
 */
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