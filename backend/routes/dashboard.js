const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/auth");
const {getRecentChildrenForWorker} = require("../controllers/dashboardController");

router.get("/children/recent", authenticate, getRecentChildrenForWorker);
router.get("/dashboard/summary", authenticate, getDashboardHeaderData);

module.exports = router;
