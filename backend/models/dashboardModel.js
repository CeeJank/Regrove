const pool = require("../config/db");

module.exports = {
  getRecentChildrenForWorker: async (workerId, limit = 10) => {
    const query = `
    SELECT 
      yp.id AS "childId",
      $1::int AS "workerId",
      yp.full_name AS "name",
      yp.age,
      yp.latest_risk_level AS "riskLevel",
      yp.status,
      TO_CHAR(MAX(s.started_at), 'YYYY-MM-DD') AS "lastSessionDate"
    FROM public.sessions s
    JOIN public.youth_profiles yp ON s.youth_id = yp.id
    WHERE s.worker_id = $1
    GROUP BY yp.id, yp.full_name, yp.age, yp.latest_risk_level, yp.status
    ORDER BY MAX(s.started_at) DESC
    LIMIT 5;
  `;
    const { rows } = await pool.query(query, [workerId]);
    if (!rows || rows.length === 0) {
      return [];
    }
    return rows;
  },
  getDashboardHeaderData: async (workerId) => {
    const statsQuery = `
      SELECT
        (SELECT COUNT(*)::int 
       FROM public.worker_youth_assignments wya
       JOIN public.youth_profiles yp ON wya.youth_id = yp.id
       WHERE wya.worker_id = $1 AND yp.status = 'ACTIVE') AS "activeCases",

        SELECT COUNT(*)::int 
       FROM public.youth_profiles yp 
       JOIN public.worker_youth_assignments wya ON yp.id = wya.youth_id 
       WHERE wya.worker_id = $1 AND yp.latest_risk_level IN ('HIGH', 'CRITICAL')) AS "reviewsDue",

       (SELECT COUNT(*)::int 
 FROM public.worker_youth_assignments wya
 WHERE wya.worker_id = $1 
   AND wya.assigned_at >= NOW() - INTERVAL '30 days') AS "newReferrals",
    `;

    const attentionQuery = ``;

    const wellbeingQuery = ``;

    const [statsResult, attentionResult, wellbeingResult] = await Promise.all([
      pool.query(statsQuery, [workerId]),
      pool.query(attentionQuery, [workerId]),
      pool.query(wellbeingQuery, [workerId]),
    ]);

    const cards =
      statsResult.rows[0] == null
        ? {
            activeCases: 0,
            reviewsDue: 0,
            newReferrals: 0,
            checkInsThisWeek: 0,
          }
        : statsResult.rows[0];
  },
};
