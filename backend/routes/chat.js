const express = require("express");
const router = express.Router();

const {
  getConversation,
  sendMessage,
} = require("../controllers/chatController");

router.post("/message", sendMessage);
router.get("/:conversationId", getConversation);

module.exports = router;
