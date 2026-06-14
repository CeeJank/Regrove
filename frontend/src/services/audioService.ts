export async function transcribeAudio(audioBlob: Blob) {
  const formData = new FormData();
  formData.append("audio", audioBlob, "session-recording.webm");

  const response = await fetch("http://localhost:5000/api/session/transcribe", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload audio");
  }

  return response.json();
}
