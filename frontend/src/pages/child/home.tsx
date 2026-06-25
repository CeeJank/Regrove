import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useEvents } from '../../contexts/EventsContext';
import { useCases } from '../../contexts/CasesContext';

/** Returns a Singapore-time-aware greeting */
const getSgGreeting = () => {
  const sgHour = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'Asia/Singapore' })
  ).getHours();
  if (sgHour >= 5  && sgHour < 12) return 'Good morning';
  if (sgHour >= 12 && sgHour < 17) return 'Good afternoon';
  if (sgHour >= 17 && sgHour < 21) return 'Good evening';
  return 'Good night';
};

const ChildHome: React.FC = () => {
  const { user }  = useAuth();
  const { getEventsForUser } = useEvents();
  const { allWorkers, updateRecentInteraction } = useCases();
  const navigate  = useNavigate();

  const greeting  = getSgGreeting();
  const upcomingEvents = user
    ? getEventsForUser(user.id).filter(e => e.status === 'confirmed').slice(0, 3)
    : [];

  const workerEntries = Object.entries(allWorkers).slice(0, 10);

  return (
    <div className="page-content">
      {/* ── Hero / Greeting ── */}
      <div className="child-hero">
        <div className="child-hero-text">
          <h1 className="page-title">{greeting}, {user?.fullName?.split(' ')[0]} 🌱</h1>
          <p className="page-sub">You are not alone. Your support team is here for you.</p>
        </div>
        <div className="child-hero-art">🌿</div>
      </div>

      <div className="child-quick-nav">
        <Link to="/child/check-ins" className="child-nav-card child-nav-card--teal">
          <span className="child-nav-emoji">😊</span>
          <p className="child-nav-label">Daily Check-In</p>
          <p className="child-nav-sub">How are you feeling today?</p>
        </Link>
        <Link to="/child/messages" className="child-nav-card child-nav-card--blue">
          <span className="child-nav-emoji">💬</span>
          <p className="child-nav-label">Messages</p>
          <p className="child-nav-sub">Chat with your social worker</p>
        </Link>
        <Link to="/child/calendar" className="child-nav-card child-nav-card--purple">
          <span className="child-nav-emoji">📅</span>
          <p className="child-nav-label">Calendar</p>
          <p className="child-nav-sub">Your upcoming sessions</p>
        </Link>
        <Link to="/child/chatbot" className="child-nav-card child-nav-card--green">
          <span className="child-nav-emoji">✨</span>
          <p className="child-nav-label">My Companion</p>
          <p className="child-nav-sub">Talk to your AI companion</p>
        </Link>
      </div>

      {/* ── Your Social Workers ── */}
      <div className="section-header" style={{ marginTop: 24, marginBottom: 12 }}>
        <h2 className="section-title" style={{ marginBottom: 0 }}>Your Social Workers</h2>
      </div>
      <div className="case-list">
        {workerEntries.map(([id, worker]) => (
          <div
            key={id}
            className="case-row"
            style={{ cursor: 'pointer' }}
            onClick={() => {
              if (user) updateRecentInteraction(user.id, id);
              navigate('/child/messages');
            }}
          >
            <div className="case-avatar" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
              {worker.name[0]}
            </div>
            <div className="case-info">
              <p className="case-name">{worker.name}</p>
              <p className="case-updated">Social Worker</p>
            </div>
            <button className="btn btn--outline btn--sm">Message</button>
          </div>
        ))}
      </div>

      {/* ── Upcoming Sessions ── */}
      {upcomingEvents.length > 0 && (
        <div className="child-section" style={{ marginTop: 24 }}>
          <h2 className="section-title">Upcoming Sessions</h2>
          {upcomingEvents.map(e => (
            <div key={e.id} className="event-chip">
              <span className="event-chip-icon">📅</span>
              <div>
                <p className="event-chip-title">{e.title}</p>
                <p className="event-chip-time">{e.date} · {e.startTime}–{e.endTime}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="child-affirmation">
        <p>"Every day is a chance to grow a little more. You are doing great."</p>
      </div>
    </div>
  );
};
export default ChildHome;
