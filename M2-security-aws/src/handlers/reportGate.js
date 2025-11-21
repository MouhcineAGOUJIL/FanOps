// src/handlers/reportGate.js
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const AUDIT_TABLE = process.env.AUDIT_TABLE || 'can2025-ticket-audit';

/**
 * Lambda Handler - Rapport de statut d'un portique
 * Permet aux scanners de remonter des stats/événements
 */
exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    const body = JSON.parse(event.body);
    const {
      gateId,
      deviceId,
      reportType, // 'stats', 'error', 'warning'
      validTickets,
      invalidTickets,
      replayAttempts,
      avgScanTime,
      errors,
      message
    } = body;

    // Validation
    if (!gateId || !deviceId || !reportType) {
      return createResponse(400, {
        success: false,
        message: 'gateId, deviceId et reportType sont requis'
      });
    }

    // Créer l'entrée de rapport
    const report = {
      reportId: uuidv4(),
      gateId,
      deviceId,
      reportType,
      timestamp: new Date().toISOString(),
      data: {
        validTickets: validTickets || 0,
        invalidTickets: invalidTickets || 0,
        replayAttempts: replayAttempts || 0,
        avgScanTime: avgScanTime || 0,
        errors: errors || []
      },
      message: message || ''
    };

    // Sauvegarder dans DynamoDB
    await saveReport(report);

    console.log('Gate report saved:', report.reportId);

    return createResponse(200, {
      success: true,
      reportId: report.reportId,
      message: 'Rapport enregistré avec succès'
    });

  } catch (error) {
    console.error('Error:', error);

    return createResponse(500, {
      success: false,
      message: 'Erreur interne du serveur',
      error: error.message
    });
  }
};

/**
 * Sauvegarder le rapport dans DynamoDB
 */
async function saveReport(report) {
  const params = {
    TableName: AUDIT_TABLE,
    Item: {
      auditId: report.reportId,
      timestamp: report.timestamp,
      type: 'gate_report',
      ...report
    }
  };

  try {
    await dynamodb.put(params).promise();
  } catch (error) {
    console.error('Error saving report:', error);
    throw error;
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