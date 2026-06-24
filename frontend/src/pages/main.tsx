import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../images/logo/Regrove_Logo.png';

import footerImage1 from '../images/footer/Footer1.png';

const MainPage: React.FC = () => {
  return (
    <div className="main-landing"
    style={{ 
        backgroundColor: '#0574cc'
      }}>

      <header className="landing-header"
      style={{ 
        backgroundColor: '#ffffff'
      }}>
        <div className="landing-logo">
          <img 
            src={logo} // Your imported logo
            alt="Regrove logo" 
            style={{ 
            height: '100px',      // Adjust height here
            width: 'auto',       // Keeps proportions
            borderRadius: '25%',
            display: 'inline-block',
            verticalAlign: 'middle',
            marginRight: '8px'   // Space between image and text
            }} 
          />
        </div>
      </header>

      <section className="landing-hero"
      style={{ 
        backgroundColor: '#ffffff'
      }}>
        <div className="hero-eyebrow">The safe space to grow</div>
        <h1 className="hero-headline">
          Everyone deserves<br />
          <span className="hero-accent">someone in their corner.</span>
        </h1>
        <p className="hero-sub">
          Connecting youths with dedicated social workers. Building bridges
          through daily check-ins, honest conversations, and trusted support.
        </p>
        <div className="hero-cta-group">
          <Link to="/login" className="btn btn--primary btn--lg">Sign in</Link>
          <Link to="/register" className="btn btn--outline btn--lg">Create account</Link>
        </div>
      </section>

      <section className="landing-features"
      style={{ 
        backgroundColor: '#ffffff'
      }}>
        <div className="feature-card">
          <div className="feature-icon">💖</div>
          <h3>Trust</h3>
          <p>Every conversation is private and only accessible to your assigned social worker.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🌱</div>
          <h3>Growth</h3>
          <p>A gentle daily prompt to share how you're feeling. No pressure, just presence.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🤝</div>
          <h3>Support</h3>
          <p>Your social worker tracks your progress and is always ready to step in when needed.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">✨</div>
          <h3>Hope</h3>
          <p>Regrow, Redo & Regrove. Step by step. Hand in hand. Together we will succeed!</p>
        </div>
      </section>
        
      <footer>
        <img 
          src={footerImage1} 
          alt="Footer" 
          style={{ 
            maxWidth: '100%',   // Prevents overflow on small screens
            height: 'auto'      // Keeps the original aspect ratio and size
          }} 
        />
      </footer>
    </div>
  );
};

export default MainPage;