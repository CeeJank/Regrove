import os
import tempfile
import threading
import uuid

import requests
from faster_whisper import WhisperModel
from flask import Flask, jsonify, request

app = Flask(__name__)

# Use "small" on CPU — loads in ~30 s and is fast enough for session audio.
# Switch to "large-v2" only when a GPU is available (set WHISPER_MODEL env var).
model_size = os.environ.get("WHISPER_MODEL", "small")

try:
    model = WhisperModel(model_size, device="cuda", compute_type="float16")
    print(f"Loaded Whisper ({model_size}) on CUDA")
except Exception as e:
    print(f"CUDA unavailable ({e}), falling back to CPU")
    model = WhisperModel(model_size, device="cpu", compute_type="int8")


def _transcribe_and_callback(tmp_path: str, ext: str, session_id: str) -> None:
    """
    Runs in a background thread so the HTTP response is returned immediately.
    Transcribes the audio file, then POSTs the markdown transcript to Express.
    Cleans up temp files whether transcription succeeds or fails.
    """
    md_path = f"{uuid.uuid4()}.md"
    try:
        segments, _info = model.transcribe(tmp_path, beam_size=5)
        print(f"Transcribing session {session_id!r}…")

        with open(md_path, "w") as f:
            for segment in segments:
                f.write(f"[{segment.start:.2f}s] {segment.text}\n")

        with open(md_path, "r") as f:
            markdown = f.read()

        express_url = os.environ.get("EXPRESS_API_URL", "http://localhost:5000")
        requests.post(
            f"{express_url}/api/session/transcript-callback",
            json={"session_id": session_id, "transcription": markdown},
            timeout=30,
        )
        print(f"Transcript for session {session_id!r} sent to Express.")
    except Exception as exc:
        print(f"Transcription error for session {session_id!r}: {exc}")
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)
        if os.path.exists(md_path):
            os.unlink(md_path)


@app.route("/transcribe", methods=["POST"])
def process_recording():
    recording = request.files.get("audio")
    session_id = request.form.get("session_id", "")

    if recording is None:
        return jsonify({"error": "No audio file received"}), 400

    if not recording.filename or not (
        recording.filename.endswith(".mp3") or recording.filename.endswith(".webm")
    ):
        return jsonify({"error": "Audio file must be .mp3 or .webm"}), 400

    ext = os.path.splitext(recording.filename)[1]

    # Save to a named temp file — faster-whisper needs a real filesystem path
    # (it calls FFmpeg under the hood which can't read from a file descriptor).
    tmp = tempfile.NamedTemporaryFile(suffix=ext, delete=False)
    try:
        recording.save(tmp)
        tmp_path = tmp.name
    finally:
        tmp.close()

    # Kick off transcription in the background and return 202 immediately
    # so the browser doesn't time out waiting for a slow CPU transcription.
    thread = threading.Thread(
        target=_transcribe_and_callback,
        args=(tmp_path, ext, session_id),
        daemon=True,
    )
    thread.start()

    return jsonify({"status": "accepted", "session_id": session_id}), 202


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model": model_size}), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=False)
