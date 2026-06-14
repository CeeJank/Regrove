const pool = require("../config/db");

exports.getRecentChildrenForWorker = (workerId, limit) => {
  const query = `
    SELECT 
      yp.id AS "childId",
      $1 AS "workerId",
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
    LIMIT $2;
  `;
  const { rows } = pool.query(query, [workerId, limit]);
  if (!rows || rows.length === 0) {
    return [];
  }
  return rows;
};
