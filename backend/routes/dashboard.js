const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/auth");
const { getMe, getDashboard } = require("../controllers/dashboardController");

// GET /api/workers/me — real worker name for the greeting
router.get("/me", authenticate, getMe);

// GET /api/workers/dashboard — stat cards + cases table
router.get("/dashboard", authenticate, getDashboard);

module.exports = router;
