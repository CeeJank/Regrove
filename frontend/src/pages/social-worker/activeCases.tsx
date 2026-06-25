import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCases } from '../../contexts/CasesContext';
import { useDocumentation } from '../../contexts/DocumentationContext';
import { useAuth } from '../../contexts/AuthContext';
import { RiskLevel, CANSItem } from '../../types';
import { apiFetch } from '../../services/api';
import ChildSearchBar from '../../components/shared/ChildSearchBar';

const RISK_META: Record<RiskLevel, { bg: string; text: string; label: string }> = {
  critical: { bg: '#F3E8FF', text: '#7C3AED', label: 'Critical'   },
  high:     { bg: '#FEE2E2', text: '#B91C1C', label: 'High Risk'  },
  medium:   { bg: '#FEF9C3', text: '#92400E', label: 'Medium Risk'},
  low:      { bg: '#DCFCE7', text: '#166534', label: 'Low Risk'   },
};

const CANS_RATING_LABELS: Record<number, { label: string; color: string }> = {
  0: { label: '0 — No need',          color: '#166534' },
  1: { label: '1 — Watchful',         color: '#92400E' },
  2: { label: '2 — Action needed',    color: '#B91C1C' },
  3: { label: '3 — Immediate action', color: '#7C3AED' },
};

const MOODEMOJI = ['', '😄', '🙂', '😐', '😔', '😢'];

type SessionState = 'idle' | 'confirm' | 'active' | 'ended';

const ActiveCases: React.FC = () => {
  const navigate = useNavigate();
  const {
    cases, allChildren, updateRiskLevel, updateNotes,
    removeCase, updateRecentInteraction, getRecentChildren,
    appendMeetupSummary,
  } = useCases();
  const { docs, updateCANS, appendMeetupNotes } = useDocumentation();
  const { user } = useAuth();

  // ── Sidebar list ──────────────────────────────────────────────
  const recentIds = user ? getRecentChildren(user.id) : [];
  const sortedCases = [...cases].sort((a, b) => {
    const ai = recentIds.indexOf(a.childId);
    const bi = recentIds.indexOf(b.childId);
    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  }).slice(0, 10);

  const [selected,     setSelected]     = useState(sortedCases[0]?.id ?? '');
  const [editingNotes, setEditingNotes] = useState(false);
  const [noteDraft,    setNoteDraft]    = useState('');
  const [notification, setNotification] = useState('');
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [removeEmail,   setRemoveEmail]   = useState('');
  const [removeError,   setRemoveError]   = useState('');

  // ── CANS ──────────────────────────────────────────────────────
  const [showAddCANS, setShowAddCANS] = useState(false);
  const [cansForm, setCansForm] = useState<Omit<CANSItem, 'id'>>({
    domain: '', item: '', rating: 1, caseNotes: '', actions: '',
  });

  // ── Meetup Session ────────────────────────────────────────────
  const [sessionState, setSessionState] = useState<SessionState>('idle');
  const [elapsed,      setElapsed]      = useState(0);
  const [aiNotes,      setAiNotes]      = useState('');
  const [processing,   setProcessing]   = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (sessionState === 'active') {
      intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      if (sessionState !== 'ended') setElapsed(0);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [sessionState]);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const activeCase  = cases.find(c => c.id === selected);
  const selectedDoc = activeCase ? docs.find(d => d.childId === activeCase.childId) : undefined;

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleSearch = (childId: string) => {
    if (user) updateRecentInteraction(user.id, childId);
    const c = cases.find(cs => cs.childId === childId);
    if (c) setSelected(c.id);
  };

  const handleRemove = async () => {
    if (!activeCase || !user) return;
    if (removeEmail !== user.email) { setRemoveError('Email does not match your account.'); return; }
    try {
      await removeCase(activeCase.id);
      setSelected(cases.find(c => c.id !== activeCase.id)?.id ?? '');
      setConfirmRemove(false);
      setRemoveEmail('');
      notify('Case removed.');
    } catch {
      setRemoveError('Failed to remove case. Please try again.');
    }
  };

  // ── CANS helpers ─────────────────────────────────────────────
  const handleAddCANS = () => {
    if (!activeCase || !cansForm.domain || !cansForm.item) return;
    const existing = selectedDoc?.cansItems ?? [];
    const newItem: CANSItem = { ...cansForm, id: `cans-${Date.now()}` };
    updateCANS(activeCase.childId, [...existing, newItem]);
    setShowAddCANS(false);
    setCansForm({ domain: '', item: '', rating: 1, caseNotes: '', actions: '' });
    notify('CANS item added.');
  };

  // ── Meetup helpers ────────────────────────────────────────────
  const startSession = async () => {
    if (!activeCase) return;
    try {
      await apiFetch(`/session/start/${activeCase.childId}`, { method: 'POST' });
    } catch {}
    setSessionState('active');
  };

  const endSession = async () => {
    if (!activeCase) return;
    setSessionState('ended');
    setProcessing(true);
    try {
      const { summary } = await apiFetch<{ summary: string }>(`/session/summarize/${activeCase.childId}`);
      await apiFetch('/session/logcase', {
        method: 'POST',
        body: JSON.stringify({ childId: activeCase.childId, duration: elapsed, summary }),
      });
      setAiNotes(summary);
      appendMeetupSummary(activeCase.childId, summary);
      appendMeetupNotes(activeCase.childId, summary);
    } catch {
      setAiNotes('');
    } finally {
      setProcessing(false);
    }
  };

  const resetSession = () => {
    setSessionState('idle');
    setAiNotes('');
    setElapsed(0);
  };

  return (
    <div className="active-cases-layout">
      {/* ── Sidebar ── */}
      <aside className="cases-sidebar">
        <div style={{ padding: '16px 18px 8px' }}>
          <h2 className="cases-sidebar-title" style={{ padding: 0, borderBottom: 'none', marginBottom: 10 }}>
            Active Cases
          </h2>
          <ChildSearchBar onSelect={handleSearch} placeholder="Search child..." />
        </div>
        <div style={{ borderTop: '1px solid var(--border)', marginTop: 8 }}>
          {sortedCases.map(c => {
            const child = allChildren[c.childId];
            const meta  = RISK_META[c.riskLevel];
            return (
              <div
                key={c.id}
                className={`cases-row${selected === c.id ? ' cases-row--active' : ''}`}
                onClick={() => {
                  setSelected(c.id);
                  setEditingNotes(false);
                  resetSession();
                  if (user) updateRecentInteraction(user.id, c.childId);
                }}
              >
                <div className="case-avatar">{child?.name?.[0] ?? '?'}</div>
                <div className="case-info">
                  <p className="case-name">{child?.name ?? c.childId}</p>
                  <span className="risk-badge risk-badge--sm" style={{ background: meta.bg, color: meta.text }}>
                    {meta.label}
                  </span>
                </div>
              </div>
            );
          })}
          {sortedCases.length === 0 && (
            <p className="empty-state" style={{ padding: '12px 18px' }}>No active cases.</p>
          )}
        </div>
      </aside>

      {/* ── Detail panel ── */}
      <div className="case-detail">
        {notification && <div className="alert alert--info">{notification}</div>}

        {!activeCase ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 12 }}>
            <p className="empty-state">Select a case from the sidebar.</p>
          </div>
        ) : (() => {
          const child = allChildren[activeCase.childId];
          const cansItems = selectedDoc?.cansItems ?? [];

          return (
            <>
              {/* Header */}
              <div className="page-header">
                <div>
                  <h1 className="page-title">{child?.name ?? activeCase.childId}</h1>
                  <p className="page-sub">Case ID: <span className="mono">{activeCase.id}</span></p>
                </div>
                <button className="btn btn--danger" onClick={() => setConfirmRemove(true)}>Remove Case</button>
              </div>

              {/* Risk Level */}
              <div className="case-section">
                <h3 className="case-section-title">Risk Level</h3>
                <div className="risk-selector">
                  {(['low', 'medium', 'high', 'critical'] as RiskLevel[]).map(lvl => (
                    <button
                      key={lvl}
                      className={`risk-btn risk-btn--${lvl}${activeCase.riskLevel === lvl ? ' risk-btn--selected' : ''}`}
                      onClick={async () => {
                        try {
                          await updateRiskLevel(activeCase.id, lvl);
                          notify(`Risk updated to ${lvl}.`);
                        } catch {
                          notify('Failed to update risk.');
                        }
                      }}
                    >
                      {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Summary */}
              <div className="case-section">
                <h3 className="case-section-title">AI Summary</h3>
                <div className="ai-summary-box">{activeCase.aiSummary || 'No AI summary yet.'}</div>
              </div>

              {/* Recent Check-Ins */}
              <div className="case-section">
                <h3 className="case-section-title">Recent Check-Ins</h3>
                {activeCase.checkIns.length === 0
                  ? <p className="empty-state">No check-ins recorded yet.</p>
                  : (
                    <div className="checkin-list">
                      {activeCase.checkIns.slice(-5).reverse().map(ci => (
                        <div key={ci.id} className="checkin-row">
                          <span className="checkin-emoji">{MOODEMOJI[ci.mood]}</span>
                          <div>
                            <p className="checkin-events">{ci.events || 'No events described.'}</p>
                            <p className="checkin-date">{new Date(ci.timestamp).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                }
              </div>

              {/* Notes */}
              <div className="case-section">
                <div className="case-section-header">
                  <h3 className="case-section-title">Notes</h3>
                  {!editingNotes && (
                    <button
                      className="btn btn--outline btn--sm"
                      onClick={() => { setNoteDraft(activeCase.notes); setEditingNotes(true); }}
                    >
                      Edit
                    </button>
                  )}
                </div>
                {editingNotes ? (
                  <>
                    <textarea
                      className="form-input notes-textarea"
                      value={noteDraft}
                      rows={5}
                      onChange={e => setNoteDraft(e.target.value)}
                    />
                    <div className="modal-actions" style={{ marginTop: '0.75rem' }}>
                      <button className="btn btn--outline btn--sm" onClick={() => setEditingNotes(false)}>Cancel</button>
                      <button
                        className="btn btn--primary btn--sm"
                        onClick={async () => {
                          try {
                            await updateNotes(activeCase.id, noteDraft);
                            setEditingNotes(false);
                            notify('Notes saved.');
                          } catch {
                            notify('Failed to save notes.');
                          }
                        }}
                      >
                        Save Notes
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="notes-display">{activeCase.notes || 'No notes yet.'}</p>
                )}
              </div>

              {/* ── CANS Assessment (above Start Meetup Session) ── */}
              <div className="case-section">
                <div className="case-section-header">
                  <h3 className="case-section-title">CANS Assessment</h3>
                  <button className="btn btn--outline btn--sm" onClick={() => setShowAddCANS(true)}>+ Add Item</button>
                </div>
                {cansItems.length === 0
                  ? <p className="empty-state">No CANS items yet.</p>
                  : cansItems.map(item => {
                    const r = CANS_RATING_LABELS[item.rating];
                    return (
                      <div key={item.id} className="cans-card">
                        <div className="cans-header">
                          <div>
                            <span className="cans-domain">{item.domain}</span>
                            <span className="cans-item-name"> · {item.item}</span>
                          </div>
                          <span className="cans-rating" style={{ color: r.color, background: `${r.color}18` }}>
                            {r.label}
                          </span>
                        </div>
                        {item.caseNotes && (
                          <div className="cans-notes">
                            <p className="cans-label">Case Notes</p>
                            <p className="cans-text">{item.caseNotes}</p>
                          </div>
                        )}
                        {item.actions && (
                          <div className="cans-notes">
                            <p className="cans-label">Actions</p>
                            <p className="cans-text" style={{ whiteSpace: 'pre-line' }}>{item.actions}</p>
                          </div>
                        )}
                      </div>
                    );
                  })
                }
              </div>

              {/* ── Meetup Session (inline, no separate page) ── */}
              <div className="case-section">
                <h3 className="case-section-title">Meetup Session</h3>

                {sessionState === 'idle' && (
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <button className="btn btn--primary" onClick={() => setSessionState('confirm')}>
                      🎥 Start Meetup Session
                    </button>
                    <button
                      className="btn btn--outline"
                      onClick={() => navigate(`/sw/child-catalog?child=${activeCase.childId}`)}
                    >
                      📖 Visit Catalog
                    </button>
                  </div>
                )}

                {sessionState === 'confirm' && (
                  <div className="meetup-confirm-card" style={{ margin: 0, maxWidth: '100%' }}>
                    <div className="meetup-icon">🎥</div>
                    <h2>Start Meetup with {child?.name}?</h2>
                    <p>AI will record and summarize the session. The summary will be sent to Active Cases and Child Catalog automatically.</p>
                    <div className="meetup-actions">
                      <button className="btn btn--outline" onClick={resetSession}>No, Cancel</button>
                      <button className="btn btn--primary" onClick={startSession}>Yes, Start Session</button>
                    </div>
                  </div>
                )}

                {sessionState === 'active' && (
                  <div className="meetup-active-card" style={{ margin: 0, maxWidth: '100%' }}>
                    <div className="meetup-pulse" />
                    <h2>Session in Progress</h2>
                    <p className="meetup-with">With: <strong>{child?.name}</strong></p>
                    <div className="meetup-timer">{fmt(elapsed)}</div>
                    <p className="meetup-ai-note">🤖 AI is recording and will auto-summarize when the session ends.</p>
                    <button className="btn btn--danger btn--lg" onClick={endSession}>End Meetup Session</button>
                  </div>
                )}

                {sessionState === 'ended' && (
                  <div className="meetup-ended-card" style={{ margin: 0, maxWidth: '100%' }}>
                    <div className="meetup-ended-icon">✅</div>
                    <h2>Session Ended</h2>
                    <p>Duration: <strong>{fmt(elapsed)}</strong> · With: <strong>{child?.name}</strong></p>
                    {processing ? (
                      <div className="meetup-processing">
                        <div className="typing-indicator" style={{ justifyContent: 'center' }}>
                          <span /><span /><span />
                        </div>
                        <p>AI is generating session summary...</p>
                      </div>
                    ) : (
                      <>
                        <div className="meetup-summary-box">
                          <p className="cans-label">AI Session Summary (sent to Active Cases &amp; Child Catalog)</p>
                          <p style={{ fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{aiNotes}</p>
                        </div>
                        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                          <button className="btn btn--primary" onClick={resetSession}>Start Another Session</button>
                          <button
                            className="btn btn--outline"
                            onClick={() => navigate(`/sw/child-catalog?child=${activeCase.childId}`)}
                          >
                            📖 Visit Catalog
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </>
          );
        })()}
      </div>

      {/* ── Remove case modal ── */}
      {confirmRemove && (
        <div className="modal-overlay" onClick={() => { setConfirmRemove(false); setRemoveEmail(''); setRemoveError(''); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Remove Case</h2>
            <p style={{ marginBottom: 16 }}>This action cannot be undone. Please enter your email address to confirm.</p>
            <div className="form-group">
              <label className="form-label">Your Email</label>
              <input
                className="form-input"
                type="email"
                placeholder={user?.email}
                value={removeEmail}
                onChange={e => { setRemoveEmail(e.target.value); setRemoveError(''); }}
              />
            </div>
            {removeError && <p className="form-error" style={{ marginTop: 8 }}>{removeError}</p>}
            <div className="modal-actions">
              <button className="btn btn--outline" onClick={() => { setConfirmRemove(false); setRemoveEmail(''); setRemoveError(''); }}>Cancel</button>
              <button className="btn btn--danger" onClick={handleRemove}>Confirm Remove</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add CANS modal ── */}
      {showAddCANS && (
        <div className="modal-overlay" onClick={() => setShowAddCANS(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Add CANS Item</h2>
            <div className="auth-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Domain</label>
                  <input
                    className="form-input"
                    placeholder="e.g. Strengths"
                    value={cansForm.domain}
                    onChange={e => setCansForm(f => ({ ...f, domain: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Item</label>
                  <input
                    className="form-input"
                    placeholder="e.g. Recreation"
                    value={cansForm.item}
                    onChange={e => setCansForm(f => ({ ...f, item: e.target.value }))}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">CANS Rating</label>
                <select
                  className="form-input"
                  value={cansForm.rating}
                  onChange={e => setCansForm(f => ({ ...f, rating: Number(e.target.value) as 0 | 1 | 2 | 3 }))}
                >
                  {[0, 1, 2, 3].map(r => (
                    <option key={r} value={r}>{CANS_RATING_LABELS[r].label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Case Notes</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={cansForm.caseNotes}
                  onChange={e => setCansForm(f => ({ ...f, caseNotes: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Actions</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={cansForm.actions}
                  onChange={e => setCansForm(f => ({ ...f, actions: e.target.value }))}
                />
              </div>
              <div className="modal-actions">
                <button className="btn btn--outline" onClick={() => setShowAddCANS(false)}>Cancel</button>
                <button className="btn btn--primary" onClick={handleAddCANS}>Add</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveCases;
