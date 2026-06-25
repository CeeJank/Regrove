const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/auth");
const { getDashboard } = require("../controllers/dashboardController");

// GET /api/workers/dashboard
// Returns stat card counts + full case list for the logged-in social worker
router.get("/dashboard", authenticate, getDashboard);

module.exports = router;
