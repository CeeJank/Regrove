const workerModel = require("../models/workerModel");
const workerService = require("../services/workerService");

// Controller responsibility:
// Return worker-facing data and keep SQL inside workerModel.

// GET /api/workers/handover
// Returns conversations that need worker follow-up after AI/after-hours support.
async function getHandoverConversations(req, res) {
  const conversations = await workerModel.findHandoverConversations();

  return res.status(200).json(conversations);
}

// PATCH /api/workers/handover/:conversationId/reviewed
// Closes the handover after a worker has reviewed the summary/transcript.
async function markHandoverReviewed(req, res) {
  const response = await workerService.markHandoverReviewed(
    req.params.conversationId
  );

  return res.status(200).json(response);
}

// GET /api/workers/recent-youth
// Returns the most recent distinct youth this worker has had sessions with,
// ordered by their last session time descending.
async function getRecentYouth(req, res) {
  const workerId = req.user.workerId;
  if (!workerId) {
    return res.status(403).json({ message: 'Worker profile not found for authenticated user' });
  }
  const youth = await workerModel.getRecentYouthForWorker(workerId);
  return res.status(200).json(youth);
}

module.exports = {
  getHandoverConversations,
  markHandoverReviewed,
  getRecentYouth,
};
