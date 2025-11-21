// src/handlers/verifyTicket.js
console.log('🚀 verifyTicket.js loaded');
console.log('🔑 Process JWT_SECRET:', process.env.JWT_SECRET ? `✓ (length: ${process.env.JWT_SECRET.length})` : '✗ NOT SET');
console.log('🔑 Using JWT_SECRET:', process.env.JWT_SECRET || 'can2025-secret-key-change-in-production');

const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// Configure AWS SDK for offline development
const isOffline = process.env.IS_OFFLINE || process.env.AWS_SAM_LOCAL;
const JWT_SECRET = 'can2025-super-secret-key-for-local-development'; // Hardcoded
// Mock storage for offline mode
const mockStorage = {
  usedJTI: new Map(),
  audit: []
};

let dynamodb, sqs;

if (isOffline) {
  console.log('🔧 Running in OFFLINE mode - using mock services');
  
  // Mock DynamoDB
  dynamodb = {
    get: (params) => ({
      promise: async () => {
        if (params.TableName.includes('used-jti')) {
          const item = mockStorage.usedJTI.get(params.Key.jti);
          return item ? { Item: item } : {};
        }
        return {};
      }
    }),
    put: (params) => ({
      promise: async () => {
        if (params.TableName.includes('used-jti')) {
          mockStorage.usedJTI.set(params.Item.jti, params.Item);
        } else if (params.TableName.includes('audit')) {
          mockStorage.audit.push(params.Item);
        }
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
const SECURITY_QUEUE_URL = process.env.SECURITY_QUEUE_URL;

/**
 * Lambda Handler - Vérification de billet
 */
exports.handler = async (event) => {
  console.log('📨 Event received');

  try {
    // Parse le body
    const body = JSON.parse(event.body);
    const { jwt: ticketJWT, gateId, deviceId } = body;

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
      decoded = jwt.verify(ticketJWT, JWT_SECRET);
      console.log('✅ JWT decoded successfully');
    } catch (error) {
      console.log('❌ JWT verification failed:', error.message);
      await logAudit({
        ticketJWT: ticketJWT.substring(0, 50) + '...',
        gateId,
        deviceId,
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

    // 4. ANTI-REJEU : Vérifier si le JTI a déjà été utilisé
    const jtiExists = await checkJTIExists(jti);
    if (jtiExists) {
      console.log('🚫 Replay attack detected for JTI:', jti);
      await logAudit({
        jti,
        ticketId,
        gateId,
        deviceId,
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