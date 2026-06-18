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

module.exports = {
  getHandoverConversations,
  markHandoverReviewed,
};
