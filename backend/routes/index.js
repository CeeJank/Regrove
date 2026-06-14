const express = require("express");
const router = express.Router();

const sessionAudioRoutes = require("./session_start_audio");
const dashboardRoutes = require("./dashboard");
const childProfileRoutes = require("./childProfile");
const { startSession } = require("../controllers/startSession");
const authenticate = require("../middleware/auth");

router.post("/session/start", authenticate, startSession);
router.use("/session", sessionAudioRoutes);
router.use("/workers", dashboardRoutes);
router.use("/children", childProfileRoutes);

module.exports = router;
