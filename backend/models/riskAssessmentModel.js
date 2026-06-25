const pool = require("../config/db");
const { getRiskScore } = require("../utils/riskDetection");

// Model responsibility:
// Save risk assessment records and keep the youth profile's latest risk level in sync.
// Services decide the risk level; this model only handles database writes.

// Stores one risk assessment for the session and updates the youth profile summary risk.
async function saveRiskAssessment(conversationId, riskLevel, reasoning) {
  const normalizedRisk = String(riskLevel || "low").toUpperCase();
  const riskScore = getRiskScore(String(riskLevel || "low").toLowerCase());

  await pool.query(
    `INSERT INTO risk_assessments (session_id, risk_level, risk_score, reasoning, created_at)
     VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
    [conversationId, normalizedRisk, riskScore, reasoning]
  );

  await pool.query(
    `UPDATE youth_profiles
     SET latest_risk_level = $1
     WHERE id = (
       SELECT youth_id
       FROM sessions
       WHERE id = $2
     )`,
    [normalizedRisk, conversationId]
  );
}

module.exports = {
  saveRiskAssessment,
};
