const API_BASE = "http://localhost:5000/api";

export interface ChildProfileResponse {
  childId: number;
  name: string;
  age: number;
  riskLevel: string;
  status: string;
  analytics: {
    riskScore: number;
    sessionCount: number;
    moodBreakdown: {
      positive: number;
      neutral: number;
      negative: number;
    };
  };
  recentSessions: Array<{
    sessionId: number;
    date: string;
    summary: string;
  }>;
}

export async function fetchChildProfile(childId: number) {
  const token = localStorage.getItem("workerToken");

  const response = await fetch(`${API_BASE}/children/${childId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to load child profile");
  }

  return response.json() as Promise<ChildProfileResponse>;
}
