const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

// Configure AWS
const dynamodb = new AWS.DynamoDB.DocumentClient({
    region: 'eu-west-1'
});

const TICKETS_TABLE = 'can2025-secure-gates-sold-tickets-dev';
const JWT_SECRET = 'can2025-secret-key-local'; // Use same secret as deployed functions

async function seedTickets() {
    console.log(`🌱 Seeding Tickets to AWS DynamoDB: ${TICKETS_TABLE}...`);

    const tickets = [
        { userId: `USER-${Math.floor(Math.random() * 1000)}`, seat: 'A-42', type: 'STANDARD' },
        { userId: `USER-${Math.floor(Math.random() * 1000)}`, seat: 'VIP-10', type: 'VIP' },
        { userId: `USER-${Math.floor(Math.random() * 1000)}`, seat: 'B-12', type: 'STANDARD' },
        { userId: `USER-${Math.floor(Math.random() * 1000)}`, seat: 'C-55', type: 'STANDARD' },
        { userId: `USER-${Math.floor(Math.random() * 1000)}`, seat: 'VIP-5', type: 'VIP' }
    ];

    for (const ticket of tickets) {
        const ticketId = uuidv4();
        const jti = uuidv4();

        // Create JWT token
        const token = jwt.sign(
            {
                sub: ticket.userId,
                ticketId: ticketId,
                scopes: ['fan'],
                jti: jti,
                matchId: 'CAN2025-MAR-G1',
                seatNumber: ticket.seat,
                type: ticket.type
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        try {
            await dynamodb.put({
                TableName: TICKETS_TABLE,
                Item: {
                    ticketId: ticketId,
                    userId: ticket.userId,
                    matchId: 'CAN2025-MAR-G1',
                    seatNumber: ticket.seat,
                    type: ticket.type,
                    jwt: token,
                    usedAt: null,
                    gate: null,
                    status: 'valid'
                }
            }).promise();

            console.log(`✅ Ticket created: ${ticketId}`);
            console.log(`   JWT: ${token.substring(0, 50)}...`);
            console.log(`   Seat: ${ticket.seat}`);
            console.log('---');
        } catch (error) {
            console.error(`❌ Failed to create ticket ${ticketId}:`, error.message);
        }
    }

    console.log('✅ Tickets seeded successfully!');
}

seedTickets().catch(console.error);
