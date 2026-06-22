const { generateAIReply } = require("./aiChatService");
const { isAfterWorkingHours } = require("./timeService");
const messageModel = require("../models/messageModel");
const riskAssessmentModel = require("../models/riskAssessmentModel");

async function sendWorkerMessage({ conversationId, workerId, message }) {
  const workerMessage = await messageModel.createMessage({
    conversationId,
    senderType: "WORKER",
    senderId: workerId || null,
    message,
  });

  await messageModel.updateSessionMode(
    conversationId,
    "WORKER_CHAT",
    "ACTIVE"
  );

  return {
    mode: "human",
    message: "Message sent to youth",
    workerMessage,
    aiReply: null,
  };
}

async function sendYouthMessage({ conversationId, userId, message, forceAi }) {
  const youthMessage = await messageModel.createMessage({
    conversationId,
    senderType: "YOUTH",
    senderId: userId,
    message,
  });

  const shouldUseAi = isAfterWorkingHours() || forceAi === true;

  if (!shouldUseAi) {
    await messageModel.updateSessionMode(
      conversationId,
      "WORKER_CHAT",
      "ACTIVE"
    );

    return {
      mode: "human",
      message: "Message sent to worker",
      youthMessage,
      aiReply: null,
    };
  }

  const aiResult = await generateAIReply(message);
  const aiReply = await messageModel.createMessage({
    conversationId,
    senderType: "AI",
    senderId: null,
    message: aiResult.reply,
  });

  await riskAssessmentModel.saveRiskAssessment(
    conversationId,
    aiResult.riskLevel,
    "Risk detected from after-hours youth message."
  );

  await messageModel.updateSessionMode(
    conversationId,
    "AI_AFTER_HOURS",
    "ESCALATED"
  );

  return {
    mode: "ai",
    message: "AI replied after-hours",
    youthMessage,
    aiReply,
    riskLevel: aiResult.riskLevel,
    needsUrgentReview: aiResult.needsUrgentReview,
  };
}

async function createChatMessage(payload) {
  const senderType = String(payload.senderType || "youth").toLowerCase();

  if (senderType === "worker") {
    return sendWorkerMessage(payload);
  }

  return sendYouthMessage(payload);
}

module.exports = {
  createChatMessage,
};
