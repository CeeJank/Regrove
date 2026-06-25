const pool = require("../config/db");

module.exports = {
  /**
   * Returns every youth assigned to a worker, with their latest risk level,
   * last session date, and latest AI summary.
   *
   * Used by: GET /api/workers/dashboard
   */
  getCasesForWorker: async (workerId) => {
    const query = `
      SELECT
        yp.id                                        AS "childId",
        yp.full_name                                 AS "name",
        yp.latest_risk_level                         AS "riskLevel",
        yp.status,
        TO_CHAR(
          MAX(s.started_at), 'YYYY-MM-DD'
        )                                            AS "lastUpdated",
        (
          SELECT ais.summary_text
          FROM   public.sessions        inner_s
          JOIN   public.ai_summaries    ais ON ais.session_id = inner_s.id
          WHERE  inner_s.youth_id = yp.id
          ORDER  BY inner_s.started_at DESC
          LIMIT  1
        )                                            AS "aiSummary"
      FROM  public.worker_youth_assignments wya
      JOIN  public.youth_profiles           yp  ON yp.id = wya.youth_id
      LEFT  JOIN public.sessions            s   ON s.youth_id = yp.id
                                               AND s.worker_id = wya.worker_id
      WHERE wya.worker_id = $1
      GROUP BY yp.id, yp.full_name, yp.latest_risk_level, yp.status
      ORDER BY yp.full_name ASC;
    `;

    const { rows } = await pool.query(query, [workerId]);
    return rows;
  },

  /**
   * Returns the stat card counts shown at the top of the dashboard:
   * how many active cases, how many high/critical risk, how many assigned
   * in the last 30 days.
   *
   * Used by: GET /api/workers/dashboard
   */
  getDashboardStats: async (workerId) => {
    const query = `
      SELECT
        COUNT(*)::int                                              AS "totalCases",
        COUNT(*) FILTER (
          WHERE yp.latest_risk_level IN ('HIGH', 'CRITICAL')
        )::int                                                     AS "highRisk",
        COUNT(*) FILTER (
          WHERE yp.latest_risk_level = 'MEDIUM'
        )::int                                                     AS "mediumRisk",
        COUNT(*) FILTER (
          WHERE yp.latest_risk_level = 'LOW'
        )::int                                                     AS "lowRisk"
      FROM  public.worker_youth_assignments wya
      JOIN  public.youth_profiles           yp ON yp.id = wya.youth_id
      WHERE wya.worker_id = $1
        AND yp.status = 'ACTIVE';
    `;

    const { rows } = await pool.query(query, [workerId]);
    // rows[0] will always exist because COUNT never returns no rows
    return rows[0];
  },
};
