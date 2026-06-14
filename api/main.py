import os
import tempfile
import uuid

import requests
from faster_whisper import WhisperModel
from flask import Flask, jsonify, request

app = Flask(__name__)

# choose model
model_size = "large-v2"

# Run on NVIDIA GPU
model = WhisperModel(model_size, device="cuda", compute_type="float16")

# For running on CPU
# model = WhisperModel(model_size, device="cpu", compute_type="int8")


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "python-api"})


# temp endpoint for receiving from express
@app.route("/transcribe", methods=["POST"])
def processRecording():
    # To receive the recording, JSON objects cannot be used because they only store text
    # FormData() is to be used on expressjs side
    # fetch(`${process.env.PYTHON_API_URL}/recording`, {
    # method: 'POST',
    # body: formData
    # })
    recording = request.files.get("audio")

    if recording is None:
        return jsonify({"Error": "no recording received!!"}), 400

    # Check for not .mp4
    if not recording.filename or (
        not recording.filename.endswith(".mp4")
        and not recording.filename.endswith(".webm")
    ):
        return jsonify({"Error": "Recording not .mp4"}), 400

    # store the extension of the recording mp4/webm
    ext = os.path.splitext(recording.filename)[1]

    # uuid to generate tag for >1 requests, so the same file doesn't get overwritten
    md_path = f"{uuid.uuid4()}.md"

    # Temp file to store the recording because faster-whisper works under FFmpeg(C code) so it needs a real path
    with tempfile.NamedTemporaryFile(
        suffix=ext, delete=False
    ) as tmp:  # don't delete the file after closing
        recording.save(tmp)
        tmp_path = tmp.name
    try:
        segments, info = model.transcribe(tmp_path, beam_size=5)

        print("Recording is now being processed")

        # create the md file for transcript
        with open(md_path, "w") as f:
            for segment in segments:
                f.write(f"[{segment.start}s] {segment.text}\n")
    # unlink the file
    finally:
        os.unlink(tmp_path)

    # read the file to transmit
    with open(md_path, "r") as f:
        markdown = f.read()

    os.unlink(md_path)

    # contents of transcript in object for res
    express_url = os.environ.get("ESPRESS_API_URL", "http://localhost:5000")
    requests.post(f"{express_url}/new-endpoint", json={"transcription": markdown})
    return jsonify({"status": "Processing the transcript"}), 202


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=False)
