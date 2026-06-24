import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCases } from '../../contexts/CasesContext';
import { useEvents } from '../../contexts/EventsContext';
import { RiskLevel } from '../../types';
import ChildSearchBar from '../../components/shared/ChildSearchBar';

const RISK_COLORS: Record<RiskLevel, { bg: string; text: string; label: string; dot: string }> = {
  critical: { bg: '#F3E8FF', text: '#7C3AED', label: 'Critical',   dot: '#A855F7' },
  high:     { bg: '#FEE2E2', text: '#DC2626', label: 'High Risk',  dot: '#EF4444' },
  medium:   { bg: '#FEF9C3', text: '#CA8A04', label: 'Medium Risk',dot: '#EAB308' },
  low:      { bg: '#DCFCE7', text: '#16A34A', label: 'Low Risk',   dot: '#22C55E' },
};

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

const SWHome: React.FC = () => {
  const { user } = useAuth();
  const { cases, allChildren, getRecentChildren, updateRecentInteraction } = useCases();
  const { getEventsForUser } = useEvents();
  const navigate = useNavigate();

  const greeting = getSgGreeting();

  const recentChildIds = user ? getRecentChildren(user.id).slice(0, 10) : [];
  const recentCases = recentChildIds
    .map(cid => cases.find(c => c.childId === cid))
    .filter(Boolean) as typeof cases;

  const confirmedEvents = user
    ? getEventsForUser(user.id).filter(e => e.status === 'confirmed')
    : [];

  const handleChildSelect = (childId: string) => {
    if (user) updateRecentInteraction(user.id, childId);
    navigate('/sw/active-cases');
  };

  return (
    <div className="page-content">
      {/* ── Header: greeting only, no "Full Dashboard" button ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{greeting}, {user?.fullName?.split(' ')[0]} 👋</h1>
          <p className="page-sub">Here is a snapshot of your caseload today.</p>
        </div>
      </div>

      {/* ── Stat cards: Confirmed Events only (no active cases count, no pending referrals) ── */}
      <div className="stat-cards">
        <div className="stat-card">
          <p className="stat-label">Confirmed Events</p>
          <p className="stat-value">{confirmedEvents.length}</p>
        </div>
      </div>

      {/* ── Recent Cases (no "View all" link, search still present) ── */}
      <div className="section-header" style={{ marginBottom: 12 }}>
        <h2 className="section-title" style={{ marginBottom: 0 }}>Recent Cases</h2>
      </div>
      <ChildSearchBar onSelect={handleChildSelect} placeholder="Search for any child..." />

      <div className="case-list" style={{ marginTop: 14 }}>
        {recentCases.length === 0 && (
          <p className="empty-state">No recent interactions yet. Search above to find a child.</p>
        )}
        {recentCases.slice(0, 10).map(c => {
          const child = allChildren[c.childId];
          const risk  = RISK_COLORS[c.riskLevel];
          return (
            <Link
              key={c.id}
              to="/sw/active-cases"
              className="case-row"
              onClick={() => user && updateRecentInteraction(user.id, c.childId)}
            >
              <div className="case-avatar">{child?.name?.[0] ?? '?'}</div>
              <div className="case-info">
                <p className="case-name">{child?.name ?? c.childId}</p>
                <p className="case-updated">Updated {new Date(c.lastUpdated).toLocaleDateString()}</p>
              </div>
              <span className="risk-badge" style={{ background: risk.bg, color: risk.text }}>
                <span className="risk-dot" style={{ background: risk.dot }} />{risk.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default SWHome;