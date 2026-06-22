import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCases } from '../../contexts/CasesContext';
import { useEvents } from '../../contexts/EventsContext';
import { useReferrals } from '../../contexts/ReferralsContext';
import { RiskLevel } from '../../types';

const RISK_COLORS: Record<RiskLevel, { bg: string; text: string; label: string }> = {
  critical: { bg: '#EDE9FE', text: '#6D28D9', label: 'Critical' },
  high:     { bg: '#FEE2E2', text: '#DC2626', label: 'High Risk' },
  medium:   { bg: '#FEF9C3', text: '#CA8A04', label: 'Medium Risk' },
  low:      { bg: '#DCFCE7', text: '#16A34A', label: 'Low Risk' },
};

const SWHome: React.FC = () => {
  const { user } = useAuth();
  const { cases, loading: casesLoading } = useCases();
  
  // FIX: Destructure the reactive database array and state directly from the new context layout
  const { events, loading: eventsLoading } = useEvents();
  const { getIncomingReferrals } = useReferrals();

  // Get current ISO string date component (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];

  // FIX: Explicitly type-safe filters matching database uppercase strings
  const upcomingEvents = events.filter(e => 
    e.status.toUpperCase() === 'CONFIRMED' && e.date >= todayStr
  );

  const pendingEvents = events.filter(e => 
    e.status.toUpperCase() === 'PENDING'
  );

  const pendingReferrals = user ? getIncomingReferrals(user.id).filter(r => r.status === 'pending') : [];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const isGlobalLoading = casesLoading || eventsLoading;

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">{greeting}, {user?.fullName?.split(' ')[0]} 👋</h1>
          <p className="page-sub">Here is a snapshot of your caseload today.</p>
        </div>
        <Link to="/sw/dashboard" className="btn btn--primary">Full Dashboard</Link>
      </div>

      {/* REFACTORED STAT CARDS WITH THE NEW METRICS */}
      <div className="stat-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div className="stat-card">
          <p className="stat-label">Active Cases</p>
          <p className="stat-value">{cases.length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Upcoming Sessions</p>
          <p className="stat-value" style={{ color: '#16A34A' }}>{upcomingEvents.length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Pending Invites</p>
          <p className="stat-value" style={{ color: '#2563EB' }}>{pendingEvents.length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Pending Referrals</p>
          <p className="stat-value stat-value--alert">{pendingReferrals.length}</p>
        </div>
      </div>

      <div className="section-header">
        <h2 className="section-title">Your Cases</h2>
        <Link to="/sw/dashboard" className="section-link">View all</Link>
      </div>

      <div className="case-list">
        {isGlobalLoading && <p className="page-sub">Loading live system workspace records…</p>}
        {!isGlobalLoading && cases.length === 0 && (
          <p className="page-sub">No active cases assigned to you.</p>
        )}
        {!isGlobalLoading && cases.map(c => {
          const risk = RISK_COLORS[c.riskLevel];
          return (
            <Link key={c.id} to="/sw/active-cases" state={{ selectedId: c.id }} className="case-row">
              <div className="case-avatar">{c.name ? c.name[0] : '?'}</div>
              <div className="case-info">
                <p className="case-name">{c.name}</p>
                <p className="case-updated">Updated {c.lastUpdated ? new Date(c.lastUpdated).toLocaleDateString() : '—'}</p>
              </div>
              <span className="risk-badge" style={{ background: risk.bg, color: risk.text }}>
                {risk.label}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="quick-nav">
        {[
          { to: '/sw/calendar', emoji: '📅', label: 'Calendar' },
          { to: '/sw/messages', emoji: '💬', label: 'Messages' },
          { to: '/sw/referrals', emoji: '🔄', label: 'Referrals' },
          { to: '/sw/active-cases', emoji: '📋', label: 'Active Cases' },
        ].map(item => (
          <Link key={item.to} to={item.to} className="quick-nav-card">
            <span className="quick-nav-emoji">{item.emoji}</span>
            <span className="quick-nav-label">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SWHome;