import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ChildList from "../components/children/ChildList";
import type { ChildProfileItem } from "../components/children/ChildCard";
import { fetchRecentChildren } from "../services/dashboardService";

export default function DashboardPage() {
  const [items, setItems] = useState<ChildProfileItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetchRecentChildren()
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

        <ChildList children={items} />
      </section>
    </main>
  );
}
