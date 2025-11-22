const AWS = require('aws-sdk');
const crypto = require('crypto');

const ssm = new AWS.SSM();

/**
 * Automatic JWT Secret Rotation Handler
 * 
 * This function rotates the JWT signing secret stored in SSM Parameter Store.
 * It follows a grace period approach to avoid disrupting active user sessions.
 * 
 * Rotation Strategy:
 * 1. Generate a new cryptographically secure secret
 * 2. Store as /can2025/{stage}/jwt-secret-new
 * 3. After grace period (24h), promote new secret to active
 * 4. Archive old secret for audit purposes
 */
exports.handler = async (event) => {
    console.log('Starting JWT secret rotation...');

    const stage = process.env.SSM_PARAMETER_PATH || '/can2025/dev/jwt-secret';
    const currentSecretPath = stage;
    const newSecretPath = `${stage}-new`;
    const archivedSecretPath = `${stage}-archived-${Date.now()}`;

    try {
        // Step 1: Generate new cryptographically secure secret
        const newSecret = crypto.randomBytes(64).toString('hex');
        console.log('Generated new secret (first 10 chars):', newSecret.substring(0, 10) + '...');

        // Step 2: Retrieve current secret (to archive it later)
        let currentSecret;
        try {
            const currentParam = await ssm.getParameter({
                Name: currentSecretPath,
                WithDecryption: true
            }).promise();
            currentSecret = currentParam.Parameter.Value;
            console.log('Retrieved current secret');
        } catch (error) {
            if (error.code === 'ParameterNotFound') {
                console.log('No existing secret found. This might be the first rotation.');
                currentSecret = null;
            } else {
                throw error;
            }
        }

        // Step 3: Check if there's a pending new secret (grace period in progress)
        let pendingSecret;
        try {
            const pendingParam = await ssm.getParameter({
                Name: newSecretPath,
                WithDecryption: true
            }).promise();
            pendingSecret = pendingParam.Parameter.Value;
            console.log('Found pending secret from previous rotation');

            // Promote pending secret to active
            await ssm.putParameter({
                Name: currentSecretPath,
                Value: pendingSecret,
                Type: 'SecureString',
                Overwrite: true,
                Description: `JWT Secret (rotated on ${new Date().toISOString()})`
            }).promise();
            console.log('Promoted pending secret to active');

            // Archive old current secret
            if (currentSecret) {
                await ssm.putParameter({
                    Name: archivedSecretPath,
                    Value: currentSecret,
                    Type: 'SecureString',
                    Description: `Archived JWT Secret (replaced on ${new Date().toISOString()})`
                }).promise();
                console.log('Archived old secret');
            }

            // Delete pending secret
            await ssm.deleteParameter({ Name: newSecretPath }).promise();
            console.log('Cleaned up pending secret');

        } catch (error) {
            if (error.code === 'ParameterNotFound') {
                console.log('No pending secret found. Creating new one.');

                // Store new secret as pending
                await ssm.putParameter({
                    Name: newSecretPath,
                    Value: newSecret,
                    Type: 'SecureString',
                    Description: `Pending JWT Secret (created on ${new Date().toISOString()}). Will be activated in next rotation.`
                }).promise();
                console.log('Created new pending secret. It will be activated in the next rotation cycle (grace period).');
            } else {
                throw error;
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Secret rotation completed successfully',
                timestamp: new Date().toISOString()
            })
        };

    } catch (error) {
        console.error('Error during secret rotation:', error);
        throw error;
    }
};
