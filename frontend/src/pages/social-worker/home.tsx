import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { fetchRecentYouthForWorker, type RecentYouthEntry } from '../../services/youthService';

const RISK_META: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  CRITICAL: { bg: '#F5F3FF', text: '#6D28D9', dot: '#7C3AED', label: 'Critical' },
  HIGH:     { bg: '#FEF2F2', text: '#B91C1C', dot: '#EF4444', label: 'High'     },
  MEDIUM:   { bg: '#FEFCE8', text: '#92400E', dot: '#EAB308', label: 'Medium'   },
  LOW:      { bg: '#F0FDF4', text: '#166534', dot: '#22C55E', label: 'Low'      },
};

const getSgGreeting = () => {
  const hour = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'Asia/Singapore' })
  ).getHours();
  if (hour >= 5  && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 21) return 'Good evening';
  return 'Good night';
};

const timeAgo = (iso: string) => {
  const diff  = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins  < 1)  return 'just now';
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  < 7)  return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-SG', { day: 'numeric', month: 'short' });
};

const SWHome: React.FC = () => {
  const { user } = useAuth();
  const [recentYouth, setRecentYouth] = useState<RecentYouthEntry[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  useEffect(() => {
    fetchRecentYouthForWorker()
      .then(setRecentYouth)
      .catch(() => setError('Could not load recent sessions.'))
      .finally(() => setLoading(false));
  }, []);

  const activeCount    = recentYouth.filter(y => y.status === 'ACTIVE').length;
  const highRiskCount  = recentYouth.filter(y => y.riskLevel === 'HIGH' || y.riskLevel === 'CRITICAL').length;

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">{getSgGreeting()}, {user?.fullName?.split(' ')[0]} 👋</h1>
          <p className="page-sub">Here is a snapshot of your caseload today.</p>
        </div>
        <Link to="/sw/active-cases" className="btn btn--primary btn--sm">Open Cases</Link>
      </div>

      <div className="stat-cards">
        <div className="stat-card stat-card--green">
          <p className="stat-label">Recent Sessions</p>
          <p className="stat-value">{loading ? '—' : recentYouth.length}</p>
        </div>
        <div className="stat-card stat-card--red">
          <p className="stat-label">High / Critical</p>
          <p className="stat-value">{loading ? '—' : highRiskCount}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Active Cases</p>
          <p className="stat-value">{loading ? '—' : activeCount}</p>
        </div>
      </div>

      <div className="section-header">
        <h2 className="section-title" style={{ marginBottom: 0 }}>Recent Sessions</h2>
        <Link to="/sw/child-catalog" className="btn btn--outline btn--sm">View all youth</Link>
      </div>

      {error && <p className="page-sub" style={{ color: '#B91C1C', marginBottom: 16 }}>{error}</p>}

      <div className="case-list">
        {loading && <p className="empty-state">Loading recent sessions…</p>}
        {!loading && !error && recentYouth.length === 0 && (
          <p className="empty-state">No sessions recorded yet.</p>
        )}
        {recentYouth.map(y => {
          const risk = RISK_META[y.riskLevel] ?? RISK_META.LOW;
          return (
            <Link key={y.youthId} to="/sw/active-cases" className="case-row">
              <div className="case-avatar">{y.name[0]}</div>
              <div className="case-info">
                <p className="case-name">{y.name}</p>
                <p className="case-updated">Last session {timeAgo(y.lastSessionAt)}</p>
              </div>
              <span className="risk-badge" style={{ background: risk.bg, color: risk.text }}>
                <span className="risk-dot" style={{ background: risk.dot }} />
                {risk.label}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="quick-nav">
        {[
          { to: '/sw/calendar',     emoji: '📅', label: 'Calendar'     },
          { to: '/sw/messages',     emoji: '💬', label: 'Messages'     },
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
