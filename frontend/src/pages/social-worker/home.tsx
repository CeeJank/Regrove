import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCases } from '../../contexts/CasesContext';
import { useEvents } from '../../contexts/EventsContext';
import { useReferrals } from '../../contexts/ReferralsContext';
import { RiskLevel } from '../../types';

const RISK_COLORS: Record<RiskLevel, { bg: string; text: string; label: string }> = {
  high:   { bg: '#FEE2E2', text: '#DC2626', label: 'High Risk' },
  medium: { bg: '#FEF9C3', text: '#CA8A04', label: 'Medium Risk' },
  low:    { bg: '#DCFCE7', text: '#16A34A', label: 'Low Risk' },
};

const SWHome: React.FC = () => {
  const { user } = useAuth();
  const { cases, loading } = useCases();
  const { getEventsForUser } = useEvents();
  const { getIncomingReferrals } = useReferrals();

  const confirmedEvents = user ? getEventsForUser(user.id).filter(e => e.status === 'confirmed') : [];
  const pendingReferrals = user ? getIncomingReferrals(user.id).filter(r => r.status === 'pending') : [];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">{greeting}, {user?.fullName?.split(' ')[0]} 👋</h1>
          <p className="page-sub">Here is a snapshot of your caseload today.</p>
        </div>
        <Link to="/sw/dashboard" className="btn btn--primary">Full Dashboard</Link>
      </div>

      <div className="stat-cards">
        <div className="stat-card">
          <p className="stat-label">Active Cases</p>
          <p className="stat-value">{cases.length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Confirmed Events</p>
          <p className="stat-value">{confirmedEvents.length}</p>
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
        {loading && <p className="page-sub">Loading cases…</p>}
        {!loading && cases.length === 0 && (
          <p className="page-sub">No active cases assigned to you.</p>
        )}
        {cases.map(c => {
          const risk = RISK_COLORS[c.riskLevel];
          return (
            <Link key={c.id} to="/sw/active-cases" className="case-row">
              {/* Avatar initial comes from the real name returned by the API */}
              <div className="case-avatar">{c.name[0]}</div>
              <div className="case-info">
                <p className="case-name">{c.name}</p>
                <p className="case-updated">Updated {new Date(c.lastUpdated).toLocaleDateString()}</p>
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
