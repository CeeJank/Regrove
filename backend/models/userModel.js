const pool = require('../config/db');

async function findWorkerAccountByEmail(email) {
  const { rows } = await pool.query(
    'SELECT id FROM admin WHERE email = $1',
    [email]
  );
  return rows[0] ?? null;
}

async function createWorkerAccount({ email, password_hash }) {
  const { rows } = await pool.query(
    `INSERT INTO admin (email, password_hash, role, is_active)
     VALUES ($1, $2, 'worker', true)
     RETURNING id, email, role`,
    [email, password_hash]
  );
  return rows[0];
}

module.exports = { findWorkerAccountByEmail, createWorkerAccount };
