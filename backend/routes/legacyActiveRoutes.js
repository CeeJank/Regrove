const express = require('express');

const { getActiveCasesPayload } = require('../controllers/legacyActiveController');
const { authenticateToken, requireWorkerOrAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authenticateToken, requireWorkerOrAdmin, getActiveCasesPayload);

module.exports = router;
