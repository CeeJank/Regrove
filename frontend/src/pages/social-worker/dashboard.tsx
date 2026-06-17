import React from 'react';
import { useCases } from '../../contexts/CasesContext';
import { RiskLevel } from '../../types';

const MOCK_CHILDREN: Record<string, string> = {
  'child-1': 'Alex Rivera', 'child-2': 'Jamie Tan', 'child-3': 'Sam Lim',
};
const RISK_META: Record<RiskLevel, { bg: string; text: string; dot: string; label: string }> = {
  high:   { bg: '#FEF2F2', text: '#B91C1C', dot: '#EF4444', label: 'High' },
  medium: { bg: '#FEFCE8', text: '#92400E', dot: '#EAB308', label: 'Medium' },
  low:    { bg: '#F0FDF4', text: '#166534', dot: '#22C55E', label: 'Low' },
};

const Dashboard: React.FC = () => {
  const { cases } = useCases();
  const high = cases.filter(c => c.riskLevel === 'high').length;
  const medium = cases.filter(c => c.riskLevel === 'medium').length;
  const low = cases.filter(c => c.riskLevel === 'low').length;

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">Full overview of all active youth under your care.</p>
        </div>
      </div>
      <div className="stat-cards">
        <div className="stat-card stat-card--red"><p className="stat-label">High Risk</p><p className="stat-value">{high}</p></div>
        <div className="stat-card stat-card--yellow"><p className="stat-label">Medium Risk</p><p className="stat-value">{medium}</p></div>
        <div className="stat-card stat-card--green"><p className="stat-label">Low Risk</p><p className="stat-value">{low}</p></div>
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
            {cases.map(c => {
              const meta = RISK_META[c.riskLevel];
              return (
                <tr key={c.id} className="dashboard-row">
                  <td>
                    <div className="cell-user">
                      <div className="case-avatar case-avatar--sm">{MOCK_CHILDREN[c.childId]?.[0] ?? '?'}</div>
                      <span>{MOCK_CHILDREN[c.childId] ?? c.childId}</span>
                    </div>
                  </td>
                  <td>
                    <span className="risk-badge" style={{ background: meta.bg, color: meta.text }}>
                      <span className="risk-dot" style={{ background: meta.dot }} />
                      {meta.label}
                    </span>
                  </td>
                  <td className="cell-muted">{new Date(c.lastUpdated).toLocaleDateString()}</td>
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