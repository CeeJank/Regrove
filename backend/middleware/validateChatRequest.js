function validateCreateConversation(req, res, next) {
  const { userId, workerId } = req.body;

  if (!userId || !workerId) {
    return res.status(400).json({
      message: "userId and workerId are required",
    });
  }

  return next();
}

function validateCreateMessage(req, res, next) {
  const { conversationId, senderType, userId, message } = req.body;
  const normalizedSenderType = String(senderType || "youth").toLowerCase();

  if (!conversationId || !message) {
    return res.status(400).json({
      message: "conversationId and message are required",
    });
  }

  if (normalizedSenderType !== "worker" && !userId) {
    return res.status(400).json({
      message: "userId is required when the sender is a youth",
    });
  }

  return next();
}

function validateLegacyChatMessage(req, res, next) {
  const { youthId, message } = req.body;

  if (!youthId || !message) {
    return res.status(400).json({
      message: "youthId and message are required",
    });
  }

  return next();
}

module.exports = {
  validateCreateConversation,
  validateCreateMessage,
  validateLegacyChatMessage,
};
