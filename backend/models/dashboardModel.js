const pool = require("../config/db");

module.exports = {
  // Returns the worker's own profile — name and specialization.
  // Used by GET /api/workers/me to display the real name in the UI.
  getWorkerProfile: async (workerId) => {
    const query = `
      SELECT
        wp.id             AS "workerId",
        wp.full_name      AS "fullName",
        wp.specialization
      FROM public.worker_profiles wp
      WHERE wp.id = $1;
    `;
    const { rows } = await pool.query(query, [workerId]);
    return rows[0] ?? null;
  },

  // Returns every youth assigned to the worker with their latest
  // risk level, most recent session date, and AI summary.
  getCasesForWorker: async (workerId) => {
    const query = `
      SELECT
        yp.id                                        AS "childId",
        yp.full_name                                 AS "name",
        yp.latest_risk_level                         AS "riskLevel",
        yp.status,
        yp.age,
        yp.school,
        yp.category,
        TO_CHAR(latest_s.started_at, 'YYYY-MM-DD')   AS "lastUpdated",
        ais.summary_text                             AS "aiSummary"
      FROM public.worker_youth_assignments wya
      JOIN public.youth_profiles           yp   ON yp.id = wya.youth_id
      LEFT JOIN LATERAL (
        SELECT id, started_at
        FROM   public.sessions
        WHERE  youth_id = yp.id
        ORDER  BY started_at DESC
        LIMIT  1
      ) latest_s ON TRUE
      LEFT JOIN public.ai_summaries ais ON ais.session_id = latest_s.id
      WHERE wya.worker_id = $1
      ORDER BY yp.full_name ASC;
    `;
    const { rows } = await pool.query(query, [workerId]);
    return rows;
  },

  // Returns risk-level counts for all assigned youth — one COUNT per tier.
  getDashboardStats: async (workerId) => {
    const query = `
      SELECT
        COUNT(*) FILTER (WHERE yp.latest_risk_level = 'CRITICAL')::int AS "criticalRisk",
        COUNT(*) FILTER (WHERE yp.latest_risk_level = 'HIGH')::int     AS "highRisk",
        COUNT(*) FILTER (WHERE yp.latest_risk_level = 'MEDIUM')::int   AS "mediumRisk",
        COUNT(*) FILTER (WHERE yp.latest_risk_level = 'LOW')::int      AS "lowRisk",
        COUNT(*)::int                                                   AS "totalCases"
      FROM public.worker_youth_assignments wya
      JOIN public.youth_profiles           yp ON yp.id = wya.youth_id
      WHERE wya.worker_id = $1;
    `;
    const { rows } = await pool.query(query, [workerId]);
    return rows[0];
  },
};
