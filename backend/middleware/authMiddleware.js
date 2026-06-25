const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// ─── authenticateToken ────────────────────────────────────────────────────────
// Express middleware that reads the Authorization header, extracts the JWT,
// verifies its signature and expiry, then attaches the decoded payload to
// req.user so downstream route handlers can read the caller's identity.
//
// Expected header format:
//   Authorization: Bearer <jwt>
//
// On success:   calls next() with req.user = { userId, role, iat, exp }
// On failure:   returns 401 with a JSON error — the request stops here
//
// This must run BEFORE any role-check middleware (requireWorkerOrAdmin, requireAdmin).
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Extract token from "Bearer <token>" — reject anything that doesn't match
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  let decoded;
  try {
    // jwt.verify throws if the token is expired, tampered with, or signed with a different secret
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    const message = error.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid or expired token';
    return res.status(401).json({ success: false, message });
  }

  // Resolve profile ids from the DB. If the DB is unavailable, proceed with
  // null ids — downstream controllers will return 403 for operations that
  // strictly require them, rather than the misleading "Invalid or expired token".
  const resolvedUser = { ...decoded, workerId: null, childId: null };

  try {
    if (decoded.role === 'worker' || decoded.role === 'admin') {
      const workerResult = await pool.query(
        'SELECT id FROM worker_profiles WHERE user_id = $1 LIMIT 1',
        [decoded.userId]
      );
      resolvedUser.workerId = workerResult.rows[0]?.id ?? null;
    }

    if (decoded.role === 'youth') {
      const childResult = await pool.query(
        'SELECT id FROM youth_profiles WHERE user_id = $1 LIMIT 1',
        [decoded.userId]
      );
      resolvedUser.childId = childResult.rows[0]?.id ?? null;
    }
  } catch (dbError) {
    console.warn('authMiddleware: DB unavailable, proceeding with workerId/childId = null:', dbError.message);
  }

  req.user = resolvedUser;
  return next();
};

// ─── requireWorkerOrAdmin ─────────────────────────────────────────────────────
// Role-guard middleware. Must run AFTER authenticateToken.
//
// Allows:  role === 'worker'  OR  role === 'admin'
// Blocks:  role === 'child'   → 403 Forbidden
//
// Used on all child-management endpoints — child accounts should never be able
// to read or modify the child profile catalogue.
const requireWorkerOrAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'worker' && req.user.role !== 'admin')) {
    return res.status(403).json({ success: false, message: 'Forbidden: worker or admin access required' });
  }
  return next();
};

// ─── requireWorker ────────────────────────────────────────────────────────────
// Alias for requireWorkerOrAdmin kept for backward compatibility.
// Existing code that imports requireWorker continues to work without changes.
const requireWorker = requireWorkerOrAdmin;

// ─── requireAdmin ─────────────────────────────────────────────────────────────
// Strict role-guard middleware. Must run AFTER authenticateToken.
//
// Allows:  role === 'admin' only
// Blocks:  workers and children → 403 Forbidden
//
// Used on privileged operations such as creating new worker accounts.
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden: admin access required' });
  }
  return next();
};

module.exports = { authenticateToken, requireWorkerOrAdmin, requireWorker, requireAdmin };
