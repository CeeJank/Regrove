const express = require('express');
const router = express.Router();
const { authenticateToken, requireWorkerOrAdmin } = require('../middleware/authMiddleware');
const { getChildProfileById } = require('../controllers/childProfileController');

router.get('/:childId', authenticateToken, requireWorkerOrAdmin, getChildProfileById);

module.exports = router;
