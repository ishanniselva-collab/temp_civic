/**
 * Creates or updates a known demo account for local testing.
 * Run: cd backend && npm run seed-demo
 */
const bcrypt = require('bcrypt');
const pool = require('../src/config/database');

const DEMO = {
  name: 'Demo User',
  email: 'demo@civicfix.local',
  password: 'CivicFix123!',
  role: 'citizen',
};

async function seed() {
  const password_hash = await bcrypt.hash(DEMO.password, 10);
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [DEMO.email]);

  if (existing.rows?.length > 0) {
    await pool.query(
      'UPDATE users SET name = $1, password_hash = $2, role = $3 WHERE email = $4',
      [DEMO.name, password_hash, DEMO.role, DEMO.email]
    );
    console.log(`Updated demo user: ${DEMO.email}`);
  } else {
    await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)',
      [DEMO.name, DEMO.email, password_hash, DEMO.role]
    );
    console.log(`Created demo user: ${DEMO.email}`);
  }
  console.log('Password:', DEMO.password);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
