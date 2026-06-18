const conversationModel = require("../models/conversationModel");
const summaryService = require("../services/summaryService");

// Controller responsibility:
// Receive HTTP requests, call model/service functions, and return JSON responses.
// Database SQL stays inside models, not in this controller.

// POST /api/conversations
// Creates a new session/conversation between a youth and a worker.
async function createConversation(req, res) {
  const { userId, workerId } = req.body;
  const conversation = await conversationModel.createConversation(
    userId,
    workerId
  );

  return res.status(201).json(conversation);
}

// GET /api/conversations
// Returns all conversations for dashboard/list views.
async function getAllConversations(req, res) {
  const conversations = await conversationModel.findAllConversations();

  return res.status(200).json(conversations);
}

// GET /api/conversations/:id
// Returns one conversation by its session ID.
async function getConversationById(req, res) {
  const conversation = await conversationModel.findConversationById(
    req.params.id
  );

  if (!conversation) {
    return res.status(404).json({
      message: "Conversation not found",
    });
  }

  return res.status(200).json(conversation);
}

// GET /api/conversations/:id/transcript
// Returns a reusable JSON transcript for one conversation.
async function getConversationTranscript(req, res) {
  const transcriptData = await summaryService.getTranscript(req.params.id);

  if (!transcriptData) {
    return res.status(404).json({
      message: "No messages found for this conversation",
    });
  }

  return res.status(200).json(transcriptData);
}

// GET /api/conversations/:id/transcript/download
// Sends the transcript as a downloadable text file.
async function downloadConversationTranscript(req, res) {
  const transcriptData = await summaryService.getTranscript(req.params.id);

  if (!transcriptData) {
    return res.status(404).json({
      message: "No messages found for this conversation",
    });
  }

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="conversation-${req.params.id}-transcript.txt"`
  );

  return res.status(200).send(transcriptData.transcript);
}

module.exports = {
  createConversation,
  downloadConversationTranscript,
  getAllConversations,
  getConversationById,
  getConversationTranscript,
};
