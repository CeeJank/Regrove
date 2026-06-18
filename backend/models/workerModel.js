const pool = require("../config/db");

// Model responsibility:
// PostgreSQL queries for worker-facing lists live here.

// Finds conversations that need worker handover review.
// A conversation is included when the session is escalated or has an unreviewed handover report.
async function findHandoverConversations() {
  const result = await pool.query(
    `SELECT
       s.id AS conversation_id,
       y.full_name AS youth_name,
       w.full_name AS worker_name,
       CASE
         WHEN s.session_type = 'AI_AFTER_HOURS' THEN 'ai'
         ELSE 'human'
       END AS mode,
       true AS needs_handover,
       COALESCE(ra.risk_level, y.latest_risk_level, 'LOW') AS risk_level,
       COALESCE(MAX(m.created_at), s.ended_at, s.started_at) AS last_message_at
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
     WHERE
       s.status = 'ESCALATED'
       OR EXISTS (
         SELECT 1
         FROM handover_reports hr
         WHERE hr.session_id = s.id AND hr.reviewed = false
       )
     GROUP BY s.id, y.full_name, y.latest_risk_level, w.full_name, ra.risk_level
     ORDER BY last_message_at DESC`
  );

  return result.rows;
}

// Marks all handover reports for a conversation as reviewed.
async function markHandoverReportsReviewed(conversationId) {
  const result = await pool.query(
    `UPDATE handover_reports
     SET reviewed = true
     WHERE session_id = $1
     RETURNING id`,
    [conversationId]
  );

  return result.rowCount;
}

// Returns the session to normal worker chat after a handover has been reviewed.
async function markSessionReviewed(conversationId) {
  const result = await pool.query(
    `UPDATE sessions
     SET status = $1,
         session_type = $2
     WHERE id = $3
     RETURNING
       id AS conversation_id,
       status,
       CASE
         WHEN session_type = 'AI_AFTER_HOURS' THEN 'ai'
         ELSE 'human'
       END AS mode`,
    ["ACTIVE", "WORKER_CHAT", conversationId]
  );

  return result.rows[0] || null;
}

module.exports = {
  findHandoverConversations,
  markHandoverReportsReviewed,
  markSessionReviewed,
};
