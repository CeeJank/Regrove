const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/auth");
const {
  getRecentChildrenForWorker,
} = require("../controllers/dashboardController");

router.get("/children/recent", authenticate, getRecentChildrenForWorker);

module.exports = router;
