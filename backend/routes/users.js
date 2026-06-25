const express = require('express');
const router = express.Router();
const { createWorker } = require('../controllers/userController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

// ─── POST /api/users/worker ───────────────────────────────────────────────────
// Creates a new worker account. Admin-only.
//
// Middleware chain:
//   authenticateToken  — rejects unauthenticated requests (401)
//   requireAdmin       — rejects non-admin tokens (403)
//   createWorker       — validates input, hashes password, inserts into DB
router.post('/worker', authenticateToken, requireAdmin, createWorker);

module.exports = router;
