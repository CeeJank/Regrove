import React, { useState } from 'react';
import { useCases } from '../../contexts/CasesContext';
import { RiskLevel } from '../../types';

const MOCK_CHILDREN: Record<string, string> = {
  'child-1': 'Alex Rivera', 'child-2': 'Jamie Tan', 'child-3': 'Sam Lim',
};
const RISK_META: Record<RiskLevel, { bg: string; text: string; label: string }> = {
  high:   { bg: '#FEE2E2', text: '#B91C1C', label: 'High Risk' },
  medium: { bg: '#FEF9C3', text: '#92400E', label: 'Medium Risk' },
  low:    { bg: '#DCFCE7', text: '#166534', label: 'Low Risk' },
};
const MOODEMOJI = ['','😄','🙂','😐','😔','😢'];

const ActiveCases: React.FC = () => {
  const { cases, updateRiskLevel, updateNotes, removeCase } = useCases();
  const [selected, setSelected] = useState(cases[0]?.id ?? '');
  const [editingNotes, setEditingNotes] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');
  const [notification, setNotification] = useState('');
  const [confirmRemove, setConfirmRemove] = useState(false);

  const activeCase = cases.find(c => c.id === selected);

  const notify = (msg: string) => { setNotification(msg); setTimeout(() => setNotification(''), 3000); };

  const handleRiskChange = (level: RiskLevel) => {
    if (!activeCase) return;
    updateRiskLevel(activeCase.id, level);
    notify(`Risk level updated to ${level}.`);
  };

  const handleSaveNotes = () => {
    if (!activeCase) return;
    updateNotes(activeCase.id, noteDraft);
    setEditingNotes(false);
    notify('Notes saved.');
  };

  const handleRemove = () => {
    if (!activeCase) return;
    removeCase(activeCase.id);
    setSelected(cases.find(c => c.id !== activeCase.id)?.id ?? '');
    setConfirmRemove(false);
    notify('Case removed.');
  };

  return (
    <div className="active-cases-layout">
      <aside className="cases-sidebar">
        <h2 className="cases-sidebar-title">Active Cases</h2>
        {cases.map(c => {
          const meta = RISK_META[c.riskLevel];
          return (
            <div
              key={c.id}
              className={`cases-row${selected === c.id ? ' cases-row--active' : ''}`}
              onClick={() => { setSelected(c.id); setEditingNotes(false); }}
            >
              <div className="case-avatar">{MOCK_CHILDREN[c.childId]?.[0] ?? '?'}</div>
              <div className="case-info">
                <p className="case-name">{MOCK_CHILDREN[c.childId] ?? c.childId}</p>
                <span className="risk-badge risk-badge--sm" style={{ background: meta.bg, color: meta.text }}>{meta.label}</span>
              </div>
            </div>
          );
        })}
        {cases.length === 0 && <p className="empty-state">No active cases.</p>}
      </aside>

      <div className="case-detail">
        {notification && <div className="alert alert--info">{notification}</div>}
        {!activeCase ? (
          <p className="empty-state">Select a case to view details.</p>
        ) : (
          <>
            <div className="page-header">
              <div>
                <h1 className="page-title">{MOCK_CHILDREN[activeCase.childId] ?? activeCase.childId}</h1>
                <p className="page-sub">Case ID: <span className="mono">{activeCase.id}</span></p>
              </div>
              <button className="btn btn--danger" onClick={() => setConfirmRemove(true)}>Remove Case</button>
            </div>

            <div className="case-section">
              <h3 className="case-section-title">Risk Level</h3>
              <div className="risk-selector">
                {(['low', 'medium', 'high'] as RiskLevel[]).map(lvl => (
                  <button
                    key={lvl}
                    className={`risk-btn risk-btn--${lvl}${activeCase.riskLevel === lvl ? ' risk-btn--selected' : ''}`}
                    onClick={() => handleRiskChange(lvl)}
                  >
                    {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="case-section">
              <div className="case-section-header">
                <h3 className="case-section-title">AI Summary</h3>
              </div>
              <div className="ai-summary-box">{activeCase.aiSummary || 'No AI summary available yet.'}</div>
            </div>

            <div className="case-section">
              <div className="case-section-header">
                <h3 className="case-section-title">Recent Check-Ins</h3>
              </div>
              {activeCase.checkIns.length === 0 ? (
                <p className="empty-state">No check-ins recorded yet.</p>
              ) : (
                <div className="checkin-list">
                  {activeCase.checkIns.slice(-5).reverse().map(ci => (
                    <div key={ci.id} className="checkin-row">
                      <span className="checkin-emoji">{MOODEMOJI[ci.mood]}</span>
                      <div>
                        <p className="checkin-events">{ci.events}</p>
                        <p className="checkin-date">{new Date(ci.timestamp).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="case-section">
              <div className="case-section-header">
                <h3 className="case-section-title">Notes</h3>
                {!editingNotes && (
                  <button className="btn btn--outline btn--sm" onClick={() => { setNoteDraft(activeCase.notes); setEditingNotes(true); }}>Edit</button>
                )}
              </div>
              {editingNotes ? (
                <>
                  <textarea
                    className="form-input notes-textarea"
                    value={noteDraft}
                    onChange={e => setNoteDraft(e.target.value)}
                    rows={5}
                  />
                  <div className="modal-actions" style={{ marginTop: '0.75rem' }}>
                    <button className="btn btn--outline btn--sm" onClick={() => setEditingNotes(false)}>Cancel</button>
                    <button className="btn btn--primary btn--sm" onClick={handleSaveNotes}>Save Notes</button>
                  </div>
                </>
              ) : (
                <p className="notes-display">{activeCase.notes || 'No notes yet.'}</p>
              )}
            </div>
          </>
        )}
      </div>

      {confirmRemove && (
        <div className="modal-overlay" onClick={() => setConfirmRemove(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Remove Case</h2>
            <p>Are you sure you want to remove <strong>{MOCK_CHILDREN[activeCase?.childId ?? ''] ?? 'this youth'}</strong> from your caseload? This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn btn--outline" onClick={() => setConfirmRemove(false)}>Cancel</button>
              <button className="btn btn--danger" onClick={handleRemove}>Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ActiveCases;