const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/auth");
const { getMe, getDashboard } = require("../controllers/dashboardController");

<<<<<<< HEAD
// GET /api/workers/me — real worker name for the greeting
router.get("/me", authenticate, getMe);

// GET /api/workers/dashboard — stat cards + cases table
router.get("/dashboard", authenticate, getDashboard);
=======
// GET /api/workers/children/recent
// Returns recent youth profiles assigned to the authenticated worker for dashboard display.
router.get("/children/recent", authenticate, getRecentChildrenForWorker);
>>>>>>> c026cf3 (Refactor AI chat flow and complete handover lifecycle)

module.exports = router;
