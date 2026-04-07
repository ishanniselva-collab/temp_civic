const bcrypt = require('bcrypt');
const pool = require('./database');

/** Known-good account so local login always works after init (password reset each boot). */
async function ensureDemoLoginAccount() {
    const email = 'demo@civicfix.local';
    const password = 'CivicFix123!';
    const name = 'Demo User';
    const password_hash = await bcrypt.hash(password, 10);
    const found = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (found.rows?.length > 0) {
        await pool.query(
            `UPDATE users SET password_hash = $1, name = $2, role = $3, updated_at = CURRENT_TIMESTAMP
             WHERE email = $4`,
            [password_hash, name, 'citizen', email]
        );
    } else {
        await pool.query(
            'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)',
            [name, email, password_hash, 'citizen']
        );
    }
    console.log(`✓ Demo login: ${email} / ${password}`);
}

const initDatabase = async () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS complaints (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            complaint_id TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT,
            area TEXT NOT NULL,
            city TEXT NOT NULL,
            landmark TEXT,
            issue_type TEXT NOT NULL,
            description TEXT NOT NULL,
            severity TEXT DEFAULT 'medium',
            duration TEXT,
            allow_volunteers TEXT DEFAULT 'no',
            want_updates TEXT DEFAULT 'no',
            image_url TEXT,
            latitude REAL,
            longitude REAL,
            status TEXT DEFAULT 'Pending',
            department TEXT DEFAULT 'General Administration',
            supporter_count INTEGER DEFAULT 1,
            user_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `;

    const createUsersTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            latitude REAL,
            longitude REAL,
            role TEXT DEFAULT 'citizen',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `;

    const createCommentsTableQuery = `
        CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            complaint_id TEXT NOT NULL,
            author_name TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `;

    const createComplaintJoinsTableQuery = `
        CREATE TABLE IF NOT EXISTS complaint_joins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            complaint_id INTEGER NOT NULL,
            user_id INTEGER,
            session_id TEXT,
            joined_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        await pool.query(createTableQuery);
        await pool.query(createUsersTableQuery);
        await pool.query(createCommentsTableQuery);
        await pool.query(createComplaintJoinsTableQuery);

        // If complaints table already existed before user_id was added, do a safe ALTER first.
        const columnsInfo = await pool.query("SELECT name FROM pragma_table_info('complaints')");
        const existingColumnNames = (columnsInfo.rows || []).map((c) => c.name);
        if (!existingColumnNames.includes('user_id')) {
            await pool.query('ALTER TABLE complaints ADD COLUMN user_id INTEGER');
        }
        
        if (!existingColumnNames.includes('duration')) {
            await pool.query('ALTER TABLE complaints ADD COLUMN duration TEXT');
        }
        
        if (!existingColumnNames.includes('allow_volunteers')) {
            await pool.query('ALTER TABLE complaints ADD COLUMN allow_volunteers TEXT DEFAULT "no"');
        }
        
        if (!existingColumnNames.includes('want_updates')) {
            await pool.query('ALTER TABLE complaints ADD COLUMN want_updates TEXT DEFAULT "no"');
        }
        
        // SQLite doesn't support IF NOT EXISTS for CREATE INDEX before version 3.27
        // But better-sqlite3 handles common errors. We'll wrap individual index creations.
        const indices = [
            'CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status)',
            'CREATE INDEX IF NOT EXISTS idx_complaints_department ON complaints(department)',
            'CREATE INDEX IF NOT EXISTS idx_complaints_complaint_id ON complaints(complaint_id)',
            'CREATE INDEX IF NOT EXISTS idx_complaints_user_id ON complaints(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_comments_complaint_id ON comments(complaint_id)',
            'CREATE INDEX IF NOT EXISTS idx_joins_complaint_id ON complaint_joins(complaint_id)',
            'CREATE INDEX IF NOT EXISTS idx_joins_user_id ON complaint_joins(user_id)',
        ];

        for (const index of indices) {
            await pool.query(index);
        }

        await ensureDemoLoginAccount();

        console.log('Complaints table and indices created successfully');
    } catch (err) {
        console.error('Error creating complaints table:', err);
        throw err;
    }
};

// Run if called directly
if (require.main === module) {
    initDatabase()
        .then(() => {
            console.log('Database initialization complete');
            process.exit(0);
        })
        .catch((err) => {
            console.error('Database initialization failed:', err);
            process.exit(1);
        });
}

module.exports = initDatabase;