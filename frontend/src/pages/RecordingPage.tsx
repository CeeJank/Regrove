import { useRef, useState } from "react";
import { transcribeAudio } from "../services/audioService";

export default function RecordingPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState("Ready to record");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      setError("");
      setTranscript("");

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      chunksRef.current = [];
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        await uploadAudio(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setStatus("Recording... speak now");
    } catch (err) {
      console.error(err);
      setError("Microphone access was denied or is unavailable.");
      setStatus("Recording failed");
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setStatus("Uploading audio...");
    }
  };

  const uploadAudio = async (audioBlob: Blob) => {
    try {
      const result = await transcribeAudio(audioBlob);
      setTranscript(result.transcript || "No transcript returned.");
      setStatus("Transcript received");
    } catch (err) {
      console.error(err);
      setError("Could not upload audio or receive a transcript.");
      setStatus("Upload failed");
    }
  };

  return (
    <main className="page-shell">
      <section className="card">
        <p className="eyebrow">Recording</p>
        <h1>Audio session capture</h1>
        <p className="lead">
          This screen records microphone audio, uploads it to the backend, and
          shows the returned transcript.
        </p>

        <div className="button-row">
          <button
            className="primary-btn"
            onClick={startRecording}
            disabled={isRecording}
          >
            Start Recording
          </button>
          <button
            className="secondary-btn"
            onClick={stopRecording}
            disabled={!isRecording}
          >
            Stop Recording
          </button>
        </div>

        <p className="status">Status: {status}</p>
        {error ? <p className="error-box">{error}</p> : null}

        <section className="result-box">
          <h2>Transcript</h2>
          <p>
            {transcript ||
              "No transcript yet. Record audio and upload it to see the result."}
          </p>
        </section>
      </section>
    </main>
  );
}
