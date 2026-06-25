const express = require("express");
const router = express.Router();

const {
  createMessage,
  getMessagesByConversation,
} = require("../controllers/messageController");

router.post("/", createMessage);
router.get("/:conversationId", getMessagesByConversation);

module.exports = router;
