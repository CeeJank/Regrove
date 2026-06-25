const pool = require('../config/db');

async function findChildAndWorkerByUserId(userId) {
  const { rows } = await pool.query(
    `SELECT yp.id AS child_id, wya.worker_id
     FROM youth_profiles yp
     LEFT JOIN worker_youth_assignments wya ON wya.youth_id = yp.id
     WHERE yp.user_id = $1
     ORDER BY wya.assigned_at DESC NULLS LAST
     LIMIT 1`,
    [userId]
  );
  return rows[0] ?? null;
}

async function submitCheckInRecord({ child_id, worker_id, risk_level, risk_score, noteText }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: sessionRows } = await client.query(
      `INSERT INTO sessions (youth_id, worker_id, session_type, status, started_at, ended_at)
       VALUES ($1, $2, 'WORKER_CHAT', 'COMPLETED', NOW(), NOW())
       RETURNING id`,
      [child_id, worker_id]
    );
    const sessionId = sessionRows[0].id;

    await client.query(
      `INSERT INTO risk_assessments (session_id, risk_level, risk_score, reasoning, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [sessionId, risk_level, risk_score, 'Auto-generated from child check-in mood submission.']
    );

    if (worker_id) {
      await client.query(
        `INSERT INTO worker_notes (worker_id, youth_id, session_id, note_text, created_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [worker_id, child_id, sessionId, noteText || 'Child submitted a daily check-in.']
      );
    }

    await client.query(
      `UPDATE youth_profiles
       SET latest_risk_level = $1,
           updated_at = NOW()
       WHERE id = $2`,
      [risk_level, child_id]
    );

    await client.query('COMMIT');
    return sessionId;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { findChildAndWorkerByUserId, submitCheckInRecord };
