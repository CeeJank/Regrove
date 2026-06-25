import { useEffect, useState } from "react";
<<<<<<< HEAD
import { Link, useNavigate } from "react-router-dom";
import { fetchAllYouth, type YouthProfile } from "../services/youthService";
import { logout, getCurrentUser } from "../services/authService";

// Colour map for risk level badges — makes risk levels immediately scannable
const RISK_COLOURS: Record<string, string> = {
  LOW:      "#166534",
  MEDIUM:   "#92400e",
  HIGH:     "#b91c1c",
  CRITICAL: "#6b21a8",
};

// ─── YouthCataloguePage ───────────────────────────────────────────────────────
// Main worker view — shows all youth profiles in a searchable, filterable table.
//
// Protected by ProtectedRoute in App.tsx: unauthenticated users never reach here.
//
// Features:
//   - Loads all profiles on mount via GET /api/youth
//   - Client-side search by name (case-insensitive)
//   - Client-side filters for risk level and status
//   - Displays the logged-in user's email and role in the header
//   - Logout button clears session and redirects to /login
export default function YouthCataloguePage() {
  const navigate = useNavigate();

  const [youth, setYouth]         = useState<YouthProfile[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [search, setSearch]       = useState("");
  const [riskFilter, setRiskFilter]     = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Read the logged-in user from localStorage for the header display
  const user = getCurrentUser();

  // Clear localStorage and send the user back to the login screen
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Fetch all youth profiles once on mount
  // apiFetch handles 401/403 automatically — no special error handling needed here
=======
import { Link } from "react-router-dom";
import { fetchAllYouth, type YouthProfile } from "../services/youthService";

const RISK_COLOURS: Record<string, string> = {
  LOW: "#166534",
  MEDIUM: "#92400e",
  HIGH: "#b91c1c",
  CRITICAL: "#6b21a8",
};

export default function YouthCataloguePage() {
  const [youth, setYouth] = useState<YouthProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

>>>>>>> feature-youthcatalogue
  useEffect(() => {
    fetchAllYouth()
      .then(setYouth)
      .catch(() => setError("Failed to load youth profiles."))
      .finally(() => setLoading(false));
  }, []);

<<<<<<< HEAD
  // Apply all active filters to the full list client-side
  // This avoids a server round-trip on every keystroke
  const filtered = youth.filter((y) => {
    const matchName   = y.full_name.toLowerCase().includes(search.toLowerCase());
    const matchRisk   = riskFilter   ? y.latest_risk_level === riskFilter   : true;
    const matchStatus = statusFilter ? y.status            === statusFilter : true;
=======
  const filtered = youth.filter((y) => {
    const matchName = y.full_name.toLowerCase().includes(search.toLowerCase());
    const matchRisk = riskFilter ? y.latest_risk_level === riskFilter : true;
    const matchStatus = statusFilter ? y.status === statusFilter : true;
>>>>>>> feature-youthcatalogue
    return matchName && matchRisk && matchStatus;
  });

  return (
    <main className="page-shell" style={{ alignItems: "flex-start" }}>
      <section className="card" style={{ maxWidth: 1000 }}>
        <p className="eyebrow">Youth Support Platform</p>
        <h1>Youth Catalogue</h1>

<<<<<<< HEAD
        {/* Action bar — navigation, logged-in user display, logout */}
        <div className="button-row">
          <Link to="/youth/create" className="primary-btn">+ New Profile</Link>
          <Link to="/" className="secondary-btn">Home</Link>
          {user && (
            <span style={{ marginLeft: "auto", fontSize: "0.85rem", color: "var(--text)", alignSelf: "center" }}>
              {user.email} ({user.role})
            </span>
          )}
          <button onClick={handleLogout} className="secondary-btn">Logout</button>
        </div>

        {/* Filter bar — all filtering is client-side */}
=======
        <div className="button-row">
          <Link to="/youth/create" className="primary-btn">+ New Profile</Link>
          <Link to="/" className="secondary-btn">Home</Link>
        </div>

        {/* Filters */}
>>>>>>> feature-youthcatalogue
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <input
            className="field-input"
            style={{ flex: 1, minWidth: 200 }}
            placeholder="Search by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
<<<<<<< HEAD
          <select
            className="field-input"
            style={{ minWidth: 140 }}
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
          >
=======
          <select className="field-input" style={{ minWidth: 140 }} value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)}>
>>>>>>> feature-youthcatalogue
            <option value="">All risk levels</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
<<<<<<< HEAD
          <select
            className="field-input"
            style={{ minWidth: 130 }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
=======
          <select className="field-input" style={{ minWidth: 130 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
>>>>>>> feature-youthcatalogue
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>

<<<<<<< HEAD
        {/* Loading / empty / error states */}
        {loading && <p className="status">Loading…</p>}
        {error   && <p className="error-box">{error}</p>}
        {!loading && !error && filtered.length === 0 && (
          <p className="status">No youth profiles found.</p>
        )}

        {/* Results table — only rendered when there is data */}
=======
        {loading && <p className="status">Loading…</p>}
        {error && <p className="error-box">{error}</p>}
        {!loading && !error && filtered.length === 0 && <p className="status">No youth profiles found.</p>}

>>>>>>> feature-youthcatalogue
        {!loading && !error && filtered.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border)", textAlign: "left" }}>
                  <th style={th}>Name</th>
                  <th style={th}>Age</th>
                  <th style={th}>School</th>
                  <th style={th}>Category</th>
                  <th style={th}>Interests</th>
                  <th style={th}>Status</th>
                  <th style={th}>Risk</th>
                  <th style={th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((y) => (
                  <tr key={y.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ ...td, fontWeight: 600 }}>{y.full_name}</td>
                    <td style={td}>{y.age ?? "—"}</td>
                    <td style={td}>{y.school || "—"}</td>
                    <td style={td}>{y.category || "—"}</td>
<<<<<<< HEAD
                    {/* Truncate long interests strings with ellipsis */}
=======
>>>>>>> feature-youthcatalogue
                    <td style={{ ...td, maxWidth: 200, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {y.interests || "—"}
                    </td>
                    <td style={td}>{y.status}</td>
                    <td style={td}>
<<<<<<< HEAD
                      {/* Risk level styled with the colour map defined at the top */}
=======
>>>>>>> feature-youthcatalogue
                      <span style={{
                        color: RISK_COLOURS[y.latest_risk_level] || "#374151",
                        fontWeight: 600,
                        fontSize: "0.8rem",
                      }}>
                        {y.latest_risk_level}
                      </span>
                    </td>
                    <td style={td}>
<<<<<<< HEAD
                      <Link
                        to={`/youth/${y.id}`}
                        className="secondary-btn"
                        style={{ padding: "4px 10px", fontSize: "0.8rem" }}
                      >
=======
                      <Link to={`/youth/${y.id}`} className="secondary-btn" style={{ padding: "4px 10px", fontSize: "0.8rem" }}>
>>>>>>> feature-youthcatalogue
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

<<<<<<< HEAD
// Shared cell padding styles extracted as constants to avoid repetition in JSX
=======
>>>>>>> feature-youthcatalogue
const th = { padding: "8px 12px", fontWeight: 600 } as const;
const td = { padding: "8px 12px" } as const;
