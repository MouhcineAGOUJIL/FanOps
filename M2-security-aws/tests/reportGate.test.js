const AWS = require('aws-sdk');
const { handler } = require('../src/handlers/reportGate');

// Mock AWS SDK
jest.mock('aws-sdk', () => {
    const mDocumentClient = {
        put: jest.fn().mockReturnThis(),
        promise: jest.fn(),
    };
    return {
        DynamoDB: {
            DocumentClient: jest.fn(() => mDocumentClient),
        },
    };
});

describe('reportGate Lambda', () => {
    let mDocumentClient;

    beforeAll(() => {
        mDocumentClient = new AWS.DynamoDB.DocumentClient();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('Should save a valid stats report', async () => {
        mDocumentClient.promise.mockResolvedValueOnce({});

        const event = {
            body: JSON.stringify({
                gateId: 'G1',
                deviceId: 'scanner-01',
                reportType: 'stats',
                validTickets: 100,
                invalidTickets: 5,
                replayAttempts: 1,
                avgScanTime: 1.2
            })
        };

        const response = await handler(event);
        const body = JSON.parse(response.body);

        expect(response.statusCode).toBe(200);
        expect(body.success).toBe(true);
        expect(body.message).toBe('Rapport enregistré avec succès');
        expect(mDocumentClient.put).toHaveBeenCalledTimes(1);

        // Verify payload sent to DynamoDB
        const putCall = mDocumentClient.put.mock.calls[0][0];
        expect(putCall.TableName).toBeDefined();
        expect(putCall.Item.gateId).toBe('G1');
        expect(putCall.Item.reportType).toBe('stats');
        expect(putCall.Item.data.validTickets).toBe(100);
    });

    test('Should return 400 if missing parameters', async () => {
        const event = {
            body: JSON.stringify({
                gateId: 'G1'
                // Missing deviceId and reportType
            })
        };

        const response = await handler(event);
        const body = JSON.parse(response.body);

        expect(response.statusCode).toBe(400);
        expect(body.success).toBe(false);
        expect(mDocumentClient.put).not.toHaveBeenCalled();
    });

    test('Should handle DynamoDB errors gracefully', async () => {
        mDocumentClient.promise.mockRejectedValueOnce(new Error('DynamoDB Error'));

        const event = {
            body: JSON.stringify({
                gateId: 'G1',
                deviceId: 'scanner-01',
                reportType: 'stats'
            })
        };

        const response = await handler(event);
        const body = JSON.parse(response.body);

        expect(response.statusCode).toBe(500);
        expect(body.success).toBe(false);
        expect(body.message).toBe('Erreur interne du serveur');
    });
});
