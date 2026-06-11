const API_BASE = "http://localhost:5000/api";

export async function fetchRecentChildren(workerId: number) {
  const token = localStorage.getItem("workerToken") || "dev-worker-1";

  const response = await fetch(`${API_BASE}/workers/${workerId}/children/recent`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to load recent children");
  }

  return response.json();
}
