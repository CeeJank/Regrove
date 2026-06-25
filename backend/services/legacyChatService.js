const chatModel = require("../models/chatModel");
const { generateAIReply } = require("./aiChatService");
const { getChatMode } = require("./chatModeService");

async function sendLegacyChatMessage({ youthId, message, conversationId }) {
  const mode = getChatMode();
  let conversation;

  if (conversationId) {
    conversation = await chatModel.getConversationById(conversationId);

    if (!conversation) {
      const error = new Error("Conversation not found");
      error.statusCode = 404;
      throw error;
    }
  } else {
    conversation = await chatModel.createConversation(youthId, mode);
  }

  const youthMessage = await chatModel.saveMessage(
    conversation.conversation_id,
    "youth",
    message
  );
  let aiReply = null;

  if (mode === "ai") {
    const aiResult = await generateAIReply(message);
    aiReply = await chatModel.saveMessage(
      conversation.conversation_id,
      "ai",
      aiResult.reply
    );
    conversation = await chatModel.markConversationForHandover(
      conversation.conversation_id
    );
  }

  return {
    conversationId: conversation.conversation_id,
    mode,
    needsHandover: conversation.needs_handover,
    youthMessage,
    aiReply,
    message:
      mode === "ai"
        ? "AI replied and the chat was marked for handover."
        : "Message saved for a youth worker.",
  };
}

async function getLegacyConversation(conversationId) {
  const data = await chatModel.getConversationWithMessages(conversationId);

  if (!data) {
    const error = new Error("Conversation not found");
    error.statusCode = 404;
    throw error;
  }

  return data;
}

module.exports = {
  getLegacyConversation,
  sendLegacyChatMessage,
};
