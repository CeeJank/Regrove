const workerModel = require("../models/workerModel");

async function markHandoverReviewed(conversationId) {
  const session = await workerModel.markSessionReviewed(conversationId);

  if (!session) {
    const error = new Error("Conversation not found");
    error.statusCode = 404;
    throw error;
  }

  const reviewedReports = await workerModel.markHandoverReportsReviewed(
    conversationId
  );

  return {
    message: "Handover marked as reviewed",
    conversation: {
      ...session,
      needs_handover: false,
    },
    reviewedReports,
  };
}

module.exports = {
  markHandoverReviewed,
};
