import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <main className="home-screen">
      <header className="brand-header">
        <Link to="/" className="brand-mark">
          <span>🌿</span>
          <strong>Regrove</strong>
        </Link>
      </header>

      <section className="home-hero">
        <p className="hero-pill">A safe space to grow</p>
        <h1>
          Every young person deserves
          <span> someone in their corner.</span>
        </h1>
        <p className="lead">
          Regrove connects youth with dedicated social workers through honest
          conversations, after-hours AI support, and trusted handover.
        </p>

        <nav className="home-actions">
          <Link to="/dashboard" className="primary-btn">
            Open dashboard
          </Link>
          <Link to="/worker/handover" className="secondary-btn">
            Worker handover
          </Link>
          <Link to="/youth/chat/1" className="secondary-btn">
            Youth chat demo
          </Link>
          <Link to="/testing" className="secondary-btn">
            API console
          </Link>
        </nav>
      </section>

      <section className="home-flow">
        <article>
          <strong>🛡️</strong>
          <h2>Safe & Private</h2>
          <p>Every conversation is saved securely for the assigned support team.</p>
        </article>
        <article>
          <strong>🌱</strong>
          <h2>After-Hours Care</h2>
          <p>AI gives a calm holding response when workers are unavailable.</p>
        </article>
        <article>
          <strong>🤝</strong>
          <h2>Always Supported</h2>
          <p>Workers receive handover notes and summaries for follow-up.</p>
        </article>
      </section>
    </main>
  );
}
