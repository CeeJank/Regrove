const axios = require("axios");
const FormData = require("form-data");

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
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const response = await axios.post(`${pythonApiUrl}/transcribe`, formData, {
      headers: formData.getHeaders(),
    });

    return res.json({
      transcript: response.data.text,
      language: response.data.language,
      duration: response.data.duration,
    });
  } catch (error) {
    console.error("Transcription controller error:", error.message);

    return res.status(500).json({
      message: "Internal Server error",
      error: error.message,
    });
  }
};
