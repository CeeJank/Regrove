// ─── Auth Service ─────────────────────────────────────────────────────────────
// Centralises all authentication state management.
// Components and other services should never read localStorage directly —
// they should call these functions so the storage keys stay in one place.

const API_BASE = "/api";
const TOKEN_KEY = "token"; // localStorage key for the JWT
const USER_KEY  = "user";  // localStorage key for the serialised AuthUser object

// Shape of the user object stored in localStorage and returned by the API
export interface AuthUser {
  id: number;
  email: string;
  role: string; // 'worker' | 'admin' | 'child'
}

export interface LoginPayload {
  email: string;
  password: string;
}

// ─── login ────────────────────────────────────────────────────────────────────
// Sends credentials to POST /api/auth/login.
// On success: persists the JWT and user object to localStorage, then returns them.
// On failure: throws an Error with the server's message so the UI can display it.
export async function login(payload: LoginPayload): Promise<{ token: string; user: AuthUser }> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await response.json();
  if (!response.ok || !json.success) {
    throw new Error(json.message || "Login failed");
  }
  // Persist session data — token is read by apiFetch on every subsequent request
  localStorage.setItem(TOKEN_KEY, json.token);
  localStorage.setItem(USER_KEY, JSON.stringify(json.user));
  return { token: json.token, user: json.user };
}

// ─── logout ───────────────────────────────────────────────────────────────────
// Clears session data from localStorage.
// After calling this the user is considered unauthenticated and ProtectedRoute
// will redirect them to /login.
export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// ─── getToken ─────────────────────────────────────────────────────────────────
// Returns the stored JWT, or null if the user is not logged in.
// Used by apiFetch to attach the Authorization header.
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

// ─── getCurrentUser ───────────────────────────────────────────────────────────
// Returns the deserialised user object, or null if not logged in.
// Used by UI components to display the logged-in user's email and role.
export function getCurrentUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    // Corrupt localStorage entry — treat as logged out
    return null;
  }
}

// ─── isAuthenticated ─────────────────────────────────────────────────────────
// Quick boolean check used by ProtectedRoute to decide whether to render the
// page or redirect to /login.
// Note: this only checks token presence, not expiry. The backend validates
// expiry on every request and apiFetch handles the resulting 401.
export function isAuthenticated(): boolean {
  return !!getToken();
}
