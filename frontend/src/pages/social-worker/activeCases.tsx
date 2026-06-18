import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useCases } from '../../contexts/CasesContext';
import { RiskLevel } from '../../types';

// Import our modular sub-components
import CheckInFeed from '../../components/child-profile/CheckInFeed';
import NotesHistory from '../../components/child-profile/NotesHistory';

const RISK_META: Record<RiskLevel, { bg: string; text: string; label: string }> = {
  critical: { bg: '#EDE9FE', text: '#6D28D9', label: 'Critical' },
  high:     { bg: '#FEE2E2', text: '#B91C1C', label: 'High Risk' },
  medium:   { bg: '#FEF9C3', text: '#92400E', label: 'Medium Risk' },
  low:      { bg: '#DCFCE7', text: '#166534', label: 'Low Risk' },
};

const ActiveCases: React.FC = () => {
  const location = useLocation();
  const { cases, updateRiskLevel, updateNotes, removeCase } = useCases();

  const incomingId = (location.state as { selectedId?: string } | null)?.selectedId;
  const [selected, setSelected] = useState(incomingId ?? cases[0]?.id ?? '');

  const [editingNotes, setEditingNotes] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');
  const [notification, setNotification] = useState('');
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [showOlderCheckIns, setShowOlderCheckIns] = useState(false);

  useEffect(() => {
    if (!selected && cases.length > 0) {
      setSelected(cases[0].id);
    }
  }, [cases, selected]);

  useEffect(() => {
    if (incomingId) setSelected(incomingId);
  }, [incomingId]);

  const activeCase = cases.find(c => c.id === selected);

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

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

  const handleSelect = (id: string) => {
    setSelected(id);
    setEditingNotes(false);
    setNoteDraft('');
    setShowOlderCheckIns(false);
  };

  // Helper logic to dynamically group check-ins by a rolling 7-day window baseline
  const getPartitionedCheckIns = () => {
    if (!activeCase || !activeCase.checkIns) return { recent: [], older: [] };
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Sort descending chronologically (Safeguard)
    const sorted = [...activeCase.checkIns].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const recent = sorted.filter(ci => new Date(ci.timestamp) >= sevenDaysAgo);
    const older = sorted.filter(ci => new Date(ci.timestamp) < sevenDaysAgo);

    return { recent, older };
  };

  const { recent, older } = getPartitionedCheckIns();

  return (
    <div className="active-cases-layout">
      {/* ── Sidebar ── */}
      <aside className="cases-sidebar">
        <h2 className="cases-sidebar-title">Active Cases</h2>
        {cases.length === 0 && <p className="empty-state">No active cases.</p>}
        {cases.map(c => {
          const meta = RISK_META[c.riskLevel];
          return (
            <div
              key={c.id}
              className={`cases-row${selected === c.id ? ' cases-row--active' : ''}`}
              onClick={() => handleSelect(c.id)}
            >
              <div className="case-avatar">{c.name[0]}</div>
              <div className="case-info">
                <p className="case-name">{c.name}</p>
                <span
                  className="risk-badge risk-badge--sm"
                  style={{ background: meta.bg, color: meta.text }}
                >
                  {meta.label}
                </span>
              </div>
            </div>
          );
        })}
      </aside>

      {/* ── Detail panel ── */}
      <div className="case-detail">
        {notification && <div className="alert alert--info">{notification}</div>}

        {!activeCase ? (
          <p className="empty-state">Select a case to view details.</p>
        ) : (
          <>
            {/* Header */}
            <div className="page-header">
              <div>
                <h1 className="page-title">{activeCase.name}</h1>
                <p className="page-sub">
                  {activeCase.school && <span>{activeCase.school} · </span>}
                  {activeCase.age && <span>Age {activeCase.age} · </span>}
                  {activeCase.category && <span>{activeCase.category}</span>}
                </p>
              </div>
              <button className="btn btn--danger" onClick={() => setConfirmRemove(true)}>
                Remove Case
              </button>
            </div>

            {/* Risk level selector */}
            <div className="case-section">
              <h3 className="case-section-title">Risk Level</h3>
              <div className="risk-selector">
                {(['low', 'medium', 'high', 'critical'] as RiskLevel[]).map(lvl => (
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

            {/* AI Summary */}
            <div className="case-section">
              <div className="case-section-header">
                <h3 className="case-section-title">AI Summary</h3>
              </div>
              <div className="ai-summary-box">
                {activeCase.aiSummary || 'No AI summary available yet.'}
              </div>
            </div>

            {/* Structured Check-Ins Timeline */}
            <div className="case-section">
              <div className="case-section-header">
                <h3 className="case-section-title">Check-Ins Timeline</h3>
              </div>
              
              {activeCase.checkIns.length === 0 ? (
                <p className="empty-state">No check-ins recorded yet.</p>
              ) : (
                <div className="checkin-timeline-stack" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  
                  {/* Category A: Active This Week */}
                  <div>
                    <h4 style={{ color: '#4F46E5', fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>
                      Active This Week ({recent.length})
                    </h4>
                    <CheckInFeed checkIns={recent} />
                  </div>

                  {/* Category B: Older History */}
                  {older.length > 0 && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <button 
                        className="btn btn--outline btn--sm"
                        style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                        onClick={() => setShowOlderCheckIns(!showOlderCheckIns)}
                      >
                        {showOlderCheckIns ? 'Hide Older Interactions' : `Show Older Interactions (${older.length})`}
                      </button>
                      
                      {showOlderCheckIns && (
                        <div style={{ marginTop: '0.75rem', borderTop: '1px dashed #E5E7EB', paddingTop: '0.5rem' }}>
                          <CheckInFeed checkIns={older} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Combined Notes Entry & Historical Logs */}
            <div className="case-section">
              <div className="case-section-header">
                <h3 className="case-section-title">Case Logging & Notes</h3>
                {!editingNotes && (
                  <button
                    className="btn btn--outline btn--sm"
                    onClick={() => {
                      setNoteDraft(''); // Open fresh for writing a new interaction row entry
                      setEditingNotes(true);
                    }}
                  >
                    + Add Entry Note
                  </button>
                )}
              </div>
              
              {editingNotes ? (
                <>
                  <textarea
                    className="form-input notes-textarea"
                    value={noteDraft}
                    onChange={e => setNoteDraft(e.target.value)}
                    rows={4}
                    placeholder="Log historical milestones or recent case interaction specifics..."
                  />
                  <div className="modal-actions" style={{ marginTop: '0.75rem' }}>
                    <button
                      className="btn btn--outline btn--sm"
                      onClick={() => setEditingNotes(false)}
                    >
                      Cancel
                    </button>
                    <button className="btn btn--primary btn--sm" onClick={handleSaveNotes}>
                      Save Note Entry
                    </button>
                  </div>
                </>
              ) : (
                // Output our chronological NotesHistory timeline tracker directly
                <NotesHistory notes={activeCase.notesHistory || []} />
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Confirm remove modal ── */}
      {confirmRemove && (
        <div className="modal-overlay" onClick={() => setConfirmRemove(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Remove Case</h2>
            <p>
              Are you sure you want to remove{' '}
              <strong>{activeCase?.name ?? 'this youth'}</strong> from your
              caseload? This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="btn btn--outline" onClick={() => setConfirmRemove(false)}>
                Cancel
              </button>
              <button className="btn btn--danger" onClick={handleRemove}>
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveCases;