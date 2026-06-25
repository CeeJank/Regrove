const express = require('express');
const router = express.Router();
const { createChildProfile, getAllChildren, getChildById } = require('../controllers/childController');
const { authenticateToken, requireWorkerOrAdmin } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, requireWorkerOrAdmin, getAllChildren);
router.get('/:id', authenticateToken, requireWorkerOrAdmin, getChildById);
router.post('/', authenticateToken, requireWorkerOrAdmin, createChildProfile);

module.exports = router;
