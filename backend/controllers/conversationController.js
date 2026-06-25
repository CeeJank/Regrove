const pool = require("../config/db");

async function createConversation(req, res) {
  try {
    const { userId, workerId } = req.body;

    // A conversation must belong to one youth and one worker.
    if (!userId || !workerId) {
      return res.status(400).json({
        message: "userId and workerId are required",
      });
    }

    const result = await pool.query(
      `INSERT INTO conversations (user_id, worker_id, status, mode)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, workerId, "open", "human"]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Create conversation error:", error.message);

    return res.status(500).json({
      message: "Failed to create conversation",
      error: error.message,
    });
  }
}

async function getAllConversations(req, res) {
  try {
    const result = await pool.query(
      `SELECT
         conversations.conversation_id,
         users.name AS youth_name,
         workers.name AS worker_name,
         conversations.status,
         conversations.mode,
         conversations.needs_handover,
         conversations.risk_level,
         conversations.last_message_at,
         conversations.created_at
       FROM conversations
       LEFT JOIN users ON conversations.user_id = users.user_id
       LEFT JOIN workers ON conversations.worker_id = workers.worker_id
       ORDER BY conversations.last_message_at DESC`
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Get conversations error:", error.message);

    return res.status(500).json({
      message: "Failed to load conversations",
      error: error.message,
    });
  }
}

async function getConversationById(req, res) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
         conversations.conversation_id,
         users.name AS youth_name,
         workers.name AS worker_name,
         conversations.status,
         conversations.mode,
         conversations.needs_handover,
         conversations.risk_level,
         conversations.last_message_at,
         conversations.created_at
       FROM conversations
       LEFT JOIN users ON conversations.user_id = users.user_id
       LEFT JOIN workers ON conversations.worker_id = workers.worker_id
       WHERE conversations.conversation_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Get conversation error:", error.message);

    return res.status(500).json({
      message: "Failed to load conversation",
      error: error.message,
    });
  }
}

module.exports = {
  createConversation,
  getAllConversations,
  getConversationById,
};
