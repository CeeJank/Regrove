const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/auth");
const {
  getChildProfileById,
} = require("../controllers/childProfileController");

router.get("/:childId", authenticate, getChildProfileById);

module.exports = router;
