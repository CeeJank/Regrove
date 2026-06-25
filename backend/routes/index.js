const express = require("express");
const router = express.Router();

// ─── Route modules ────────────────────────────────────────────────────────────
// Each file owns a slice of the API surface. Adding a new feature area means
// creating a new route file and mounting it here — nothing else changes.
const sessionAudioRoutes = require("./session_start_audio");
const dashboardRoutes    = require("./dashboard");
const childProfileRoutes = require("./childProfile");
const youthRoutes        = require("./youth");
const authRoutes         = require("./auth");
const userRoutes         = require("./users");

const { startSession } = require("../controllers/startSession");

// Auth middleware used directly on the inline /session/start route below
const { authenticateToken, requireWorkerOrAdmin } = require("../middleware/authMiddleware");

// ─── Route registration ───────────────────────────────────────────────────────
// Auth endpoints are public (login doesn't require a token by definition)
router.use("/auth", authRoutes);

// User management — worker creation is admin-only (enforced inside users.js)
router.use("/users", userRoutes);

// Session start is an inline route rather than a separate file;
// only authenticated workers/admins can start sessions
router.post("/session/start", authenticateToken, requireWorkerOrAdmin, startSession);

// Session audio transcription (upload + transcribe) — see session_start_audio.js
router.use("/session", sessionAudioRoutes);

// Worker dashboard data — protected inside dashboard.js
router.use("/workers", dashboardRoutes);

// Child profiles (legacy naming — maps to the child profile feature)
router.use("/children", childProfileRoutes);

// Youth profiles — all routes protected inside youth.js
router.use("/youth", youthRoutes);

module.exports = router;
