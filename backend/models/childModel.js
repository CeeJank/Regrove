const pool = require('../config/db');

// Backed by the existing youth_profiles table until a database migration renames it.
exports.createChildProfileRecord = async (data) => {
  const {
    full_name,
    age,
    school,
    interests,
    category,
    status,
    latest_risk_level,
  } = data;

  const result = await pool.query(
    `INSERT INTO youth_profiles
      (full_name, age, school, interests, category, status, latest_risk_level)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      full_name,
      age || null,
      school || null,
      interests || null,
      category || null,
      status || 'ACTIVE',
      latest_risk_level || 'LOW',
    ]
  );

  return result.rows[0];
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
