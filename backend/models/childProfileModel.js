const pool = require("../config/db");

exports.getChildProfileById = async (childId) => {
  // Query A: Core Profile details, total sessions, and latest risk assessment + sentiment metrics
  const coreQuery = `
    SELECT 
      yp.id AS "childId",
      yp.full_name AS "name",
      yp.age,
      yp.latest_risk_level AS "riskLevel",
      yp.status,
      COALESCE(ra.risk_score, 0)::float AS "riskScore",
      COALESCE(ra.sentiment_positive, 0)::int AS "sentimentPositive",
      COALESCE(ra.sentiment_neutral, 0)::int AS "sentimentNeutral",
      COALESCE(ra.sentiment_negative, 0)::int AS "sentimentNegative",
      COUNT(s.id)::int AS "sessionCount"
    FROM public.youth_profiles yp
    LEFT JOIN public.sessions s ON yp.id = s.youth_id
    LEFT JOIN public.risk_assessments ra ON ra.session_id = (
        SELECT id FROM public.sessions 
        WHERE youth_id = yp.id 
        ORDER BY started_at DESC 
        LIMIT 1
    )
    WHERE yp.id = $1
    GROUP BY 
      yp.id, 
      yp.full_name, 
      yp.age, 
      yp.latest_risk_level, 
      yp.status, 
      ra.risk_score,
      ra.sentiment_positive,
      ra.sentiment_neutral,
      ra.sentiment_negative;
  `;

  // Query B: Historic timelines with text aggregations
  const historyQuery = `
    SELECT 
      s.id AS "sessionId",
      TO_CHAR(s.started_at, 'YYYY-MM-DD') AS "date",
      COALESCE(ais.summary_text, 'No summary generated yet for this session.') AS "summary"
    FROM public.sessions s
    LEFT JOIN public.ai_summaries ais ON s.id = ais.session_id
    WHERE s.youth_id = $1
    ORDER BY s.started_at DESC;
  `;

  // Execute both queries concurrently for maximum database efficiency
  const [coreResult, historyResult] = await Promise.all([
    pool.query(coreQuery, [childId]),
    pool.query(historyQuery, [childId]),
  ]);

  if (coreResult.rows.length === 0) {
    return null;
  }

  const coreData = coreResult.rows[0];

  // Map database naming conventions to your exact frontend TypeScript interfaces
  return {
    childId: coreData.childId,
    name: coreData.name,
    age: coreData.age,
    riskLevel:
      coreData.riskLevel.charAt(0).toUpperCase() +
      coreData.riskLevel.slice(1).toLowerCase(),
    status: coreData.status,
    analytics: {
      riskScore: coreData.riskScore,
      sessionCount: coreData.sessionCount,
      moodBreakdown: {
        positive: coreData.sentimentPositive,
        neutral: coreData.sentimentNeutral,
        negative: coreData.sentimentNegative,
      },
    },
    recentSessions: historyResult.rows,
  };
};
