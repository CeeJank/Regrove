const pool = require("../config/db");
const { generateSummary } = require("../services/aiSummaryService");
const { formatTranscript } = require("../utils/formatTranscript");

async function createSummary(req, res) {
  try {
    const { conversationId } = req.params;

    // Load the full chat history before creating a handover summary.
    const messagesResult = await pool.query(
      `SELECT sender_type, message
       FROM messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC`,
      [conversationId]
    );

    if (messagesResult.rows.length === 0) {
      return res.status(404).json({
        message: "No messages found for this conversation",
      });
    }

    const transcript = formatTranscript(messagesResult.rows);
    const summaryText = await generateSummary(transcript);
    const recommendedAction =
      "Worker should review the transcript and follow up during working hours.";

    const summaryResult = await pool.query(
      `INSERT INTO summaries (
         conversation_id,
         summary,
         urgency_level,
         recommended_action
       )
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [conversationId, summaryText, "medium", recommendedAction]
    );

    await pool.query(
      `UPDATE conversations
       SET needs_handover = false,
           mode = $1
       WHERE conversation_id = $2`,
      ["human", conversationId]
    );

    return res.status(201).json({
      message: "Summary created successfully",
      transcript,
      summary: summaryResult.rows[0],
    });
  } catch (error) {
    console.error("Create summary error:", error.message);

    return res.status(500).json({
      message: "Failed to create summary",
      error: error.message,
    });
  }
}

async function getSummariesByConversation(req, res) {
  try {
    const { conversationId } = req.params;

    const result = await pool.query(
      `SELECT *
       FROM summaries
       WHERE conversation_id = $1
       ORDER BY created_at DESC`,
      [conversationId]
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Get summaries error:", error.message);

    return res.status(500).json({
      message: "Failed to load summaries",
      error: error.message,
    });
  }
}

module.exports = {
  createSummary,
  getSummariesByConversation,
};
