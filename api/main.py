import os
import uuid

from flask import Flask, jsonify, request
from faster_whisper import WhisperModel

app = Flask(__name__)

model = WhisperModel("small", device="cpu", compute_type="int8")

@app.route('/transcribe', methods=['POST'])
def transcribe():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400

    file = request.files['audio']
    temp_path = f"{uuid.uuid4()}.webm"
    file.save(temp_path)

    try:
        segments, info = model.transcribe(temp_path, language="en")
        text = " ".join([seg.text for seg in segments])

        return jsonify({
            'text': text,
            'language': info.language,
            'duration': info.duration
        })
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'python-api'})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=False)
