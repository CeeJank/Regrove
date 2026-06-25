<<<<<<< HEAD
// All requests go through apiFetch which automatically attaches the JWT
// and handles 401/403 session expiry globally.
import { apiFetch } from "./apiFetch";

const API_BASE = "http://localhost:5000/api";

// Shape of a youth profile as returned by the API.
// Matches the columns selected in youthModel.getAllYouth / getYouthById.
=======
const API_BASE = "http://localhost:5000/api";

>>>>>>> feature-youthcatalogue
export interface YouthProfile {
  id: number;
  full_name: string;
  age: number | null;
  school: string | null;
  interests: string | null;
  category: string | null;
<<<<<<< HEAD
  status: string;              // 'ACTIVE' | 'INACTIVE' | 'CLOSED'
  latest_risk_level: string;   // 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  created_at: string;
  updated_at?: string;         // only returned by getYouthById
}

// Fields accepted by POST /api/youth.
// full_name is the only required field; everything else is optional.
=======
  status: string;
  latest_risk_level: string;
  created_at: string;
  updated_at?: string;
}

>>>>>>> feature-youthcatalogue
export interface CreateYouthPayload {
  full_name: string;
  age?: number | string;
  school?: string;
  interests?: string;
  category?: string;
  status?: string;
  latest_risk_level?: string;
}

<<<<<<< HEAD
// ─── fetchAllYouth ────────────────────────────────────────────────────────────
// GET /api/youth — returns all profiles sorted newest-first.
// Used by YouthCataloguePage on mount.
export async function fetchAllYouth(): Promise<YouthProfile[]> {
  const response = await apiFetch(`${API_BASE}/youth`);
=======
export async function fetchAllYouth(): Promise<YouthProfile[]> {
  const response = await fetch(`${API_BASE}/youth`);
>>>>>>> feature-youthcatalogue
  if (!response.ok) throw new Error("Failed to fetch youth profiles");
  const json = await response.json();
  return json.data;
}

<<<<<<< HEAD
// ─── fetchYouthById ───────────────────────────────────────────────────────────
// GET /api/youth/:id — returns a single profile.
// Used by the Youth Detail page (future feature).
export async function fetchYouthById(id: number): Promise<YouthProfile> {
  const response = await apiFetch(`${API_BASE}/youth/${id}`);
=======
export async function fetchYouthById(id: number): Promise<YouthProfile> {
  const response = await fetch(`${API_BASE}/youth/${id}`);
>>>>>>> feature-youthcatalogue
  if (!response.ok) throw new Error("Failed to fetch youth profile");
  const json = await response.json();
  return json.data;
}

<<<<<<< HEAD
// ─── createYouth ─────────────────────────────────────────────────────────────
// POST /api/youth — creates a new youth profile.
// Requires a worker or admin JWT (enforced by the backend).
// Throws with the server's error message on failure so the form can display it.
export async function createYouth(payload: CreateYouthPayload): Promise<YouthProfile> {
  const response = await apiFetch(`${API_BASE}/youth`, {
    method: "POST",
=======
export async function createYouth(payload: CreateYouthPayload): Promise<YouthProfile> {
  const response = await fetch(`${API_BASE}/youth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
>>>>>>> feature-youthcatalogue
    body: JSON.stringify(payload),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.message || "Failed to create youth profile");
  return json.data;
}
