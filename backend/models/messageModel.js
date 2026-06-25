const pool = require("../config/db");

// Model responsibility:
// All PostgreSQL queries for chat messages and session mode updates live here.

// Inserts one message into the messages table and returns it in frontend-friendly shape.
async function createMessage({
  conversationId,
  senderType,
  senderId = null,
  message,
}) {
  const result = await pool.query(
    `INSERT INTO messages (session_id, sender_type, message_text, created_at)
     VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
     RETURNING
       id AS message_id,
       session_id AS conversation_id,
       sender_type,
       $4::int AS sender_id,
       message_text AS message,
       created_at`,
    [conversationId, senderType, message, senderId]
  );

  return result.rows[0];
}

// Gets all messages for one conversation in chat display order.
async function findMessagesByConversation(conversationId) {
  const result = await pool.query(
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

  return result.rows;
}

// Gets only the fields needed to build a readable transcript.
async function findTranscriptMessages(conversationId) {
  const result = await pool.query(
    `SELECT sender_type, message_text AS message
     FROM messages
     WHERE session_id = $1
     ORDER BY created_at ASC`,
    [conversationId]
  );

  return result.rows;
}

// Updates the session mode/status after youth, worker, or AI messages.
async function updateSessionMode(conversationId, sessionType, status) {
  await pool.query(
    `UPDATE sessions
     SET session_type = $1,
         status = $2
     WHERE id = $3`,
    [sessionType, status, conversationId]
  );
}

module.exports = {
  createMessage,
  findMessagesByConversation,
  findTranscriptMessages,
  updateSessionMode,
};
