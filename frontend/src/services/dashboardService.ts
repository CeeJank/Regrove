const API_BASE = "http://localhost:5000/api";

export async function fetchRecentChildren() {
  const token = localStorage.getItem("workerToken");

  const response = await fetch(`${API_BASE}/workers/children/recent`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to load recent children");
  }

  return response.json();
}
