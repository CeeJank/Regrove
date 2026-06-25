const pool = require("../config/db");

// Model responsibility:
// Legacy PostgreSQL queries for /api/chat routes.
// New chat work should prefer conversationModel/messageModel.

// Creates a legacy chat conversation/session for a youth.
async function createConversation(youthId, mode) {
  const result = await pool.query(
    `INSERT INTO sessions (youth_id, session_type, status, started_at)
     VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
     RETURNING
       id AS conversation_id,
       youth_id,
       worker_id,
       status,
       CASE
         WHEN session_type = 'AI_AFTER_HOURS' THEN 'ai'
         ELSE 'human'
       END AS mode,
       false AS needs_handover,
       started_at AS created_at`,
    [youthId, mode === "ai" ? "AI_AFTER_HOURS" : "WORKER_CHAT", "ACTIVE"]
  );

  return result.rows[0];
}

// Gets one legacy conversation/session by ID.
async function getConversationById(conversationId) {
  const result = await pool.query(
    `SELECT
       id AS conversation_id,
       youth_id,
       worker_id,
       status,
       CASE
         WHEN session_type = 'AI_AFTER_HOURS' THEN 'ai'
         ELSE 'human'
       END AS mode,
       status = 'ESCALATED' AS needs_handover,
       started_at AS created_at
     FROM sessions
     WHERE id = $1`,
    [conversationId]
  );

  return result.rows[0] || null;
}

// Marks a legacy conversation as after-hours AI handover.
async function markConversationForHandover(conversationId) {
  const result = await pool.query(
    `UPDATE sessions
     SET session_type = 'AI_AFTER_HOURS',
         status = 'ESCALATED'
     WHERE id = $1
     RETURNING
       id AS conversation_id,
       youth_id,
       worker_id,
       status,
       'ai' AS mode,
       true AS needs_handover,
       started_at AS created_at`,
    [conversationId]
  );

  return result.rows[0] || null;
}

// Saves one legacy chat message.
async function saveMessage(conversationId, senderType, message) {
  const result = await pool.query(
    `INSERT INTO messages (session_id, sender_type, message_text, created_at)
     VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
     RETURNING
       id AS message_id,
       session_id AS conversation_id,
       sender_type,
       message_text AS message,
       created_at`,
    [conversationId, senderType.toUpperCase(), message]
  );

  return result.rows[0];
}

// Gets one legacy conversation together with all of its messages.
async function getConversationWithMessages(conversationId) {
  const conversation = await getConversationById(conversationId);

  if (!conversation) {
    return null;
  }

  const messages = await pool.query(
    `SELECT
       id AS message_id,
       session_id AS conversation_id,
       sender_type,
       message_text AS message,
       created_at
     FROM messages
     WHERE session_id = $1
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
