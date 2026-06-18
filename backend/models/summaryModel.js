const pool = require("../config/db");

// Model responsibility:
// All PostgreSQL queries for summaries, handover reports, and session summary status live here.

// Looks up the session so the service can attach summaries/handover to the correct youth.
async function findSessionById(conversationId) {
  const result = await pool.query(
    `SELECT id, youth_id, worker_id, status, session_type
     FROM sessions
     WHERE id = $1`,
    [conversationId]
  );

  return result.rows[0] || null;
}

// Saves one generated AI summary.
// The database allows only one summary per session, so this updates the existing
// summary when the worker presses Generate more than once.
async function createAiSummary(conversationId, summaryText) {
  const result = await pool.query(
    `INSERT INTO ai_summaries (session_id, summary_text, created_at)
     VALUES ($1, $2, CURRENT_TIMESTAMP)
     ON CONFLICT (session_id)
     DO UPDATE SET
       summary_text = EXCLUDED.summary_text,
       created_at = CURRENT_TIMESTAMP
     RETURNING
       id AS summary_id,
       session_id AS conversation_id,
       summary_text AS summary,
       created_at`,
    [conversationId, summaryText]
  );

  return result.rows[0];
}

// Saves a handover report for worker follow-up.
async function createHandoverReport({
  youthId,
  conversationId,
  summaryText,
  recommendedAction,
}) {
  const existingReport = await pool.query(
    `SELECT id
     FROM handover_reports
     WHERE session_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [conversationId]
  );

  if (existingReport.rows.length > 0) {
    await pool.query(
      `UPDATE handover_reports
       SET summary = $1,
           recommended_action = $2,
           reviewed = false,
           created_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [summaryText, recommendedAction, existingReport.rows[0].id]
    );

    return;
  }

  await pool.query(
    `INSERT INTO handover_reports (
       youth_id,
       session_id,
       summary,
       recommended_action,
       reviewed,
       created_at
     )
     VALUES ($1, $2, $3, $4, false, CURRENT_TIMESTAMP)`,
    [youthId, conversationId, summaryText, recommendedAction]
  );
}

// Returns all summaries saved for a conversation, newest first.
async function findSummariesByConversation(conversationId) {
  const result = await pool.query(
    `SELECT
       id AS summary_id,
       session_id AS conversation_id,
       summary_text AS summary,
       created_at
     FROM ai_summaries
     WHERE session_id = $1
     ORDER BY created_at DESC`,
    [conversationId]
  );

  return result.rows;
}

// Updates a session status, for example marking it ESCALATED after summary/handover.
async function updateSessionStatus(conversationId, status) {
  await pool.query(
    `UPDATE sessions
     SET status = $1
     WHERE id = $2`,
    [status, conversationId]
  );
}

module.exports = {
  createAiSummary,
  createHandoverReport,
  findSessionById,
  findSummariesByConversation,
  updateSessionStatus,
};
