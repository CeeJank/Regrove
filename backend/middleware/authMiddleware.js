const jwt = require('jsonwebtoken');

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
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Extract token from "Bearer <token>" — reject anything that doesn't match
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    // jwt.verify throws if the token is expired, tampered with, or signed with a different secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded payload so controllers can read req.user.userId and req.user.role
    req.user = decoded; // shape: { userId, role, iat, exp }
    return next();
  } catch (error) {
    // Distinguish expired tokens from outright invalid ones for a clearer client message
    const message = error.name === 'TokenExpiredError'
      ? 'Token expired'
      : 'Invalid or expired token';
    return res.status(401).json({ success: false, message });
  }
};

// ─── requireWorkerOrAdmin ─────────────────────────────────────────────────────
// Role-guard middleware. Must run AFTER authenticateToken.
//
// Allows:  role === 'worker'  OR  role === 'admin'
// Blocks:  role === 'youth'   → 403 Forbidden
//
// Used on all youth-management endpoints — youth accounts should never be able
// to read or modify the youth profile catalogue.
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
// Blocks:  workers and youth → 403 Forbidden
//
// Used on privileged operations such as creating new worker accounts.
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden: admin access required' });
  }
  return next();
};

module.exports = { authenticateToken, requireWorkerOrAdmin, requireWorker, requireAdmin };
