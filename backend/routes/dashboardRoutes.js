const express = require('express');
const router = express.Router();
const { authenticateToken, requireWorkerOrAdmin } = require('../middleware/authMiddleware');
const { getRecentChildrenForWorker } = require('../controllers/dashboardController');

router.get('/children/recent', authenticateToken, requireWorkerOrAdmin, getRecentChildrenForWorker);

module.exports = router;
