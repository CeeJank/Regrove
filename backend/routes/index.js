const express = require("express");
const router = express.Router();

const sessionAudioRoutes = require("./session_start_audio");
const dashboardRoutes = require("./dashboard");
const childProfileRoutes = require("./childProfile");
const chatRoutes = require("./chat");
const conversationRoutes = require("./conversationRoutes");
const messageRoutes = require("./messageRoutes");
const summaryRoutes = require("./summaryRoutes");
const workerRoutes = require("./workerRoutes");
const { startSession } = require("../controllers/startSession");
const authenticate = require("../middleware/auth");

router.post("/session/start", authenticate, startSession);
router.use("/session", sessionAudioRoutes);
router.use("/workers", workerRoutes);
router.use("/workers", dashboardRoutes);
router.use("/children", childProfileRoutes);
router.use("/chat", chatRoutes);
router.use("/conversations", conversationRoutes);
router.use("/messages", messageRoutes);
router.use("/summaries", summaryRoutes);

module.exports = router;
