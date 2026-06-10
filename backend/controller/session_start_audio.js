const axios = require("axios");
const FormData = require("form-data");

exports.transcribeAudio = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Audio file required",
      });
    }

    const formData = new FormData();

    formData.append("audio", req.file.buffer, {
      filename: "audio.webm",
    });

    const response = await axios.post(
      "http://localhost:8000/transcribe",
      formData,
      {
        headers: formData.getHeaders(),
      },
    );

    return res.json({
      transcript: response.data.text,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server error",
    });
  }
};
