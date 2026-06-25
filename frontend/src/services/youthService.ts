const API_BASE = "http://localhost:5000/api";

export interface YouthProfile {
  id: number;
  full_name: string;
  age: number | null;
  school: string | null;
  interests: string | null;
  category: string | null;
  status: string;
  latest_risk_level: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateYouthPayload {
  full_name: string;
  age?: number | string;
  school?: string;
  interests?: string;
  category?: string;
  status?: string;
  latest_risk_level?: string;
}

export async function fetchAllYouth(): Promise<YouthProfile[]> {
  const response = await fetch(`${API_BASE}/youth`);
  if (!response.ok) throw new Error("Failed to fetch youth profiles");
  const json = await response.json();
  return json.data;
}

export async function fetchYouthById(id: number): Promise<YouthProfile> {
  const response = await fetch(`${API_BASE}/youth/${id}`);
  if (!response.ok) throw new Error("Failed to fetch youth profile");
  const json = await response.json();
  return json.data;
}

export async function createYouth(payload: CreateYouthPayload): Promise<YouthProfile> {
  const response = await fetch(`${API_BASE}/youth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.message || "Failed to create youth profile");
  return json.data;
}
