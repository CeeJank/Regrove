const express = require('express');
const router = express.Router();
const { authenticateToken, requireWorkerOrAdmin } = require('../middleware/authMiddleware');
const {
  getChildProfileById,
  saveNotes,
  updateRiskLevel,
} = require('../controllers/childProfileController');

router.get('/:childId', authenticateToken, requireWorkerOrAdmin, getChildProfileById);
router.patch('/:childId/risk', authenticateToken, requireWorkerOrAdmin, updateRiskLevel);
router.patch('/:childId/notes', authenticateToken, requireWorkerOrAdmin, saveNotes);

module.exports = router;
