const express = require('express');

const { submitCheckIn } = require('../controllers/checkInController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/:userId', authenticateToken, submitCheckIn);

module.exports = router;
