const { createSession } = require('../models/startSessionModel');

exports.startSession = (req, res) => {
  try {
    const childId = req.body.childId ?? req.params.childId;

    // workerId is null when the DB is unavailable; fall back to userId so
    // the in-memory mock session can still be created.
    const workerId = req.user.workerId ?? req.user.userId;

    if (!workerId) {
      return res.status(403).json({ message: 'Worker profile not found for authenticated user' });
    }

    if (!childId) {
      return res.status(400).json({ message: 'childId is required' });
    }

    const session = createSession(workerId, childId);
    return res.status(201).json(session);
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};
