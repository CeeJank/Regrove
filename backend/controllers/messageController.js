const pool = require("../config/db");
const { generateAIReply } = require("../services/aiChatService");
const { isAfterWorkingHours } = require("../services/timeService");

async function createMessage(req, res) {
  try {
    const { conversationId, userId, message, forceAi } = req.body;

    // A youth message must be linked to a conversation and a youth user.
    if (!conversationId || !userId || !message) {
      return res.status(400).json({
        message: "conversationId, userId, and message are required",
      });
    }

    const youthMessageResult = await pool.query(
      `INSERT INTO messages (conversation_id, sender_type, sender_id, message)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [conversationId, "youth", userId, message]
    );

    const youthMessage = youthMessageResult.rows[0];
    const shouldUseAi = isAfterWorkingHours() || forceAi === true;

    if (!shouldUseAi) {
      await pool.query(
        `UPDATE conversations
         SET mode = $1,
             last_message_at = CURRENT_TIMESTAMP
         WHERE conversation_id = $2`,
        ["human", conversationId]
      );

      return res.status(201).json({
        mode: "human",
        message: "Message sent to worker",
        youthMessage,
        aiReply: null,
      });
    }

    const aiReplyText = await generateAIReply(message);
    const aiReplyResult = await pool.query(
      `INSERT INTO messages (conversation_id, sender_type, sender_id, message)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [conversationId, "ai", null, aiReplyText]
    );

    const aiReply = aiReplyResult.rows[0];

    await pool.query(
      `UPDATE conversations
       SET mode = $1,
           needs_handover = true,
           last_message_at = CURRENT_TIMESTAMP
       WHERE conversation_id = $2`,
      ["ai", conversationId]
    );

    return res.status(201).json({
      mode: "ai",
      message: "AI replied after-hours",
      youthMessage,
      aiReply,
    });
  } catch (error) {
    console.error("Create message error:", error.message);

    return res.status(500).json({
      message: "Failed to create message",
      error: error.message,
    });
  }
}

async function getMessagesByConversation(req, res) {
  try {
    const { conversationId } = req.params;

    const result = await pool.query(
      `SELECT *
       FROM messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC`,
      [conversationId]
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Get messages error:", error.message);

    return res.status(500).json({
      message: "Failed to load messages",
      error: error.message,
    });
  }
}

module.exports = {
  createMessage,
  getMessagesByConversation,
};
