const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// ─── login ────────────────────────────────────────────────────────────────────
// Handles POST /api/auth/login
//
// Flow:
//  1. Validate that email and password are present in the request body
//  2. Look up the user by email in the admin table (stores all user accounts)
//  3. Reject if the account doesn't exist or is deactivated (is_active = false)
//  4. Use bcrypt.compare to verify the submitted password against the stored hash
//     — we never store or compare plaintext passwords
//  5. Sign a JWT containing userId and role, valid for 7 days
//  6. Return the token and safe user info (id, email, role) — never password_hash
//
// All invalid-credential cases return the same generic message ("Invalid email or password")
// to prevent email enumeration attacks.
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic presence check before hitting the database
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Normalise email to lowercase so login is case-insensitive
    const result = await pool.query(
      'SELECT id, email, password_hash, role, is_active FROM admin WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    const user = result.rows[0];

    // Treat missing accounts and deactivated accounts identically to avoid leaking
    // whether a given email address is registered
    if (!user || !user.is_active) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // bcrypt.compare handles the timing-safe comparison — never do string equality here
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // JWT payload contains only the minimum needed for authorisation decisions
    // — userId to identify the caller, role for permission checks
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return the token and a safe subset of the user record
    // password_hash is deliberately excluded from the response
    return res.status(200).json({
      success: true,
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('login error:', error);
    return res.status(500).json({ success: false, message: 'Login failed' });
  }
};
