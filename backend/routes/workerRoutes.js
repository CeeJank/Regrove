const express = require("express");
const router = express.Router();

const {
  getHandoverConversations,
} = require("../controllers/workerController");

router.get("/handover", getHandoverConversations);

module.exports = router;
