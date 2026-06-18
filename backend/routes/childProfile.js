const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/auth");
const {
  getChildProfileById,
} = require("../controllers/childProfileController");

// GET /api/children/:childId
// Returns detailed profile information for one youth/child.
router.get("/:childId", authenticate, getChildProfileById);

module.exports = router;
