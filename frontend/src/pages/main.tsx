import React from 'react';
import { Link } from 'react-router-dom';

const MainPage: React.FC = () => {
  return (
    <div className="main-landing">
      <div className="landing-bg-blur landing-bg-blur--1" />
      <div className="landing-bg-blur landing-bg-blur--2" />

      <header className="landing-header">
        <div className="landing-logo">
          <span className="logo-leaf">🌿</span>
          <span className="logo-text">Regrove</span>
        </div>
      </header>

      <section className="landing-hero">
        <div className="hero-eyebrow">A safe space to grow</div>
        <h1 className="hero-headline">
          Every young person deserves<br />
          <span className="hero-accent">someone in their corner.</span>
        </h1>
        <p className="hero-sub">
          Regrove connects youth with dedicated social workers — building bridges
          through daily check-ins, honest conversations, and trusted support.
        </p>
        <div className="hero-cta-group">
          <Link to="/login" className="btn btn--primary btn--lg">Sign in</Link>
          <Link to="/register" className="btn btn--outline btn--lg">Create account</Link>
        </div>
      </section>

      <section className="landing-features">
        <div className="feature-card">
          <div className="feature-icon">🛡️</div>
          <h3>Safe &amp; Private</h3>
          <p>Every conversation is private and only accessible to your assigned social worker.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🌱</div>
          <h3>Daily Check-Ins</h3>
          <p>A gentle daily prompt to share how you're feeling — no pressure, just presence.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🤝</div>
          <h3>Always Supported</h3>
          <p>Your social worker tracks your progress and is always ready to step in when needed.</p>
        </div>
      </section>
    </div>
  );
};

export default MainPage;