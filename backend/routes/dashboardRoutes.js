const express = require('express');
const router = express.Router();
const { authenticateToken, requireWorkerOrAdmin } = require('../middleware/authMiddleware');
const { getMe, getDashboard } = require('../controllers/dashboardController');

router.get('/me', authenticateToken, requireWorkerOrAdmin, getMe);
router.get('/dashboard', authenticateToken, requireWorkerOrAdmin, getDashboard);

module.exports = router;
