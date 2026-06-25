import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login, isAuthenticated } from "../services/authService";

// ─── LoginPage ────────────────────────────────────────────────────────────────
// The entry point for all users — workers, admins, and youth all log in here.
//
// Behaviours:
//   - If a valid token already exists in localStorage, skips straight to /youth
//   - Reads "auth_redirect_message" from sessionStorage and shows it as an error.
//     This message is written by apiFetch when a 401/403 response is received
//     mid-session (e.g. expired token), giving the user context for why they
//     were redirected here.
//   - On successful login, navigates to /youth (the youth catalogue)
//   - On failure, shows the server error message without redirecting
export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Skip login form if the user already has a session
    if (isAuthenticated()) {
      navigate("/youth", { replace: true });
      return;
    }

    // Display any session-expiry or permission message left by apiFetch
    const msg = sessionStorage.getItem("auth_redirect_message");
    if (msg) {
      setError(msg);
      // Remove after reading so it does not persist on page refresh
      sessionStorage.removeItem("auth_redirect_message");
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Client-side presence check before sending a request
    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    try {
      // login() POSTs credentials, stores token + user in localStorage on success
      await login({ email, password });
      navigate("/youth");
    } catch (err: unknown) {
      // Surface the server's error message (e.g. "Invalid email or password")
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-shell">
      <section className="card" style={{ maxWidth: 420 }}>
        <p className="eyebrow">SCS Youth Support Platform</p>
        <h1 style={{ fontSize: 32, marginBottom: 8 }}>Worker Login</h1>
        <p className="lead" style={{ marginBottom: 24, fontSize: "0.92rem" }}>
          Sign in with your worker account to continue.
        </p>

        {/* Error box — shown for both client validation and server errors */}
        {error && <p className="error-box">{error}</p>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <label className="field-label">
            Email
            <input
              className="field-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="worker@example.com"
              autoComplete="email"
            />
          </label>

          <label className="field-label">
            Password
            <input
              className="field-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </label>

          {/* Button is disabled while the request is in-flight to prevent double submission */}
          <button type="submit" className="primary-btn" disabled={loading} style={{ marginTop: 4 }}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </section>
    </main>
  );
}
