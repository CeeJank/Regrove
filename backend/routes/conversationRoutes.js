const express = require("express");
const router = express.Router();

const {
  createConversation,
  getAllConversations,
  getConversationById,
} = require("../controllers/conversationController");

router.post("/", createConversation);
router.get("/", getAllConversations);
router.get("/:id", getConversationById);

module.exports = router;
