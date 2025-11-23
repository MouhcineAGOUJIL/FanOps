const AWS = require('aws-sdk');
const bcrypt = require('bcrypt');

// Configure AWS
const dynamodb = new AWS.DynamoDB.DocumentClient({
    region: 'eu-west-1'
});

const USERS_TABLE = 'can2025-secure-gates-users-dev';

async function seedUsers() {
    console.log(`🌱 Seeding Users to AWS DynamoDB: ${USERS_TABLE}...`);

    const users = [
        {
            userId: 'admin',
            password: await bcrypt.hash('admin123', 10),
            role: 'admin',
            name: 'Administrator'
        },
        {
            userId: 'gatekeeper1',
            password: await bcrypt.hash('gate123', 10),
            role: 'gatekeeper',
            name: 'Gate Keeper 1'
        },
        {
            userId: 'gatekeeper2',
            password: await bcrypt.hash('gate123', 10),
            role: 'gatekeeper',
            name: 'Gate Keeper 2'
        }
    ];

    for (const user of users) {
        try {
            await dynamodb.put({
                TableName: USERS_TABLE,
                Item: user
            }).promise();

            console.log(`✅ User created: ${user.userId} (role: ${user.role})`);
        } catch (error) {
            console.error(`❌ Failed to create user ${user.userId}:`, error.message);
        }
    }

    console.log('✅ Users seeded successfully!');
}

seedUsers().catch(console.error);
