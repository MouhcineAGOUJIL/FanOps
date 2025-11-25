const https = require('https');
const zlib = require('zlib');
const crypto = require('crypto');

// Configuration - Get these from Environment Variables
const WORKSPACE_ID = process.env.SENTINEL_WORKSPACE_ID;
const SHARED_KEY = process.env.SENTINEL_SHARED_KEY;
const LOG_TYPE = 'FanOps_M2'; // Custom Log Table Name in Sentinel (Azure adds _CL)

/**
 * Azure Log Analytics Data Collector API
 * https://learn.microsoft.com/en-us/azure/azure-monitor/logs/data-collector-api
 */
function postDataToSentinel(body) {
    return new Promise((resolve, reject) => {
        if (!WORKSPACE_ID || !SHARED_KEY) {
            return reject(new Error('Missing Sentinel Configuration (WORKSPACE_ID or SHARED_KEY)'));
        }

        const contentLength = Buffer.byteLength(body, 'utf8');
        const date = new Date().toUTCString();

        // Create Signature
        const stringToSign = 'POST\n' + contentLength + '\napplication/json\n' + 'x-ms-date:' + date + '\n/api/logs';
        const signature = crypto.createHmac('sha256', Buffer.from(SHARED_KEY, 'base64'))
            .update(stringToSign, 'utf8')
            .digest('base64');
        const authorization = 'SharedKey ' + WORKSPACE_ID + ':' + signature;

        const options = {
            hostname: `${WORKSPACE_ID}.ods.opinsights.azure.com`,
            port: 443,
            path: `/api/logs?api-version=2016-04-01`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authorization,
                'Log-Type': LOG_TYPE,
                'x-ms-date': date,
                'time-generated-field': 'TimeGenerated', // Optional: use specific timestamp field
                'Content-Length': contentLength
            }
        };

        const req = https.request(options, (res) => {
            let responseBody = '';
            res.on('data', (chunk) => responseBody += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(responseBody);
                } else {
                    reject(new Error(`Sentinel API Error: ${res.statusCode} ${responseBody}`));
                }
            });
        });

        req.on('error', (err) => reject(err));
        req.write(body);
        req.end();
    });
}

exports.handler = (event, context, callback) => {
    const payload = Buffer.from(event.awslogs.data, 'base64');

    zlib.gunzip(payload, async (err, result) => {
        if (err) {
            return callback(err);
        }

        const parsed = JSON.parse(result.toString('utf8'));
        console.log(`Decoded payload: ${parsed.logEvents.length} events from ${parsed.logGroup}`);

        const sentinelEvents = parsed.logEvents.map(logEvent => {
            // Try to parse JSON message if possible
            let messageObj = logEvent.message;
            try {
                // Extract JSON from message if it looks like "TIMESTAMP REQUEST_ID INFO JSON"
                const jsonPart = logEvent.message.substring(logEvent.message.indexOf('{'));
                if (jsonPart) {
                    messageObj = JSON.parse(jsonPart);
                }
            } catch (e) {
                // Keep original string if not JSON
            }

            return {
                TimeGenerated: new Date(logEvent.timestamp).toISOString(),
                SourceSystem: 'AWS_Lambda',
                LogGroup: parsed.logGroup,
                LogStream: parsed.logStream,
                Message: messageObj,
                RawMessage: logEvent.message,
                FunctionVersion: parsed.functionVersion || '$LATEST'
            };
        });

        try {
            if (sentinelEvents.length > 0) {
                await postDataToSentinel(JSON.stringify(sentinelEvents));
                console.log(`Successfully sent ${sentinelEvents.length} logs to Sentinel.`);
            }
            callback(null, `Successfully processed ${parsed.logEvents.length} log events.`);
        } catch (error) {
            console.error('Failed to send logs to Sentinel:', error);
            callback(error);
        }
    });
};
