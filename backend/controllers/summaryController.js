const summaryModel = require("../models/summaryModel");
const summaryService = require("../services/summaryService");

// Controller responsibility:
// Handle summary API requests and delegate transcript/AI summary logic to services.

// POST /api/summaries/:conversationId
// Generates and stores a summary for one conversation.
async function createSummary(req, res) {
  const response = await summaryService.createSummaryForConversation(
    req.params.conversationId
  );

  return res.status(201).json(response);
}

// GET /api/summaries/:conversationId
// Returns all saved summaries for one conversation.
async function getSummariesByConversation(req, res) {
  const summaries = await summaryModel.findSummariesByConversation(
    req.params.conversationId
  );

  return res.status(200).json(summaries);
}

module.exports = {
  createSummary,
  getSummariesByConversation,
};
