import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAllYouth, type YouthProfile } from "../services/youthService";

const RISK_META: Record<string, { bg: string; text: string; dot: string; label: string; card: string }> = {
  LOW:      { bg: "#F0FDF4", text: "#166534", dot: "#22C55E", label: "Low",      card: "stat-card--green"  },
  MEDIUM:   { bg: "#FEFCE8", text: "#92400E", dot: "#EAB308", label: "Medium",   card: "stat-card--yellow" },
  HIGH:     { bg: "#FEF2F2", text: "#B91C1C", dot: "#EF4444", label: "High",     card: "stat-card--red"    },
  CRITICAL: { bg: "#F5F3FF", text: "#6D28D9", dot: "#7C3AED", label: "Critical", card: "stat-card--purple" },
};

export default function YouthCataloguePage() {
  const [youth, setYouth]               = useState<YouthProfile[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [search, setSearch]             = useState("");
  const [riskFilter, setRiskFilter]     = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchAllYouth()
      .then(setYouth)
      .catch(() => setError("Failed to load youth profiles."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = youth.filter((y) => {
    const matchName   = y.full_name.toLowerCase().includes(search.toLowerCase());
    const matchRisk   = riskFilter   ? y.latest_risk_level === riskFilter   : true;
    const matchStatus = statusFilter ? y.status            === statusFilter : true;
    return matchName && matchRisk && matchStatus;
  });

  const countByRisk = (level: string) => youth.filter((y) => y.latest_risk_level === level).length;

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Youth Catalogue</h1>
          <p className="page-sub">All youth profiles under your care.</p>
        </div>
        <Link to="/sw/child-catalog/create" className="btn btn--primary btn--sm">+ New Profile</Link>
      </div>

      <div className="stat-cards">
        {(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const).map((level) => {
          const meta = RISK_META[level];
          return (
            <div
              key={level}
              className={`stat-card ${meta.card}`}
              style={{ cursor: "pointer" }}
              onClick={() => setRiskFilter(riskFilter === level ? "" : level)}
            >
              <p className="stat-label">{meta.label}</p>
              <p className="stat-value">{countByRisk(level)}</p>
            </div>
          );
        })}
      </div>

      <div className="section-header">
        <h2 className="section-title">All Youth</h2>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input
          className="form-input"
          style={{ flex: 1, minWidth: 200 }}
          placeholder="Search by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="form-input"
          style={{ minWidth: 150 }}
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
        >
          <option value="">All risk levels</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
        </select>
        <select
          className="form-input"
          style={{ minWidth: 140 }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      {loading && <p className="empty-state">Loading…</p>}
      {error   && <p className="page-sub" style={{ color: "#B91C1C" }}>{error}</p>}

      {!loading && !error && (
        <div className="dashboard-table-wrap">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Age</th>
                <th>School</th>
                <th>Category</th>
                <th>Interests</th>
                <th>Status</th>
                <th>Risk</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="cell-muted" style={{ textAlign: "center", padding: "24px" }}>
                    No youth profiles found.
                  </td>
                </tr>
              )}
              {filtered.map((y) => {
                const meta = RISK_META[y.latest_risk_level] ?? RISK_META.LOW;
                return (
                  <tr key={y.id} className="dashboard-row">
                    <td>
                      <div className="cell-user">
                        <div className="case-avatar case-avatar--sm">{y.full_name[0]}</div>
                        <span>{y.full_name}</span>
                      </div>
                    </td>
                    <td className="cell-muted">{y.age ?? "—"}</td>
                    <td className="cell-muted">{y.school || "—"}</td>
                    <td className="cell-muted">{y.category || "—"}</td>
                    <td className="cell-summary" style={{ maxWidth: 180 }}>
                      {y.interests || "—"}
                    </td>
                    <td className="cell-muted">{y.status}</td>
                    <td>
                      <span className="risk-badge" style={{ background: meta.bg, color: meta.text }}>
                        <span className="risk-dot" style={{ background: meta.dot }} />
                        {meta.label}
                      </span>
                    </td>
                    <td>
                      <Link
                        to={`/sw/child-catalog?child=${y.id}`}
                        className="btn btn--outline btn--sm"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
