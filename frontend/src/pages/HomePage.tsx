import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="card">
        <p className="eyebrow">Regrove</p>
        <h1>Session tools</h1>
        <p className="lead">
          Start with the recording page, then grow the rest of the worker
          dashboard from here.
        </p>

        <nav className="nav-links">
          <Link to="/dashboard" className="secondary-btn">
            Open dashboard mock view
          </Link>
        </nav>
      </section>
    </main>
  );
}
