const express = require("express");
const router = express.Router();

const {
  getConversation,
  sendMessage,
} = require("../controllers/chatController");
const asyncHandler = require("../middleware/asyncHandler");
const {
  validateLegacyChatMessage,
} = require("../middleware/validateChatRequest");

// POST /api/chat/message
// Legacy chat endpoint kept for older frontend/API compatibility.
// Body: { "youthId": 1, "message": "Hi", "conversationId": 1 }
// Prefer using POST /api/messages for the newer shared youth/worker chat flow.
router.post("/message", validateLegacyChatMessage, asyncHandler(sendMessage));

// GET /api/chat/:conversationId
// Legacy endpoint that returns one conversation and its messages.
// Prefer using GET /api/conversations/:id and GET /api/messages/:conversationId for new code.
router.get("/:conversationId", asyncHandler(getConversation));

module.exports = router;
