import { useEffect, useState } from "react";
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

  useEffect(() => {
    fetchAllYouth()
      .then(setYouth)
      .catch(() => setError("Failed to load youth profiles."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = youth.filter((y) => {
    const matchName = y.full_name.toLowerCase().includes(search.toLowerCase());
    const matchRisk = riskFilter ? y.latest_risk_level === riskFilter : true;
    const matchStatus = statusFilter ? y.status === statusFilter : true;
    return matchName && matchRisk && matchStatus;
  });

  return (
    <main className="page-shell" style={{ alignItems: "flex-start" }}>
      <section className="card" style={{ maxWidth: 1000 }}>
        <p className="eyebrow">Youth Support Platform</p>
        <h1>Youth Catalogue</h1>

        <div className="button-row">
          <Link to="/youth/create" className="primary-btn">+ New Profile</Link>
          <Link to="/" className="secondary-btn">Home</Link>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <input
            className="field-input"
            style={{ flex: 1, minWidth: 200 }}
            placeholder="Search by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="field-input" style={{ minWidth: 140 }} value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)}>
            <option value="">All risk levels</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
          <select className="field-input" style={{ minWidth: 130 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>

        {loading && <p className="status">Loading…</p>}
        {error && <p className="error-box">{error}</p>}
        {!loading && !error && filtered.length === 0 && <p className="status">No youth profiles found.</p>}

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
                    <td style={{ ...td, maxWidth: 200, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {y.interests || "—"}
                    </td>
                    <td style={td}>{y.status}</td>
                    <td style={td}>
                      <span style={{
                        color: RISK_COLOURS[y.latest_risk_level] || "#374151",
                        fontWeight: 600,
                        fontSize: "0.8rem",
                      }}>
                        {y.latest_risk_level}
                      </span>
                    </td>
                    <td style={td}>
                      <Link to={`/youth/${y.id}`} className="secondary-btn" style={{ padding: "4px 10px", fontSize: "0.8rem" }}>
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

const th = { padding: "8px 12px", fontWeight: 600 } as const;
const td = { padding: "8px 12px" } as const;
