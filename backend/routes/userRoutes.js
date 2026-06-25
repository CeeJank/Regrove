const express = require('express');
const router = express.Router();
const { createWorker } = require('../controllers/userController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

router.post('/worker', authenticateToken, requireAdmin, createWorker);

module.exports = router;
