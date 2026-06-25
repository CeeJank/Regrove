const pool = require('../config/db');

async function getChildSessionSummary(childId) {
  const { rows } = await pool.query(
    `SELECT
       yp.full_name,
       yp.latest_risk_level,
       ais.summary_text,
       wn.note_text
     FROM youth_profiles yp
     LEFT JOIN LATERAL (
       SELECT summary_text
       FROM ai_summaries ais
       JOIN sessions s ON s.id = ais.session_id
       WHERE s.youth_id = yp.id
       ORDER BY ais.created_at DESC
       LIMIT 1
     ) ais ON true
     LEFT JOIN LATERAL (
       SELECT note_text
       FROM worker_notes wn
       WHERE wn.youth_id = yp.id
       ORDER BY wn.created_at DESC
       LIMIT 1
     ) wn ON true
     WHERE yp.id = $1`,
    [childId]
  );
  return rows[0] ?? null;
}

async function logCompletedSession({ childId, workerId, duration, summary }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: sessionRows } = await client.query(
      `INSERT INTO sessions (youth_id, worker_id, session_type, status, started_at, ended_at)
       VALUES ($1, $2, 'WORKER_CHAT', 'COMPLETED', NOW() - ($3::int * interval '1 second'), NOW())
       RETURNING id`,
      [childId, workerId, Number(duration) || 0]
    );
    const sessionId = sessionRows[0].id;

    if (summary.trim()) {
      await client.query(
        `INSERT INTO ai_summaries (session_id, summary_text, created_at)
         VALUES ($1, $2, NOW())`,
        [sessionId, summary.trim()]
      );

      await client.query(
        `INSERT INTO worker_notes (worker_id, youth_id, session_id, note_text, created_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [workerId, childId, sessionId, `[Meetup Session] ${summary.trim()}`]
      );
    }

    await client.query('COMMIT');
    return sessionId;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { getChildSessionSummary, logCompletedSession };
