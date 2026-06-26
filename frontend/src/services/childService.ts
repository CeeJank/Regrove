import { apiFetch } from './apiFetch';

const API_BASE = '/api';

export interface ChildProfile {
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

export interface CreateChildPayload {
  full_name: string;
  age?: number | string;
  school?: string;
  interests?: string;
  category?: string;
  status?: string;
  latest_risk_level?: string;
}

export async function fetchAllChildren(): Promise<ChildProfile[]> {
  const response = await apiFetch(`${API_BASE}/child`);
  if (!response.ok) throw new Error('Failed to fetch child profiles');
  const json = await response.json();
  return json.data;
}

export async function fetchChildById(id: number): Promise<ChildProfile> {
  const response = await apiFetch(`${API_BASE}/child/${id}`);
  if (!response.ok) throw new Error('Failed to fetch child profile');
  const json = await response.json();
  return json.data;
}

export async function createChild(payload: CreateChildPayload): Promise<ChildProfile> {
  const response = await apiFetch(`${API_BASE}/child`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.message || 'Failed to create child profile');
  return json.data;
}
