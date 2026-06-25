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

// POST /api/session/start
// Starts a worker session for an assigned youth.
router.post("/session/start", authenticate, startSession);

// /api/session/*
// Audio/session utilities, including audio transcription.
router.use("/session", sessionAudioRoutes);

// /api/workers/handover
// AI handover list for workers.
router.use("/workers", workerRoutes);

// /api/workers/children/recent
// Dashboard data for a worker's recent youth profiles.
router.use("/workers", dashboardRoutes);

// /api/children/:childId
// Detailed profile data for one youth.
router.use("/children", childProfileRoutes);
<<<<<<< HEAD
<<<<<<< HEAD
router.use("/events", eventRoutes);
=======
=======

// /api/chat/*
// Legacy chat route kept for backward compatibility.
>>>>>>> c026cf3 (Refactor AI chat flow and complete handover lifecycle)
router.use("/chat", chatRoutes);

// /api/conversations/*
// Conversation/session list, details, and transcript endpoints.
router.use("/conversations", conversationRoutes);

// /api/messages/*
// Shared youth/worker/AI message endpoints.
router.use("/messages", messageRoutes);

// /api/summaries/*
// AI summary creation and summary history endpoints.
router.use("/summaries", summaryRoutes);

>>>>>>> 8df2b36 (Add AI chat box backend and testing frontend structure)
module.exports = router;
