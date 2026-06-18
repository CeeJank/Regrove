const express = require("express");
const router = express.Router();

const {
  createMessage,
  getMessagesByConversation,
} = require("../controllers/messageController");
const asyncHandler = require("../middleware/asyncHandler");
const {
  validateCreateMessage,
} = require("../middleware/validateChatRequest");

// POST /api/messages
// Saves a new message into a shared conversation.
// Youth body: { "conversationId": 1, "userId": 1, "message": "Hi", "forceAi": true }
// Worker body: { "conversationId": 1, "workerId": 1, "senderType": "worker", "message": "Hello" }
// If a youth message is after-hours or forceAi is true, the AI replies and the chat is marked for handover.
router.post("/", validateCreateMessage, asyncHandler(createMessage));

// GET /api/messages/:conversationId
// Returns all messages for one conversation in chronological order.
router.get("/:conversationId", asyncHandler(getMessagesByConversation));

module.exports = router;
