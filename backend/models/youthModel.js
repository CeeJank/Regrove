const pool = require('../config/db');

<<<<<<< HEAD
// ─── createYouthProfile ───────────────────────────────────────────────────────
// Inserts a new row into the youth_profiles table.
//
// Only the columns that exist in the actual schema are mapped here.
// Optional fields default to null if omitted, except status (ACTIVE) and
// latest_risk_level (LOW) which have meaningful application defaults.
//
// All values are passed as parameterised query arguments ($1, $2 …) — never
// interpolated into the SQL string — to prevent SQL injection.
//
// Returns the full inserted row via RETURNING *.
=======
>>>>>>> feature-youthcatalogue
exports.createYouthProfile = async (data) => {
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
<<<<<<< HEAD
      age || null,               // undefined/empty string → null
      school || null,
      interests || null,
      category || null,
      status || 'ACTIVE',        // default to ACTIVE if not supplied
      latest_risk_level || 'LOW', // default to LOW if not supplied
=======
      age || null,
      school || null,
      interests || null,
      category || null,
      status || 'ACTIVE',
      latest_risk_level || 'LOW',
>>>>>>> feature-youthcatalogue
    ]
  );

  return result.rows[0];
};

<<<<<<< HEAD
// ─── getAllYouth ──────────────────────────────────────────────────────────────
// Fetches all youth profiles, sorted newest-first.
//
// Only selects the columns needed by the catalogue view — avoids pulling
// any fields that don't exist in the current schema.
=======
>>>>>>> feature-youthcatalogue
exports.getAllYouth = async () => {
  const result = await pool.query(
    `SELECT id, full_name, age, school, interests, category, status, latest_risk_level, created_at
     FROM youth_profiles
     ORDER BY created_at DESC`
  );
  return result.rows;
};

<<<<<<< HEAD
// ─── getYouthById ─────────────────────────────────────────────────────────────
// Fetches a single youth profile by primary key.
//
// Returns the row object if found, or null if no matching id exists.
// The controller layer is responsible for turning null into a 404 response.
=======
>>>>>>> feature-youthcatalogue
exports.getYouthById = async (id) => {
  const result = await pool.query(
    `SELECT id, full_name, age, school, interests, category, status, latest_risk_level, created_at, updated_at
     FROM youth_profiles
     WHERE id = $1`,
    [id]
  );
<<<<<<< HEAD
  // Return null explicitly so the controller can detect "not found" cleanly
=======
>>>>>>> feature-youthcatalogue
  return result.rows[0] || null;
};
