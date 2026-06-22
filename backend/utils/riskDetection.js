const HIGH_RISK_KEYWORDS = [
  "danger",
  "unsafe",
  "hurt me",
  "violence",
  "abuse",
  "threat",
  "emergency",
  "scared to go home",
  "someone is hurting me",
];

const MEDIUM_RISK_KEYWORDS = [
  "overwhelmed",
  "very sad",
  "crying",
  "anxious",
  "panic",
  "scared",
  "lonely",
  "no one cares",
  "family problem",
  "parents fighting",
  "argument at home",
  "i can't handle",
  "i cant handle",
  "too much pressure",
  "hated",
  "unwell",
];

const LOW_RISK_KEYWORDS = [
  "stress",
  "stressed",
  "school",
  "exam",
  "homework",
  "friend",
  "tired",
  "worried",
  "upset",
  "bad day",
];

function includesAnyKeyword(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}

function detectRiskLevel(input) {
  const text = String(input || "").toLowerCase();

  if (includesAnyKeyword(text, HIGH_RISK_KEYWORDS)) {
    return "high";
  }

  if (includesAnyKeyword(text, MEDIUM_RISK_KEYWORDS)) {
    return "medium";
  }

  if (includesAnyKeyword(text, LOW_RISK_KEYWORDS)) {
    return "low";
  }

  return "low";
}

function getRiskScore(riskLevel) {
  if (riskLevel === "high") return 8;
  if (riskLevel === "medium") return 5;
  return 2;
}

module.exports = {
  detectRiskLevel,
  getRiskScore,
};
