const API_BASE = "http://localhost:5000/api";

export async function startSession(childId: number) {
  const res = await fetch(`${API_BASE}/session/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("workerToken")}`
    },
    body: JSON.stringify({ childId })
  });

  if (!res.ok) throw new Error("Failed to start session");

  return res.json();
}