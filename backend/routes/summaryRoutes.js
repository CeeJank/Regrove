const express = require("express");
const router = express.Router();

const {
  createSummary,
  getSummariesByConversation,
} = require("../controllers/summaryController");

router.post("/:conversationId", createSummary);
router.get("/:conversationId", getSummariesByConversation);

module.exports = router;
