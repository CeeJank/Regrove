/**
 * createAdmin.js
 * ──────────────
 * One-time bootstrap script for fresh deployments.
 * Creates the first admin account without requiring direct database access.
 *
 * Usage:
 *   node scripts/createAdmin.js
 *
 * Requirements:
 *   - .env must exist in the backend/ root with DB_* and JWT_SECRET set
 *   - PostgreSQL must be reachable
 *   - The admin table must already exist (run migrations first)
 */

// Resolve .env relative to the backend root, not the scripts/ subdirectory
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const readline = require('readline');
const bcrypt   = require('bcryptjs');
const pool     = require('../config/db');

// Helper: wrap readline.question in a promise so we can use async/await
const rl  = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (question) => new Promise((resolve) => rl.question(question, resolve));

async function main() {
  console.log('\n=== SCS Child Support Platform — Admin Bootstrap ===\n');

  // JWT_SECRET must be configured before we create the first account —
  // workers and admins will need it to log in
  if (!process.env.JWT_SECRET) {
    console.error('ERROR: JWT_SECRET is not set in .env. Set it before continuing.');
    process.exit(1);
  }

  // Collect and validate email
  const email = (await ask('Admin email: ')).trim().toLowerCase();
  if (!email || !email.includes('@')) {
    console.error('Invalid email.');
    process.exit(1);
  }

  // Collect and validate password
  const password = (await ask('Admin password (min 8 chars): ')).trim();
  if (password.length < 8) {
    console.error('Password too short.');
    process.exit(1);
  }

  // Close readline before async DB work
  rl.close();

  try {
    // Guard against accidentally creating a duplicate admin
    const existing = await pool.query('SELECT id FROM admin WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      console.error(`\nAccount already exists for: ${email}`);
      process.exit(1);
    }

    // Hash password with bcrypt cost factor 10 — same as the rest of the app
    const password_hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO admin (email, password_hash, role, is_active)
       VALUES ($1, $2, 'admin', true)
       RETURNING id, email, role`,
      [email, password_hash]
    );

    console.log('\n✓ Admin account created:');
    console.log(`  ID:    ${result.rows[0].id}`);
    console.log(`  Email: ${result.rows[0].email}`);
    console.log(`  Role:  ${result.rows[0].role}`);
    console.log('\nYou can now log in at /login.\n');
  } catch (error) {
    console.error('Failed to create admin:', error.message);
    process.exit(1);
  } finally {
    // Always close the DB pool so the script exits cleanly
    await pool.end();
  }
}

main();
