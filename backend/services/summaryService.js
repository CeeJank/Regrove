const { generateSummary } = require("./aiSummaryService");
const messageModel = require("../models/messageModel");
const summaryModel = require("../models/summaryModel");
const { formatTranscript } = require("../utils/formatTranscript");

const DEFAULT_RECOMMENDED_ACTION =
  "Worker should review the transcript and follow up during working hours.";

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

  const summaryText = await generateSummary(transcriptData.transcript);
  const summary = await summaryModel.createAiSummary(conversationId, summaryText);

  await summaryModel.createHandoverReport({
    youthId: session.youth_id,
    conversationId,
    summaryText,
    recommendedAction: DEFAULT_RECOMMENDED_ACTION,
  });

  await summaryModel.updateSessionStatus(conversationId, "ESCALATED");

  return {
    message: "Summary created successfully",
    transcript: transcriptData.transcript,
    summary,
  };
}

module.exports = {
  createSummaryForConversation,
  getTranscript,
};
