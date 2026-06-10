const express = require("express");
const router = express.Router();

const sessionAudioRoutes = require("./session_start_audio");

router.get("/health", (req, res) => {
  res.json({ status: "ok", service: "backend" });
});

router.use("/session", sessionAudioRoutes);

module.exports = router;
