const { createSession } = require('../models/startSessionModel');

exports.startSession = (req, res) => {
  try {
    const session = createSession(req.user.workerId, req.body.childId);
    return res.status(201).json(session);
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};
