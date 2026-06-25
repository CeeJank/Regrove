const express = require('express');
const router = express.Router();
const { createYouthProfile, getAllYouth, getYouthById } = require('../controllers/youthController');
const { authenticateToken, requireWorkerOrAdmin } = require('../middleware/authMiddleware');

// ─── Youth Profile Routes ─────────────────────────────────────────────────────
// All three routes require:
//   1. authenticateToken  — valid JWT in the Authorization header
//   2. requireWorkerOrAdmin — caller must have role 'worker' or 'admin'
//
// Youth-role users receive 403 Forbidden on all of these.
// Unauthenticated requests receive 401 Unauthorized.

// GET /api/youth — returns all profiles, newest first
router.get('/',    authenticateToken, requireWorkerOrAdmin, getAllYouth);

// GET /api/youth/:id — returns a single profile by id
router.get('/:id', authenticateToken, requireWorkerOrAdmin, getYouthById);

// POST /api/youth — creates a new youth profile
// Only workers and admins are permitted; youth accounts must not be able to
// register other youths into the system
router.post('/',   authenticateToken, requireWorkerOrAdmin, createYouthProfile);

module.exports = router;
