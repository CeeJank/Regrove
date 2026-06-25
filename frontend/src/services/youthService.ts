// All requests go through apiFetch which automatically attaches the JWT
// and handles 401/403 session expiry globally.
import { apiFetch } from "./apiFetch";

const API_BASE = "http://localhost:5000/api";

// Shape of a youth profile as returned by the API.
// Matches the columns selected in youthModel.getAllYouth / getYouthById.
export interface YouthProfile {
  id: number;
  full_name: string;
  age: number | null;
  school: string | null;
  interests: string | null;
  category: string | null;
  status: string;              // 'ACTIVE' | 'INACTIVE' | 'CLOSED'
  latest_risk_level: string;   // 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  created_at: string;
  updated_at?: string;         // only returned by getYouthById
}

// Fields accepted by POST /api/child.
// full_name is the only required field; everything else is optional.
export interface CreateYouthPayload {
  full_name: string;
  age?: number | string;
  school?: string;
  interests?: string;
  category?: string;
  status?: string;
  latest_risk_level?: string;
}

// ─── fetchAllYouth ────────────────────────────────────────────────────────────
// GET /api/child — returns all profiles sorted newest-first.
// Used by YouthCataloguePage on mount.
export async function fetchAllYouth(): Promise<YouthProfile[]> {
  const response = await apiFetch(`${API_BASE}/child`);
  if (!response.ok) throw new Error("Failed to fetch youth profiles");
  const json = await response.json();
  return json.data;
}

// ─── fetchYouthById ───────────────────────────────────────────────────────────
// GET /api/child/:id — returns a single profile.
// Used by the Youth Detail page (future feature).
export async function fetchYouthById(id: number): Promise<YouthProfile> {
  const response = await apiFetch(`${API_BASE}/child/${id}`);
  if (!response.ok) throw new Error("Failed to fetch youth profile");
  const json = await response.json();
  return json.data;
}

// ─── createYouth ─────────────────────────────────────────────────────────────
// POST /api/child — creates a new child profile.
// Requires a worker or admin JWT (enforced by the backend).
// Throws with the server's error message on failure so the form can display it.
export async function createYouth(payload: CreateYouthPayload): Promise<YouthProfile> {
  const response = await apiFetch(`${API_BASE}/child`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.message || "Failed to create youth profile");
  return json.data;
}
