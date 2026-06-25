const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// ─── createWorker ─────────────────────────────────────────────────────────────
// Handles POST /api/users/worker
// Protected: admin token required (enforced by requireAdmin middleware in the route)
//
// Purpose: allows admins to create worker accounts through the API without
// needing direct database access.
//
// Flow:
//  1. Validate email and password are present
//  2. Enforce a minimum password length
//  3. Check for an existing account with the same email (return 409 Conflict if found)
//  4. Hash the password with bcrypt (cost factor 10)
//  5. Insert the new row into the admin table with role = 'worker'
//  6. Return the created account — id, email, role only; never the password hash
exports.createWorker = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Both fields are required
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Enforce a minimum password length before hashing
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    // Prevent duplicate accounts — normalise email to lowercase for consistency
    const existing = await pool.query(
      'SELECT id FROM admin WHERE email = $1',
      [email.toLowerCase().trim()]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'An account with that email already exists' });
    }

    // Hash the password — cost factor 10 is the standard bcrypt work factor
    // The hash is stored; the plaintext password is never persisted
    const password_hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO admin (email, password_hash, role, is_active)
       VALUES ($1, $2, 'worker', true)
       RETURNING id, email, role`,
      [email.toLowerCase().trim(), password_hash]
    );

    // Return the new account details — password_hash is excluded from RETURNING clause
    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('createWorker error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create worker account' });
  }
};
