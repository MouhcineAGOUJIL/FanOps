const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_FILE = path.join(__dirname, '../.offline-db.json');

async function seedUsers() {
    console.log(`🌱 Seeding Users to File DB: ${DB_FILE}...`);

    // Hash passwords properly with salt rounds
    const adminHash = await bcrypt.hash('admin123', 10);
    const gkHash = await bcrypt.hash('gate123', 10);

    const users = {
        'admin': {
            username: 'admin',
            passwordHash: adminHash,
            role: 'admin',
            createdAt: new Date().toISOString()
        },
        'gatekeeper1': {
            username: 'gatekeeper1',
            passwordHash: gkHash,
            role: 'gatekeeper',
            gateId: 'G1',
            createdAt: new Date().toISOString()
        }
    };

    // Load existing DB or create new
    let db = { users: {}, soldTickets: {}, usedJti: {}, audit: [] };
    if (fs.existsSync(DB_FILE)) {
        db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    }

    // Merge users
    db.users = { ...db.users, ...users };

    // Save
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));

    console.log('✅ User created: admin (password: admin123)');
    console.log('✅ User created: gatekeeper1 (password: gate123)');
    console.log('💾 Database saved successfully!');
}

seedUsers().catch(console.error);
