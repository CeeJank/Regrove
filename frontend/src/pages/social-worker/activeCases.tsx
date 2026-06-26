import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCases, CreateChildForm } from '../../contexts/CasesContext';
import { useDocumentation } from '../../contexts/DocumentationContext';
import { useAuth } from '../../contexts/AuthContext';
import { RiskLevel, CANSItem } from '../../types';
import { apiFetch, uploadSessionAudio, fetchCansSummary } from '../../services/api';
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
    appendMeetupSummary, addChildAccount,
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

  // selectedChildId can be any child from the DB — not just case children.
  // guestChildName holds the name when the child has no active case record.
  const [selectedChildId, setSelectedChildId] = useState(sortedCases[0]?.childId ?? '');
  const [guestChildName,  setGuestChildName]  = useState('');
  const [editingNotes, setEditingNotes] = useState(false);
  const [noteDraft,    setNoteDraft]    = useState('');
  const [notification, setNotification] = useState('');
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [removeEmail,   setRemoveEmail]   = useState('');
  const [removeError,   setRemoveError]   = useState('');

  // ── Create Child Profile ──────────────────────────────────────
  const [showCreateChild, setShowCreateChild] = useState(false);
  const [createChildForm, setCreateChildForm] = useState<CreateChildForm>({
    fullName: '', username: '', email: '', password: '', dateOfBirth: '',
  });
  const [createChildError, setCreateChildError] = useState('');
  const [createChildLoading, setCreateChildLoading] = useState(false);

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
  const [currentSessionId, setCurrentSessionId] = useState('');
  const [cansSummary,      setCansSummary]      = useState('');
  const [cansLoading,      setCansLoading]      = useState(false);
  const intervalRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef   = useRef<Blob[]>([]);
  const pollTimerRef     = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const activeCase  = cases.find(c => c.childId === selectedChildId) ?? null;
  const selectedDoc = activeCase ? docs.find(d => d.childId === activeCase.childId) : undefined;
  // Display name: prefer case record → allChildren lookup → guestChildName from search
  const displayName = activeCase
    ? (allChildren[activeCase.childId]?.name ?? activeCase.childId)
    : (allChildren[selectedChildId]?.name ?? (guestChildName || selectedChildId));

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleSearch = (childId: string, childName: string) => {
    if (user) updateRecentInteraction(user.id, childId);
    setSelectedChildId(childId);
    setGuestChildName(childName);
    resetSession();
    setEditingNotes(false);
  };

  const handleRemove = async () => {
    if (!activeCase || !user) return;
    if (removeEmail !== user.email) { setRemoveError('Email does not match your account.'); return; }
    try {
      await removeCase(activeCase.id);
      const next = cases.find(c => c.childId !== activeCase.childId);
      setSelectedChildId(next?.childId ?? '');
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

  // ── Create child helpers ──────────────────────────────────────
  const handleCreateChild = async () => {
    if (!createChildForm.fullName.trim()) {
      setCreateChildError('Full name is required.');
      return;
    }
    if (createChildForm.email && !createChildForm.password) {
      setCreateChildError('Password is required when an email is provided.');
      return;
    }
    setCreateChildLoading(true);
    setCreateChildError('');
    try {
      await addChildAccount(createChildForm);
      setShowCreateChild(false);
      setCreateChildForm({ fullName: '', username: '', email: '', password: '', dateOfBirth: '' });
      notify('Child profile created.');
    } catch (err) {
      setCreateChildError(err instanceof Error ? err.message : 'Failed to create child profile.');
    } finally {
      setCreateChildLoading(false);
    }
  };

  // ── Meetup helpers ────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const startSession = async () => {
    if (!selectedChildId) return;
    const childIdForSession = activeCase?.childId ?? selectedChildId;
    try {
      const session = await apiFetch<{ sessionId: string }>(`/session/start/${childIdForSession}`, { method: 'POST' });
      setCurrentSessionId(session.sessionId);
    } catch {}

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.start();
      mediaRecorderRef.current = recorder;
    } catch {
      // Microphone unavailable — session continues without audio recording.
    }

    setSessionState('active');
  };

  const endSession = async () => {
    if (!selectedChildId) return;
    const childIdForSession = activeCase?.childId ?? selectedChildId;
    setSessionState('ended');
    setProcessing(true);

    // Stop recording and collect audio blob before anything async.
    let audioBlob: Blob | null = null;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      audioBlob = await new Promise<Blob>((resolve) => {
        mediaRecorderRef.current!.onstop = () => {
          resolve(new Blob(audioChunksRef.current, { type: 'audio/webm' }));
          audioChunksRef.current = [];
        };
        mediaRecorderRef.current!.stop();
        mediaRecorderRef.current!.stream.getTracks().forEach(t => t.stop());
      });
    }

    try {
      const { summary } = await apiFetch<{ summary: string }>(`/session/summarize/${childIdForSession}`);
      await apiFetch('/session/logcase', {
        method: 'POST',
        body: JSON.stringify({ childId: childIdForSession, duration: elapsed, summary }),
      });
      setAiNotes(summary);
      appendMeetupSummary(childIdForSession, summary);
      appendMeetupNotes(childIdForSession, summary);
    } catch {
      setAiNotes('');
    } finally {
      setProcessing(false);
    }

    // Upload audio and poll for CANS summary.
    if (audioBlob && currentSessionId) {
      setCansLoading(true);
      try {
        await uploadSessionAudio(currentSessionId, audioBlob);
        let attempts = 0;
        pollTimerRef.current = setInterval(async () => {
          attempts += 1;
          const result = await fetchCansSummary(currentSessionId);
          if (result) {
            setCansSummary(result.summary);
            setCansLoading(false);
            clearInterval(pollTimerRef.current!);
            pollTimerRef.current = null;
          } else if (attempts >= 24) {
            // Give up after 2 minutes (24 × 5 s).
            setCansLoading(false);
            clearInterval(pollTimerRef.current!);
            pollTimerRef.current = null;
          }
        }, 5000);
      } catch {
        setCansLoading(false);
      }
    }
  };

  const resetSession = () => {
    if (pollTimerRef.current) { clearInterval(pollTimerRef.current); pollTimerRef.current = null; }
    setSessionState('idle');
    setAiNotes('');
    setCansSummary('');
    setCansLoading(false);
    setCurrentSessionId('');
    setElapsed(0);
  };

  return (
    <div className="active-cases-layout">
      {/* ── Sidebar ── */}
      <aside className="cases-sidebar">
        <div style={{ padding: '16px 18px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <h2 className="cases-sidebar-title" style={{ padding: 0, borderBottom: 'none', margin: 0 }}>
              Active Cases
            </h2>
            <button
              className="btn btn--outline btn--sm"
              title="Create child profile"
              onClick={() => { setCreateChildForm({ fullName: '', username: '', email: '', password: '', dateOfBirth: '' }); setCreateChildError(''); setShowCreateChild(true); }}
            >
              + New
            </button>
          </div>
          <ChildSearchBar onSelect={handleSearch} placeholder="Search child..." />
        </div>
        <div style={{ borderTop: '1px solid var(--border)', marginTop: 8 }}>
          {sortedCases.map(c => {
            const child = allChildren[c.childId];
            const meta  = RISK_META[c.riskLevel];
            return (
              <div
                key={c.id}
                className={`cases-row${selectedChildId === c.childId ? ' cases-row--active' : ''}`}
                onClick={() => {
                  setSelectedChildId(c.childId);
                  setGuestChildName('');
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

        {!selectedChildId ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 12 }}>
            <p className="empty-state">Select a case from the sidebar.</p>
          </div>
        ) : !activeCase ? (
          /* ── Guest child: not an active case yet, session-only view ── */
          <div>
            <div className="page-header">
              <div>
                <h1 className="page-title">{displayName}</h1>
                <p className="page-sub" style={{ color: '#92400E' }}>Not an active case — session only</p>
              </div>
            </div>
            <div className="case-section">
              <h3 className="case-section-title">Meetup Session</h3>
              {sessionState === 'idle' && (
                <button className="btn btn--primary" onClick={() => setSessionState('confirm')}>
                  🎥 Start Meetup Session
                </button>
              )}
              {sessionState === 'confirm' && (
                <div className="meetup-confirm-card" style={{ margin: 0, maxWidth: '100%' }}>
                  <div className="meetup-icon">🎥</div>
                  <h2>Start Meetup with {displayName}?</h2>
                  <p>AI will record and summarize the session.</p>
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
                  <p className="meetup-with">With: <strong>{displayName}</strong></p>
                  <div className="meetup-timer">{fmt(elapsed)}</div>
                  <p className="meetup-ai-note">🤖 AI is recording and will auto-summarize when the session ends.</p>
                  <button className="btn btn--danger btn--lg" onClick={endSession}>End Meetup Session</button>
                </div>
              )}
              {sessionState === 'ended' && (
                <div className="meetup-ended-card" style={{ margin: 0, maxWidth: '100%' }}>
                  <div className="meetup-ended-icon">✅</div>
                  <h2>Session Ended</h2>
                  <p>Duration: <strong>{fmt(elapsed)}</strong> · With: <strong>{displayName}</strong></p>
                  {processing ? (
                    <div className="meetup-processing">
                      <div className="typing-indicator" style={{ justifyContent: 'center' }}><span /><span /><span /></div>
                      <p>AI is generating session summary...</p>
                    </div>
                  ) : (
                    <>
                      <div className="meetup-summary-box">
                        <p className="cans-label">AI Session Summary</p>
                        <p style={{ fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{aiNotes}</p>
                      </div>
                      <button className="btn btn--primary" style={{ marginTop: 16 }} onClick={resetSession}>Start Another Session</button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (() => {
          const cansItems = selectedDoc?.cansItems ?? [];

          return (
            <>
              {/* Header */}
              <div className="page-header">
                <div>
                  <h1 className="page-title">{displayName}</h1>
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
                      onClick={() => navigate(`/sw/child-catalog?child=${activeCase?.childId ?? selectedChildId}`)}
                    >
                      📖 Visit Catalog
                    </button>
                  </div>
                )}

                {sessionState === 'confirm' && (
                  <div className="meetup-confirm-card" style={{ margin: 0, maxWidth: '100%' }}>
                    <div className="meetup-icon">🎥</div>
                    <h2>Start Meetup with {displayName}?</h2>
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
                    <p className="meetup-with">With: <strong>{displayName}</strong></p>
                    <div className="meetup-timer">{fmt(elapsed)}</div>
                    <p className="meetup-ai-note">🤖 AI is recording and will auto-summarize when the session ends.</p>
                    <button className="btn btn--danger btn--lg" onClick={endSession}>End Meetup Session</button>
                  </div>
                )}

                {sessionState === 'ended' && (
                  <div className="meetup-ended-card" style={{ margin: 0, maxWidth: '100%' }}>
                    <div className="meetup-ended-icon">✅</div>
                    <h2>Session Ended</h2>
                    <p>Duration: <strong>{fmt(elapsed)}</strong> · With: <strong>{displayName}</strong></p>
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

                        <div className="meetup-summary-box" style={{ marginTop: 16 }}>
                          <p className="cans-label">CANS Assessment (from audio transcript)</p>
                          {cansLoading ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
                              <div className="typing-indicator"><span /><span /><span /></div>
                              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
                                Transcribing audio and generating CANS assessment…
                              </p>
                            </div>
                          ) : cansSummary ? (
                            <pre style={{ fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>
                              {cansSummary}
                            </pre>
                          ) : (
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                              No audio recording captured for this session.
                            </p>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                          <button className="btn btn--primary" onClick={resetSession}>Start Another Session</button>
                          <button
                            className="btn btn--outline"
                            onClick={() => navigate(`/sw/child-catalog?child=${activeCase?.childId ?? selectedChildId}`)}
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

      {/* ── Create Child Profile modal ── */}
      {showCreateChild && (
        <div className="modal-overlay" onClick={() => setShowCreateChild(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Create Child Profile</h2>
            <div className="auth-form">
              <div className="form-group">
                <label className="form-label">Full Name <span style={{ color: '#B91C1C' }}>*</span></label>
                <input
                  className="form-input"
                  placeholder="e.g. Alex Tan"
                  value={createChildForm.fullName}
                  onChange={e => setCreateChildForm(f => ({ ...f, fullName: e.target.value }))}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Email (optional)</label>
                  <input
                    className="form-input"
                    type="email"
                    placeholder="child@example.com"
                    value={createChildForm.email}
                    onChange={e => setCreateChildForm(f => ({ ...f, email: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Password {createChildForm.email && <span style={{ color: '#B91C1C' }}>*</span>}</label>
                  <input
                    className="form-input"
                    type="password"
                    placeholder="Min. 8 characters"
                    value={createChildForm.password}
                    onChange={e => setCreateChildForm(f => ({ ...f, password: e.target.value }))}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Username (optional)</label>
                  <input
                    className="form-input"
                    placeholder="e.g. alextan"
                    value={createChildForm.username}
                    onChange={e => setCreateChildForm(f => ({ ...f, username: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth (optional)</label>
                  <input
                    className="form-input"
                    type="date"
                    value={createChildForm.dateOfBirth}
                    onChange={e => setCreateChildForm(f => ({ ...f, dateOfBirth: e.target.value }))}
                  />
                </div>
              </div>
              {createChildError && <p className="form-error">{createChildError}</p>}
              <div className="modal-actions">
                <button className="btn btn--outline" onClick={() => setShowCreateChild(false)} disabled={createChildLoading}>Cancel</button>
                <button className="btn btn--primary" onClick={handleCreateChild} disabled={createChildLoading}>
                  {createChildLoading ? 'Creating…' : 'Create Profile'}
                </button>
              </div>
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
