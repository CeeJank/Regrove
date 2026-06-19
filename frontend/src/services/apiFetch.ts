import { getToken, logout } from "./authService";

// Authenticated wrapper around the native fetch() API.
// Used by all service functions instead of calling fetch() directly.
//
// Responsibilities:
//   - Reads the JWT from localStorage and attaches "Authorization: Bearer <token>"
//   - Defaults Content-Type to application/json (skipped for FormData uploads)
//   - Globally handles 401 and 403 responses from the backend:
//       401 = token missing, expired, or tampered — session is ended
//       403 = token valid but role lacks permission — session is ended
//     In both cases: localStorage is cleared, a message is stored in
//     sessionStorage for LoginPage to display, then the user is redirected to /login.
export async function apiFetch(input: RequestInfo, init: RequestInit = {}): Promise<Response> {
  const token = getToken();

  // Build headers from whatever the caller provided
  const headers = new Headers(init.headers);

  // Attach JWT when available
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Set JSON content type by default unless the body is a file upload
  if (!headers.has("Content-Type") && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(input, { ...init, headers });

  // Handle auth errors globally so individual service functions do not need to
  if (response.status === 401 || response.status === 403) {
    logout();

    // Pick a message that tells the user why they are being redirected
    const message =
      response.status === 401
        ? "Your session has expired. Please log in again."
        : "You do not have permission to perform this action.";

    // Store in sessionStorage (survives the redirect, cleared after one read)
    // LoginPage reads this on mount and shows it as an error message
    sessionStorage.setItem("auth_redirect_message", message);

    // Hard redirect — this function is outside the React tree so we cannot
    // use React Router's navigate()
    window.location.href = "/login";
  }

  return response;
}
