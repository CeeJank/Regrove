const legacyChatService = require("../services/legacyChatService");

// Controller responsibility:
// Legacy chat route adapter. New code should prefer /api/messages and /api/conversations.
// Business logic is kept in legacyChatService so this controller stays thin.

// POST /api/chat/message
// Legacy endpoint for sending a youth chat message.
async function sendMessage(req, res) {
  const response = await legacyChatService.sendLegacyChatMessage(req.body);

  return res.status(201).json(response);
}

// GET /api/chat/:conversationId
// Legacy endpoint for reading one conversation and its messages.
async function getConversation(req, res) {
  const conversation = await legacyChatService.getLegacyConversation(
    req.params.conversationId
  );

  return res.status(200).json(conversation);
}

module.exports = {
  getConversation,
  sendMessage,
};
