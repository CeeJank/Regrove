const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/auth");
const {
  getRecentChildrenForWorker,
} = require("../controllers/dashboardController");

// GET /api/workers/children/recent
// Returns recent youth profiles assigned to the authenticated worker for dashboard display.
router.get("/children/recent", authenticate, getRecentChildrenForWorker);

module.exports = router;
