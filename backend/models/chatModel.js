const pool = require("../config/db");

async function createConversation(youthId, mode) {
  const result = await pool.query(
    `INSERT INTO conversations (user_id, mode, needs_handover)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [youthId, mode, mode === "ai"]
  );

  return result.rows[0];
}

async function getConversationById(conversationId) {
  const result = await pool.query(
    `SELECT *
     FROM conversations
     WHERE conversation_id = $1`,
    [conversationId]
  );

  return result.rows[0] || null;
}

async function markConversationForHandover(conversationId) {
  const result = await pool.query(
    `UPDATE conversations
     SET needs_handover = true,
         mode = 'ai',
         last_message_at = CURRENT_TIMESTAMP
     WHERE conversation_id = $1
     RETURNING *`,
    [conversationId]
  );

  return result.rows[0] || null;
}

async function saveMessage(conversationId, senderType, message) {
  const result = await pool.query(
    `INSERT INTO messages (conversation_id, sender_type, message)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [conversationId, senderType, message]
  );

  await pool.query(
    `UPDATE conversations
     SET last_message_at = CURRENT_TIMESTAMP
     WHERE conversation_id = $1`,
    [conversationId]
  );

  return result.rows[0];
}

async function getConversationWithMessages(conversationId) {
  const conversation = await getConversationById(conversationId);

  if (!conversation) {
    return null;
  }

  const messages = await pool.query(
    `SELECT *
     FROM messages
     WHERE conversation_id = $1
     ORDER BY created_at ASC`,
    [conversationId]
  );

  return {
    conversation,
    messages: messages.rows,
  };
}

module.exports = {
  createConversation,
  getConversationById,
  getConversationWithMessages,
  markConversationForHandover,
  saveMessage,
};
