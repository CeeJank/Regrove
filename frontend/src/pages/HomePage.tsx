import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="card">
        <p className="eyebrow">Regrove</p>
        <h1>SCS Youth Support Platform</h1>
        <p className="lead">
          Manage youth profiles, sessions, and worker assignments from one place.
        </p>

        <nav className="nav-links">
          <Link to="/youth" className="primary-btn">
            Youth Catalogue
          </Link>
          <Link to="/youth/create" className="secondary-btn">
            + New Youth Profile
          </Link>
          <Link to="/dashboard" className="secondary-btn">
            Dashboard
          </Link>
        </nav>
      </section>
    </main>
  );
}
