const express = require("express");
const router = express.Router();

const {
  createSummary,
  getSummariesByConversation,
} = require("../controllers/summaryController");
const asyncHandler = require("../middleware/asyncHandler");

// POST /api/summaries/:conversationId
// Formats the transcript, generates an AI summary, saves it, and creates a handover report.
router.post("/:conversationId", asyncHandler(createSummary));

// GET /api/summaries/:conversationId
// Returns all generated summaries for one conversation, newest first.
router.get("/:conversationId", asyncHandler(getSummariesByConversation));

module.exports = router;
