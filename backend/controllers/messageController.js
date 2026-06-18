const messageModel = require("../models/messageModel");
const messageService = require("../services/messageService");

// Controller responsibility:
// Keep request/response handling here and delegate chat behavior to services/models.

// POST /api/messages
// Saves a youth or worker message.
// Youth messages may trigger AI after-hours logic inside messageService.
async function createMessage(req, res) {
  const response = await messageService.createChatMessage(req.body);

  return res.status(201).json(response);
}

// GET /api/messages/:conversationId
// Returns all messages for one shared conversation thread.
async function getMessagesByConversation(req, res) {
  const messages = await messageModel.findMessagesByConversation(
    req.params.conversationId
  );

  return res.status(200).json(messages);
}

module.exports = {
  createMessage,
  getMessagesByConversation,
};
