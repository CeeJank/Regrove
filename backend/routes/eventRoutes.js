const express = require('express');

const {
  getCalendarHubFeed,
  createNewEvent,
  removeEvent,
  respondToEventInvite,
} = require('../controllers/eventController');
const { authenticateToken, requireWorkerOrAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/hub', authenticateToken, getCalendarHubFeed);
router.post('/', authenticateToken, requireWorkerOrAdmin, createNewEvent);
router.delete('/:id', authenticateToken, requireWorkerOrAdmin, removeEvent);
router.patch('/:id/status', authenticateToken, respondToEventInvite);

module.exports = router;
