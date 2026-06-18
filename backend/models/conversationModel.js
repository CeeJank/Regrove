const pool = require("../config/db");

// Model responsibility:
// All PostgreSQL queries for conversations/sessions live here.

// Shared SELECT used by conversation list and single-conversation lookups.
// The optional whereClause lets callers reuse the same selected fields safely.
function conversationSelectSql(whereClause = "") {
  return `SELECT
      s.id AS conversation_id,
      s.youth_id,
      s.worker_id,
      y.full_name AS youth_name,
      y.age AS youth_age,
      y.school AS youth_school,
      y.interests AS youth_interests,
      y.category AS youth_category,
      y.status AS youth_status,
      w.full_name AS worker_name,
      s.status,
      CASE
        WHEN s.session_type = 'AI_AFTER_HOURS' THEN 'ai'
        ELSE 'human'
      END AS mode,
      (
        s.status = 'ESCALATED'
        OR EXISTS (
          SELECT 1
          FROM handover_reports hr
          WHERE hr.session_id = s.id AND hr.reviewed = false
        )
      ) AS needs_handover,
      COALESCE(ra.risk_level, y.latest_risk_level, 'LOW') AS risk_level,
      COALESCE(MAX(m.created_at), s.ended_at, s.started_at) AS last_message_at,
      s.started_at AS created_at
    FROM sessions s
    JOIN youth_profiles y ON s.youth_id = y.id
    LEFT JOIN worker_profiles w ON s.worker_id = w.id
    LEFT JOIN messages m ON m.session_id = s.id
    LEFT JOIN LATERAL (
      SELECT risk_level
      FROM risk_assessments
      WHERE session_id = s.id
      ORDER BY created_at DESC
      LIMIT 1
    ) ra ON true
    ${whereClause}
    GROUP BY
      s.id,
      y.full_name,
      y.age,
      y.school,
      y.interests,
      y.category,
      y.status,
      y.latest_risk_level,
      w.full_name,
      ra.risk_level`;
}

// Creates a new human worker chat session between a youth and worker.
async function createConversation(userId, workerId) {
  const result = await pool.query(
    `INSERT INTO sessions (youth_id, worker_id, session_type, status, started_at)
     VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
     RETURNING
       id AS conversation_id,
       youth_id AS user_id,
       worker_id,
       status,
       'human' AS mode,
       false AS needs_handover,
       started_at AS created_at`,
    [userId, workerId, "WORKER_CHAT", "ACTIVE"]
  );

  return result.rows[0];
}

// Finds all conversations with youth profile, worker, risk, mode, and handover status.
async function findAllConversations() {
  const result = await pool.query(
    `${conversationSelectSql()}
     ORDER BY last_message_at DESC`
  );

  return result.rows;
}

// Finds one conversation by session/conversation ID.
async function findConversationById(conversationId) {
  const result = await pool.query(
    `${conversationSelectSql("WHERE s.id = $1")}
     ORDER BY last_message_at DESC`,
    [conversationId]
  );

  return result.rows[0] || null;
}

module.exports = {
  createConversation,
  findAllConversations,
  findConversationById,
};
