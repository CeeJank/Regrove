import React from 'react';
import { useCases } from '../../contexts/CasesContext';
import { RiskLevel } from '../../types';

const RISK_META: Record<RiskLevel, { bg: string; text: string; dot: string; label: string }> = {
  critical: { bg: '#F5F3FF', text: '#6D28D9', dot: '#7C3AED', label: 'Critical' },
  high:     { bg: '#FEF2F2', text: '#B91C1C', dot: '#EF4444', label: 'High' },
  medium:   { bg: '#FEFCE8', text: '#92400E', dot: '#EAB308', label: 'Medium' },
  low:      { bg: '#F0FDF4', text: '#166534', dot: '#22C55E', label: 'Low' },
};

const Dashboard: React.FC = () => {
  const { cases, stats, loading, error } = useCases();

  if (loading) {
    return (
      <div className="page-content">
        <p className="page-sub">Loading dashboard…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-content">
        <p className="page-sub" style={{ color: '#B91C1C' }}>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">Full overview of all active youth under your care.</p>
        </div>
      </div>

      {/* 4 stat cards — critical gets its own purple card */}
      <div className="stat-cards">
        <div className="stat-card stat-card--purple">
          <p className="stat-label">Critical</p>
          <p className="stat-value">{stats?.criticalRisk ?? 0}</p>
        </div>
        <div className="stat-card stat-card--red">
          <p className="stat-label">High Risk</p>
          <p className="stat-value">{stats?.highRisk ?? 0}</p>
        </div>
        <div className="stat-card stat-card--yellow">
          <p className="stat-label">Medium Risk</p>
          <p className="stat-value">{stats?.mediumRisk ?? 0}</p>
        </div>
        <div className="stat-card stat-card--green">
          <p className="stat-label">Low Risk</p>
          <p className="stat-value">{stats?.lowRisk ?? 0}</p>
        </div>
      </div>

      <div className="dashboard-table-wrap">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Youth</th>
              <th>Risk Level</th>
              <th>Last Updated</th>
              <th>AI Summary</th>
            </tr>
          </thead>
          <tbody>
            {cases.length === 0 && (
              <tr>
                <td colSpan={4} className="cell-muted">No active cases found.</td>
              </tr>
            )}
            {cases.map(c => {
              const meta = RISK_META[c.riskLevel];
              return (
                <tr key={c.id} className="dashboard-row">
                  <td>
                    <div className="cell-user">
                      <div className="case-avatar case-avatar--sm">{c.name[0]}</div>
                      <span>{c.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="risk-badge" style={{ background: meta.bg, color: meta.text }}>
                      <span className="risk-dot" style={{ background: meta.dot }} />
                      {meta.label}
                    </span>
                  </td>
                  <td className="cell-muted">
                    {c.lastUpdated ? new Date(c.lastUpdated).toLocaleDateString() : '—'}
                  </td>
                  <td className="cell-summary">{c.aiSummary}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
