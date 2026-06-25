const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
// Public endpoint — no authentication middleware required here.
// The login controller handles credential verification and JWT issuance.
router.post('/login', login);

module.exports = router;
