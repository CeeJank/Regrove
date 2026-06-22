const { generateSummary } = require("./aiSummaryService");
const messageModel = require("../models/messageModel");
const riskAssessmentModel = require("../models/riskAssessmentModel");
const summaryModel = require("../models/summaryModel");
const { formatTranscript } = require("../utils/formatTranscript");

async function getTranscript(conversationId) {
  const messages = await messageModel.findTranscriptMessages(conversationId);

  if (messages.length === 0) {
    return null;
  }

  return {
    conversationId: Number(conversationId),
    messages,
    transcript: formatTranscript(messages),
  };
}

async function createSummaryForConversation(conversationId) {
  const session = await summaryModel.findSessionById(conversationId);

  if (!session) {
    const error = new Error("Conversation not found");
    error.statusCode = 404;
    throw error;
  }

  const transcriptData = await getTranscript(conversationId);

  if (!transcriptData) {
    const error = new Error("No messages found for this conversation");
    error.statusCode = 404;
    throw error;
  }

  const summaryResultFromAI = await generateSummary(transcriptData.transcript);
  const summary = await summaryModel.createAiSummary(
    conversationId,
    summaryResultFromAI.summaryText
  );

  await riskAssessmentModel.saveRiskAssessment(
    conversationId,
    summaryResultFromAI.riskLevel,
    "Risk detected from handover transcript summary."
  );

  await summaryModel.createHandoverReport({
    youthId: session.youth_id,
    conversationId,
    summaryText: summaryResultFromAI.summaryText,
    recommendedAction: summaryResultFromAI.recommendedAction,
  });

  await summaryModel.updateSessionStatus(conversationId, "ESCALATED");

  return {
    message: "Summary created successfully",
    transcript: transcriptData.transcript,
    summary,
    riskLevel: summaryResultFromAI.riskLevel,
    recommendedAction: summaryResultFromAI.recommendedAction,
    suggestedOpeningMessage: summaryResultFromAI.suggestedOpeningMessage,
  };
}

module.exports = {
  createSummaryForConversation,
  getTranscript,
};
