const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');

// Configure AWS
AWS.config.update({ region: 'eu-west-1' });
const dynamodb = new AWS.DynamoDB.DocumentClient();

const SOLD_TICKETS_TABLE = 'can2025-secure-gates-sold-tickets-dev';
const USED_JTI_TABLE = 'can2025-secure-gates-used-jti-dev';

const { getJWTSecret } = require('../src/utils/kmsHelper');

async function getValidTickets() {
    try {
        console.log('🔄 Fetching tickets from DynamoDB...');

        // Fetch secret
        console.log('🔐 Fetching JWT Secret from KMS...');
        const secret = await getJWTSecret();

        // 1. Fetch all sold tickets
        const soldData = await dynamodb.scan({ TableName: SOLD_TICKETS_TABLE }).promise();
        const tickets = soldData.Items;
        console.log(`✅ Found ${tickets.length} sold tickets.`);

        // 2. Fetch all used JTIs (tickets already scanned)
        const usedData = await dynamodb.scan({ TableName: USED_JTI_TABLE }).promise();
        const usedJTIs = new Set(usedData.Items.map(item => item.jti));
        console.log(`ℹ️  Found ${usedJTIs.size} used tickets.`);

        console.log('\n🎫 --- VALID TICKETS (Ready to Scan) ---');
        let validCount = 0;

        tickets.forEach((t, index) => {
            const token = t.jwt;
            let decoded;
            let isSigValid = false;

            try {
                decoded = jwt.verify(token, secret);
                isSigValid = true;
            } catch (e) {
                // Signature invalid
                decoded = jwt.decode(token); // Decode anyway to see info
            }

            if (!decoded) {
                return;
            }

            const isUsed = usedJTIs.has(decoded.jti);

            if (isUsed) {
                // console.log(`[🔴 USED] ${decoded.sub}`);
            } else if (!isSigValid) {
                // console.log(`[⚠️ INVALID SIG] ${decoded.sub}`);
            } else {
                validCount++;
                console.log(`\n[🟢 VALID & SIGNED] Ticket #${index + 1}`);
                console.log(`   User: ${decoded.sub}`);
                console.log(`   Seat: ${decoded.seatNumber} (${decoded.type})`);
                console.log(`   Match: ${decoded.matchId}`);
                console.log(`   JWT: ${token}`);
            }
        });

        console.log(`\n✨ Total TRULY Valid Tickets: ${validCount}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

getValidTickets();
