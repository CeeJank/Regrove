const axios = require("axios");
const FormData = require("form-data");

// Controller responsibility:
// Accept an uploaded audio file and forward it to the Python transcription API.
// This controller integrates with an external service instead of a database model.
exports.transcribeAudio = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Audio file required",
      });
    }

    const pythonApiUrl = process.env.PYTHON_API_URL || "http://localhost:8000";

    const formData = new FormData();
    formData.append("audio", req.file.buffer, {
      filename: req.file.originalname || "audio.webm" || "audio.mp4",
      contentType: req.file.mimetype || "audio/webm" || "audio/webm",
    });

    const response = await axios.post(`${pythonApiUrl}/transcribe`, formData, {
      headers: formData.getHeaders(),
    });

    return res.json({
      // transcript: response.data.transcription,
      // language: response.data.language,   old code when it flask returned to this endpoint
      // duration: response.data.duration,
      message: "Transcription in progress",
    });
  } catch (error) {
    console.error("Transcription controller error:", error.message);

    return res.status(500).json({
      message: "Internal Server error",
      error: error.message,
    });
  }
};
