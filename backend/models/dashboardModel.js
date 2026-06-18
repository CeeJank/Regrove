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
  // risk level, most recent session date, AI summary, latest worker note, and check-in history.
  // dashboardModel.js

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
        ais.summary_text                             AS "aiSummary",
        
        -- 1. KEEP LATEST NOTE FOR DASHBOARD PREVIEW
        latest_preview_note.note_text                AS "latestNote",
        
        -- 2. AGGREGATE ALL NOTES HISTORICALLY FOR THE ACTIVE-CASES DETAIL VIEW
        COALESCE(notes_agg.data, '[]'::json)         AS "notesHistoryJSON",
        
        -- 3. AGGREGATE ALL RECENT CHECK-INS FOR TIMELINE WINDOWING
        COALESCE(check_ins_agg.data, '[]'::json)     AS "checkInsJSON"
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
      
      -- Single latest note preview for dashboard row
      LEFT JOIN LATERAL (
        SELECT note_text
        FROM   public.worker_notes
        WHERE  worker_id = wya.worker_id AND youth_id = yp.id
        ORDER  BY created_at DESC
        LIMIT  1
      ) latest_preview_note ON TRUE

      -- Aggregated historical notes timeline
      LEFT JOIN LATERAL (
        SELECT json_agg(json_build_object(
          'id', wn.id,
          'noteText', wn.note_text,
          'createdAt', wn.created_at
        ) ORDER BY wn.created_at DESC) AS data
        FROM public.worker_notes wn
        WHERE wn.worker_id = wya.worker_id AND wn.youth_id = yp.id
      ) notes_agg ON TRUE

      -- Aggregated check-ins timeline (DERIVING MOOD FROM RISK_ASSESSMENTS)
      LEFT JOIN LATERAL (
        SELECT json_agg(json_build_object(
          'id', s.id,
          'mood', CASE 
                    WHEN ra.risk_level = 'LOW'      THEN 1
                    WHEN ra.risk_level = 'MEDIUM'   THEN 2
                    WHEN ra.risk_level = 'HIGH'     THEN 4
                    WHEN ra.risk_level = 'CRITICAL' THEN 5
                    ELSE 3 -- Default to 3 (Neutral 😐) if no assessment row exists
                  END,
          'events', COALESCE(wn.note_text, 'Routine check-in session.'),
          'timestamp', s.started_at
        ) ORDER BY s.started_at DESC) AS data
        FROM public.sessions s
        LEFT JOIN public.risk_assessments ra ON ra.session_id = s.id
        LEFT JOIN public.worker_notes wn     ON wn.session_id = s.id
        WHERE s.youth_id = yp.id AND s.session_type = 'WORKER_CHAT'
      ) check_ins_agg ON TRUE
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
