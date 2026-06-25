import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../services/authService";

interface Props {
  children: React.ReactNode;
}

// ─── ProtectedRoute ───────────────────────────────────────────────────────────
// Wraps any route that requires the user to be logged in.
//
// If no JWT is found in localStorage, the user is redirected to /login.
// The "replace" prop prevents the login page from being added to browser history,
// so pressing the back button after login does not loop back to /login.
//
// Usage in App.tsx:
//   <Route path="/child" element={<ProtectedRoute><ChildCataloguePage /></ProtectedRoute>} />
//
// Note: this guard only checks token presence. Token validity (expiry, signature)
// is enforced by the backend on every API call, and apiFetch handles the
// resulting 401 by redirecting to /login automatically.
export default function ProtectedRoute({ children }: Props) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
