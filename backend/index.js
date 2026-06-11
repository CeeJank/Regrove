const express = require("express");
const router = express.Router();

const sessionAudioRoutes = require("./routes/session_start_audio");
const dashboardRoutes = require("./routes/dashboard");

router.use("/session", sessionAudioRoutes);
router.use("/workers", dashboardRoutes);

module.exports = router;
