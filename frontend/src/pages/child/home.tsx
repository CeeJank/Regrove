import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useEvents } from '../../contexts/EventsContext';

const ChildHome: React.FC = () => {
  const { user } = useAuth();
  const { getEventsForUser } = useEvents();
  const upcomingEvents = user ? getEventsForUser(user.id).filter(e => e.status === 'confirmed').slice(0, 3) : [];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const isAfterHours = hour >= 18 || hour < 7;

  return (
    <div className="page-content">
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
        <Link to="/child/chatbot" className={`child-nav-card child-nav-card--green${!isAfterHours ? ' child-nav-card--disabled' : ''}`}>
          <span className="child-nav-emoji">🤖</span>
          <p className="child-nav-label">My Companion</p>
          <p className="child-nav-sub">{isAfterHours ? 'Available now!' : 'Available 6pm – 7am'}</p>
        </Link>
        <Link to="/child/calendar" className="child-nav-card child-nav-card--purple">
          <span className="child-nav-emoji">📅</span>
          <p className="child-nav-label">Calendar</p>
          <p className="child-nav-sub">Your upcoming sessions</p>
        </Link>
      </div>

      {upcomingEvents.length > 0 && (
        <div className="child-section">
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