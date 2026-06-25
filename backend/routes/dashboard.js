const express = require("express");
const router = express.Router();
const { authenticateToken, requireWorkerOrAdmin } = require("../middleware/authMiddleware");
const { getRecentChildrenForWorker } = require("../controllers/dashboardController");

// ─── GET /api/workers/children/recent ────────────────────────────────────────
// Returns recent children for the authenticated worker's dashboard.
// Protected: valid JWT + worker or admin role required.
router.get("/children/recent", authenticateToken, requireWorkerOrAdmin, getRecentChildrenForWorker);

module.exports = router;
