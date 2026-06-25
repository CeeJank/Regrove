const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// Backed by the existing youth_profiles table until a database migration renames it.
exports.createChildProfileRecord = async (data) => {
  const {
    full_name,
    username,
    email,
    password,
    age,
    school,
    interests,
    category,
    status,
    latest_risk_level,
  } = data;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    let userId = null;
    if (email && password) {
      const normalizedEmail = email.toLowerCase().trim();
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [normalizedEmail]
      );

      if (existingUser.rows.length > 0) {
        throw new Error('An account with that email already exists');
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const userInsert = await client.query(
        `INSERT INTO users (email, password_hash, role, is_active)
         VALUES ($1, $2, 'youth', true)
         RETURNING id`,
        [normalizedEmail, passwordHash]
      );
      userId = userInsert.rows[0].id;
    }

    const result = await client.query(
      `INSERT INTO youth_profiles
        (user_id, full_name, age, school, interests, category, status, latest_risk_level)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        userId,
        full_name,
        age || null,
        school || null,
        interests || null,
        category || null,
        status || 'ACTIVE',
        latest_risk_level || 'LOW',
      ]
    );

    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
};

exports.getAllChildProfiles = async () => {
  const result = await pool.query(
    `SELECT id, full_name, age, school, interests, category, status, latest_risk_level, created_at
     FROM youth_profiles
     ORDER BY created_at DESC`
  );
  return result.rows;
};

exports.getChildProfileRecordById = async (id) => {
  const result = await pool.query(
    `SELECT id, full_name, age, school, interests, category, status, latest_risk_level, created_at, updated_at
     FROM youth_profiles
     WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
};
