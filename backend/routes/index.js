const express = require("express");
const router = express.Router();

const sessionAudioRoutes = require("./session_start_audio");
const dashboardRoutes = require("./dashboard");
const childProfileRoutes = require("./childProfile");
<<<<<<< HEAD
const eventRoutes = require("./events");
=======
const chatRoutes = require("./chat");
const conversationRoutes = require("./conversationRoutes");
const messageRoutes = require("./messageRoutes");
const summaryRoutes = require("./summaryRoutes");
const workerRoutes = require("./workerRoutes");
>>>>>>> 8df2b36 (Add AI chat box backend and testing frontend structure)
const { startSession } = require("../controllers/startSession");
const authenticate = require("../middleware/auth");

router.post("/session/start", authenticate, startSession);
router.use("/session", sessionAudioRoutes);
router.use("/workers", workerRoutes);
router.use("/workers", dashboardRoutes);
router.use("/children", childProfileRoutes);
<<<<<<< HEAD
router.use("/events", eventRoutes);
=======
router.use("/chat", chatRoutes);
router.use("/conversations", conversationRoutes);
router.use("/messages", messageRoutes);
router.use("/summaries", summaryRoutes);

>>>>>>> 8df2b36 (Add AI chat box backend and testing frontend structure)
module.exports = router;
