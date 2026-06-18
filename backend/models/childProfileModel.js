const pool = require("../config/db");

// Updates the youth's risk level on youth_profiles.
// The frontend sends lowercase ('high') — we uppercase it for the DB constraint.
exports.updateRiskLevel = async (childId, riskLevel) => {
  const query = `
    UPDATE public.youth_profiles
    SET    latest_risk_level = $1,
           updated_at        = NOW()
    WHERE  id = $2
    RETURNING id, latest_risk_level AS "riskLevel";
  `;
  const { rows } = await pool.query(query, [riskLevel.toUpperCase(), childId]);
  return rows[0] ?? null;
};

// Upserts a worker note for a youth.
// worker_notes is an append-only log — each save creates a new row.
// The frontend shows the most recent note, so we just INSERT.
exports.upsertWorkerNote = async (workerId, childId, noteText) => {
  const query = `
    INSERT INTO public.worker_notes (worker_id, youth_id, note_text)
    VALUES ($1, $2, $3)
    RETURNING id, note_text AS "noteText", created_at AS "createdAt";
  `;
  const { rows } = await pool.query(query, [workerId, childId, noteText]);
  return rows[0];
};

// Returns the most recent worker note for a youth, so the frontend
// can pre-populate the notes textarea with the last saved value.
exports.getLatestWorkerNote = async (workerId, childId) => {
  const query = `
    SELECT note_text AS "noteText"
    FROM   public.worker_notes
    WHERE  worker_id = $1
      AND  youth_id  = $2
    ORDER  BY created_at DESC
    LIMIT  1;
  `;
  const { rows } = await pool.query(query, [workerId, childId]);
  return rows[0]?.noteText ?? '';
};

// Returns the child's core profile.
// Fixed from old version: removed sentiment columns that no longer exist in schema.
exports.getChildProfileById = async (childId) => {
  const coreQuery = `
    SELECT
      yp.id                                        AS "childId",
      yp.full_name                                 AS "name",
      yp.age,
      yp.latest_risk_level                         AS "riskLevel",
      yp.status,
      COALESCE(ra.risk_score, 0)::float            AS "riskScore",
      COUNT(s.id)::int                             AS "sessionCount"
    FROM public.youth_profiles yp
    LEFT JOIN public.sessions s
      ON s.youth_id = yp.id
    LEFT JOIN public.risk_assessments ra
      ON ra.session_id = (
        SELECT id FROM public.sessions
        WHERE  youth_id = yp.id
        ORDER  BY started_at DESC
        LIMIT  1
      )
    WHERE yp.id = $1
    GROUP BY yp.id, yp.full_name, yp.age, yp.latest_risk_level, yp.status, ra.risk_score;
  `;

  const historyQuery = `
    SELECT
      s.id                                               AS "sessionId",
      TO_CHAR(s.started_at, 'YYYY-MM-DD')                AS "date",
      COALESCE(ais.summary_text, 'No summary yet.')      AS "summary"
    FROM public.sessions s
    LEFT JOIN public.ai_summaries ais ON ais.session_id = s.id
    WHERE s.youth_id = $1
    ORDER BY s.started_at DESC;
  `;

  const [coreResult, historyResult] = await Promise.all([
    pool.query(coreQuery, [childId]),
    pool.query(historyQuery, [childId]),
  ]);

  if (coreResult.rows.length === 0) return null;

  const d = coreResult.rows[0];
  return {
    childId:  d.childId,
    name:     d.name,
    age:      d.age,
    riskLevel: d.riskLevel,
    status:   d.status,
    analytics: {
      riskScore:    d.riskScore,
      sessionCount: d.sessionCount,
    },
    recentSessions: historyResult.rows,
  };
};
