const express = require("express");
const router = express.Router();

const {
  getHandoverConversations,
  markHandoverReviewed,
} = require("../controllers/workerController");
const asyncHandler = require("../middleware/asyncHandler");

// PATCH /api/workers/handover/:conversationId/reviewed
// Marks handover reports reviewed and moves the session back to worker chat mode.
router.patch(
  "/handover/:conversationId/reviewed",
  asyncHandler(markHandoverReviewed)
);

// GET /api/workers/handover
// Returns conversations that need human worker follow-up after AI/after-hours support.
router.get("/handover", asyncHandler(getHandoverConversations));

module.exports = router;
