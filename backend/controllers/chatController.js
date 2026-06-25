const {
  createConversation,
  getConversationById,
  getConversationWithMessages,
  markConversationForHandover,
  saveMessage,
} = require("../models/chatModel");
const { generateAIReply } = require("../services/aiChatService");
const { getChatMode } = require("../services/chatModeService");

async function sendMessage(req, res) {
  try {
    const { youthId, message, conversationId } = req.body;

    if (!youthId || !message) {
      return res.status(400).json({
        message: "youthId and message are required",
      });
    }

    const mode = getChatMode();
    let conversation;

    if (conversationId) {
      conversation = await getConversationById(conversationId);

      if (!conversation) {
        return res.status(404).json({
          message: "Conversation not found",
        });
      }
    } else {
      conversation = await createConversation(youthId, mode);
    }

    const youthMessage = await saveMessage(
      conversation.conversation_id,
      "youth",
      message
    );
    let aiReply = null;

    if (mode === "ai") {
      const replyText = await generateAIReply(message);
      aiReply = await saveMessage(conversation.conversation_id, "ai", replyText);
      conversation = await markConversationForHandover(
        conversation.conversation_id
      );
    }

    return res.status(201).json({
      conversationId: conversation.conversation_id,
      mode,
      needsHandover: conversation.needs_handover,
      youthMessage,
      aiReply,
      message:
        mode === "ai"
          ? "AI replied and the chat was marked for handover."
          : "Message saved for a youth worker.",
    });
  } catch (error) {
    console.error("Chat message error:", error.message);

    return res.status(500).json({
      message: "Failed to send chat message",
      error: error.message,
    });
  }
}

async function getConversation(req, res) {
  try {
    const { conversationId } = req.params;
    const data = await getConversationWithMessages(conversationId);

    if (!data) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Get conversation error:", error.message);

    return res.status(500).json({
      message: "Failed to load conversation",
      error: error.message,
    });
  }
}

module.exports = {
  getConversation,
  sendMessage,
};
