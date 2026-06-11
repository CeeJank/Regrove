const express = require('express');
const router = express.Router();

const authenticate = require('../middleware/auth');
const { getRecentChildrenForWorker } = require('../controller/dashboardController');

router.get(
  '/:workerId/children/recent',
  authenticate,
  (req, res, next) => {
    const authenticatedWorkerId = Number(req.user?.workerId ?? req.user?.id ?? req.user?.worker_id);
    const requestedWorkerId = Number(req.params.workerId);

    if (!Number.isFinite(authenticatedWorkerId)) {
      return res.status(401).json({ message: 'Authenticated worker ID is required' });
    }

    if (authenticatedWorkerId !== requestedWorkerId) {
      return res.status(403).json({ message: 'Worker ID does not match authenticated user' });
    }

    return next();
  },
  getRecentChildrenForWorker
);

module.exports = router;
