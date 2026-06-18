const express = require("express");
const router = express.Router();

const {
  createConversation,
  downloadConversationTranscript,
  getAllConversations,
  getConversationById,
  getConversationTranscript,
} = require("../controllers/conversationController");
const asyncHandler = require("../middleware/asyncHandler");
const {
  validateCreateConversation,
} = require("../middleware/validateChatRequest");

// POST /api/conversations
// Creates a new conversation/session between a youth and a worker.
// Body: { "userId": 1, "workerId": 1 }
router.post("/", validateCreateConversation, asyncHandler(createConversation));

// GET /api/conversations
// Returns all conversations with youth profile, worker, mode, risk, and handover info.
router.get("/", asyncHandler(getAllConversations));

// GET /api/conversations/:id/transcript/download
// Downloads the conversation transcript as a .txt file.
router.get(
  "/:id/transcript/download",
  asyncHandler(downloadConversationTranscript)
);

// GET /api/conversations/:id/transcript
// Returns the formatted transcript as JSON for reuse by the frontend or other services.
router.get("/:id/transcript", asyncHandler(getConversationTranscript));

// GET /api/conversations/:id
// Returns one conversation/session by ID.
router.get("/:id", asyncHandler(getConversationById));

module.exports = router;
