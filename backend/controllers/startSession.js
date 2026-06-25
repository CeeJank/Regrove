const { createSession } = require("../models/startSessionModel");

// Controller responsibility:
// Starts a worker session for a youth using the authenticated worker ID.
// Session creation is delegated to startSessionModel.
exports.startSession = (req, res) => {
  try {
    const session = createSession(req.user.workerId, req.body.childId);
    return res.status(201).json(session);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};
