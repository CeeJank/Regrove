const pool = require("../config/db");

async function getHandoverConversations(req, res) {
  try {
    // Handover conversations are chats where AI replied after-hours.
    const result = await pool.query(
      `SELECT
         c.conversation_id,
         u.name AS youth_name,
         w.name AS worker_name,
         c.mode,
         c.needs_handover,
         c.risk_level,
         c.last_message_at
       FROM conversations c
       JOIN users u ON c.user_id = u.user_id
       JOIN workers w ON c.worker_id = w.worker_id
       WHERE c.needs_handover = true
       ORDER BY c.last_message_at DESC`
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Get handover conversations error:", error.message);

    return res.status(500).json({
      message: "Failed to load handover conversations",
      error: error.message,
    });
  }
}

module.exports = {
  getHandoverConversations,
};
