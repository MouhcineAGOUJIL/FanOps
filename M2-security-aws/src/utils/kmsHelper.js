/**
 * KMS Helper Utilities
 * Provides encryption/decryption functions using AWS KMS
 */

const AWS = require('aws-sdk');

const kms = new AWS.KMS({ region: process.env.AWS_REGION || 'eu-west-1' });
const ssm = new AWS.SSM({ region: process.env.AWS_REGION || 'eu-west-1' });

// Cache for JWT secret to avoid repeated SSM calls
let cachedJWTSecret = null;
let cacheTimestamp = null;
const CACHE_TTL = 3600000; // 1 hour

/**
 * Get JWT secret from SSM Parameter Store (KMS encrypted)
 * Caches the secret for 1 hour to reduce SSM API calls
 */
async function getJWTSecret() {
    try {
        // Return cached secret if still valid
        if (cachedJWTSecret && cacheTimestamp && (Date.now() - cacheTimestamp) < CACHE_TTL) {
            console.log('Using cached JWT secret');
            return cachedJWTSecret;
        }

        const paramName = process.env.JWT_SECRET_PARAM || '/can2025/dev/jwt-secret';
        console.log(`Fetching JWT secret from SSM: ${paramName}`);

        const response = await ssm.getParameter({
            Name: paramName,
            WithDecryption: true // KMS decrypts automatically
        }).promise();

        // Cache the secret
        cachedJWTSecret = response.Parameter.Value;
        cacheTimestamp = Date.now();

        console.log('✅ JWT secret retrieved and cached');
        return cachedJWTSecret;
    } catch (error) {
        console.error('❌ Failed to get JWT secret from SSM:', error.message);

        // Fallback to environment variable if SSM fails
        const fallback = process.env.JWT_SECRET;
        if (fallback) {
            console.warn('⚠️ Using fallback JWT_SECRET from environment');
            return fallback;
        }

        throw new Error('JWT secret not available');
    }
}

/**
 * Decrypt data using KMS directly
 * @param {string} encryptedData - Base64 encoded encrypted data
 * @returns {string} Decrypted plaintext
 */
async function decryptData(encryptedData) {
    try {
        const params = {
            CiphertextBlob: Buffer.from(encryptedData, 'base64')
        };

        const result = await kms.decrypt(params).promise();
        return result.Plaintext.toString('utf-8');
    } catch (error) {
        console.error('KMS decrypt error:', error.message);
        throw error;
    }
}

/**
 * Encrypt data using KMS
 * @param {string} plaintext - Data to encrypt
 * @param {string} keyId - KMS key ID or alias (default: alias/can2025-jwt-secret)
 * @returns {string} Base64 encoded encrypted data
 */
async function encryptData(plaintext, keyId = 'alias/can2025-jwt-secret') {
    try {
        const params = {
            KeyId: keyId,
            Plaintext: plaintext
        };

        const result = await kms.encrypt(params).promise();
        return result.CiphertextBlob.toString('base64');
    } catch (error) {
        console.error('KMS encrypt error:', error.message);
        throw error;
    }
}

/**
 * Clear cached JWT secret (useful for testing or manual rotation)
 */
function clearSecretCache() {
    cachedJWTSecret = null;
    cacheTimestamp = null;
    console.log('JWT secret cache cleared');
}

/**
 * Get parameter from SSM (generic)
 * @param {string} paramName - SSM parameter name
 * @param {boolean} decrypt - Whether to decrypt the value
 * @returns {string} Parameter value
 */
async function getParameter(paramName, decrypt = true) {
    try {
        const response = await ssm.getParameter({
            Name: paramName,
            WithDecryption: decrypt
        }).promise();

        return response.Parameter.Value;
    } catch (error) {
        console.error(`Failed to get parameter ${paramName}:`, error.message);
        throw error;
    }
}

module.exports = {
    getJWTSecret,
    decryptData,
    encryptData,
    clearSecretCache,
    getParameter
};
