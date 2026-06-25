const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/auth");
const {
  getChildProfileById,
  updateRiskLevel,
  saveNotes,
} = require("../controllers/childProfileController");

// GET  /api/children/:childId         — fetch full child profile
router.get("/:childId", authenticate, getChildProfileById);

// PATCH /api/children/:childId/risk   — update risk level
// Body: { riskLevel: 'low'|'medium'|'high'|'critical' }
router.patch("/:childId/risk", authenticate, updateRiskLevel);

// PATCH /api/children/:childId/notes  — save worker note
// Body: { notes: string }
router.patch("/:childId/notes", authenticate, saveNotes);

module.exports = router;
