const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_FILE = path.join(__dirname, '../.offline-db.json');

async function seed() {
    console.log(`🌱 Seeding Users to File DB: ${DB_FILE}...`);

    let db = { usedJTI: {}, audit: [], soldTickets: {}, users: {} };
    try {
        if (fs.existsSync(DB_FILE)) {
            db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
        }
    } catch (e) {
        console.log('Created new DB file');
    }

    if (!db.users) db.users = {};

    const users = [
        { username: 'admin', password: 'password123', role: 'admin' },
        { username: 'gk1', password: 'password123', role: 'gatekeeper', gateId: 'G1' }
    ];

    for (const u of users) {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(u.password, salt);

        db.users[u.username] = {
            username: u.username,
            passwordHash: hash,
            role: u.role,
            gateId: u.gateId,
            createdAt: new Date().toISOString()
        };

        console.log(`✅ User created: ${u.username} (${u.role})`);
    }

    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
    console.log('💾 Database saved successfully!');
}

seed();
