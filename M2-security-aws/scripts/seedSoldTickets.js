const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'can2025-secret-key-local';
const DB_FILE = path.join(__dirname, '../.offline-db.json');

async function seed() {
    console.log(`🌱 Seeding to File DB: ${DB_FILE}...`);

    // Load existing DB or create new
    let db = { usedJTI: {}, audit: [], soldTickets: {} };
    try {
        if (fs.existsSync(DB_FILE)) {
            db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
        }
    } catch (e) {
        console.log('Created new DB file');
    }

    // Ensure structure
    if (!db.soldTickets) db.soldTickets = {};

    const tickets = [
        { type: 'STANDARD', seat: 'A-42', match: 'CAN2025-MAR-G1' },
        { type: 'VIP', seat: 'VIP-10', match: 'CAN2025-MAR-G1' },
        { type: 'STANDARD', seat: 'B-12', match: 'CAN2025-MAR-G1' }
    ];

    for (const t of tickets) {
        const ticketId = uuidv4();
        const userId = `USER-${Math.floor(Math.random() * 1000)}`;

        // Generate JWT
        const payload = {
            sub: userId,
            ticketId,
            scopes: ['fan'],
            jti: uuidv4(),
            matchId: t.match,
            seatNumber: t.seat,
            type: t.type
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

        // Store in DB
        const item = {
            ticketId,
            userId,
            matchId: t.match,
            seatNumber: t.seat,
            status: 'active', // active, cancelled, refunded
            purchaseDate: new Date().toISOString(),
            price: t.type === 'VIP' ? 200 : 50
        };

        db.soldTickets[ticketId] = item;

        console.log(`✅ Ticket created: ${ticketId}`);
        console.log(`   JWT: ${token}`);
        console.log(`   Seat: ${t.seat}`);
        console.log('---');
    }

    // Save DB
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
    console.log('💾 Database saved successfully!');
}

seed();
