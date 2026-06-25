const API_BASE = 'http://localhost:5000/api';

export const getToken = () => localStorage.getItem('token') ?? '';

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  Object.assign(headers, options.headers ?? {});

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function apiFetchForm<T>(path: string, body: FormData): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { method: 'POST', headers, body });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function uploadSessionAudio(sessionId: string, blob: Blob): Promise<void> {
  const formData = new FormData();
  formData.append('audio', blob, 'session.webm');
  formData.append('sessionId', sessionId);
  await apiFetchForm<unknown>('/session/transcribe', formData);
}

export async function fetchCansSummary(sessionId: string): Promise<{ summary: string; createdAt: string } | null> {
  try {
    return await apiFetch<{ summary: string; createdAt: string }>(`/session/cans-summary/${sessionId}`);
  } catch {
    return null;
  }
}
