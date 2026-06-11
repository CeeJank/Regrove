import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchRecentChildren } from "../services/dashboardService";

interface ChildProfileItem {
  childId: number;
  workerId: number;
  name: string;
  age: number;
  riskLevel: string;
  lastSessionDate: string;
  status: string;
}

export default function DashboardPage() {
  const [items, setItems] = useState<ChildProfileItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetchRecentChildren(1)
      .then((data) => {
        if (isMounted) {
          setItems(data.items || []);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError("Unable to load the mock child profile list.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="page-shell">
      <section className="card">
        <p className="eyebrow">Worker dashboard</p>
        <h1>Recent child profile data</h1>
        <p className="lead">
          This is a mock route based on worker ID so the dashboard can grow
          without touching the database yet.
        </p>

        <nav className="nav-links" style={{ marginBottom: 18 }}>
          <Link to="/" className="secondary-btn">
            Back home
          </Link>
        </nav>

        {loading && <p className="status">Loading mock data…</p>}
        {error && <p className="error-box">{error}</p>}

        {!loading && !error && items.length === 0 && (
          <p className="status">
            No child records were returned for this worker.
          </p>
        )}

        <div className="result-box">
          {items.map((item) => (
            <article
              key={item.childId}
              style={{
                border: "1px solid var(--border)",
                borderRadius: 14,
                padding: 14,
                marginBottom: 12,
                background: "var(--accent-bg)",
              }}
            >
              <h2 style={{ margin: "0 0 4px" }}>{item.name}</h2>
              <p style={{ margin: "0 0 8px", color: "var(--text-h)" }}>
                Age {item.age} • Risk {item.riskLevel} • Status {item.status}
              </p>
              <p style={{ margin: 0, color: "var(--text-h)" }}>
                Last session: {item.lastSessionDate}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
