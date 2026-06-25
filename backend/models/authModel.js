const pool = require('../config/db');

async function findUserByEmail(email) {
  const { rows } = await pool.query(
    `SELECT
       u.id,
       u.email,
       u.password_hash,
       u.role,
       u.is_active,
       COALESCE(wp.full_name, yp.full_name) AS full_name
     FROM users u
     LEFT JOIN worker_profiles wp ON wp.user_id = u.id
     LEFT JOIN youth_profiles yp ON yp.user_id = u.id
     WHERE u.email = $1`,
    [email]
  );
  return rows[0] ?? null;
}

async function checkEmailExists(email) {
  const { rows } = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );
  return rows.length > 0;
}

async function createUserAndWorkerProfile({ normalizedEmail, password_hash, fullName }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: userRows } = await client.query(
      `INSERT INTO users (email, password_hash, role, is_active)
       VALUES ($1, $2, 'worker', true)
       RETURNING id, email, role`,
      [normalizedEmail, password_hash]
    );
    const user = userRows[0];

    await client.query(
      `INSERT INTO worker_profiles (user_id, full_name, specialization, bio)
       VALUES ($1, $2, NULL, NULL)`,
      [user.id, fullName]
    );

    await client.query('COMMIT');
    return user;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { findUserByEmail, checkEmailExists, createUserAndWorkerProfile };
