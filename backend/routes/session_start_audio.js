const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload_audio_file");
const { transcribeAudio } = require("../controllers/session_start_audio");

// POST /api/session/transcribe
// Uploads an audio file using the "audio" form-data field and starts transcription.
router.post("/transcribe", upload.single("audio"), transcribeAudio);

module.exports = router;
