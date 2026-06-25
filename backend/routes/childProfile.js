const express = require("express");
const router = express.Router();
const { authenticateToken, requireWorkerOrAdmin } = require("../middleware/authMiddleware");
const { getChildProfileById } = require("../controllers/childProfileController");

// ─── GET /api/children/:childId ───────────────────────────────────────────────
// Returns a single child profile by ID.
// Protected: valid JWT + worker or admin role required.
router.get("/:childId", authenticateToken, requireWorkerOrAdmin, getChildProfileById);

module.exports = router;
