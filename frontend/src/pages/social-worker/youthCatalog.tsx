import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCases } from '../../contexts/CasesContext';
import { useDocumentation } from '../../contexts/DocumentationContext';
import { ChildDocumentation } from '../../types';
import ChildSearchBar from '../../components/shared/ChildSearchBar';

const YouthCatalog: React.FC = () => {
  const { user } = useAuth();
  const { cases, allChildren, getRecentChildren, updateRecentInteraction, addChildAccount } = useCases();
  const { docs, upsertDoc, updateSummary, appendExtraNotes, fetchDocForChild } = useDocumentation();
  const location = useLocation();

  const urlParams  = new URLSearchParams(location.search);
  const deepLinkId = urlParams.get('child');

  const recentIds = user ? getRecentChildren(user.id) : [];
  const sortedCases = [...cases].sort((a, b) => {
    const ai = recentIds.indexOf(a.childId);
    const bi = recentIds.indexOf(b.childId);
    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  }).slice(0, 10);

  const [selectedChildId, setSelectedChildId] = useState<string | null>(
    deepLinkId ?? sortedCases[0]?.childId ?? null
  );

  useEffect(() => {
    if (deepLinkId) setSelectedChildId(deepLinkId);
  }, [deepLinkId]);

  const [editing,        setEditing]        = useState(false);
  const [notification,   setNotification]   = useState('');
  const [editingSummary, setEditingSummary] = useState(false);
  const [summaryDraft,   setSummaryDraft]   = useState('');
  const [extraNoteInput, setExtraNoteInput] = useState('');
  const [showExtraInput, setShowExtraInput] = useState(false);

  // Create child account modal
  const [showCreateChild, setShowCreateChild] = useState(false);
  const [childForm,       setChildForm]       = useState({
    fullName: '', dateOfBirth: '', username: '', email: '', password: '',
  });
  const [childFormError, setChildFormError] = useState('');

  const doc = selectedChildId
    ? (docs.find(d => d.childId === selectedChildId) ?? null)
    : null;
  const [draft, setDraft] = useState<ChildDocumentation | null>(null);

  useEffect(() => {
    if (!selectedChildId) return;
    void fetchDocForChild(selectedChildId);
  }, [selectedChildId, fetchDocForChild]);

  const notify = (msg: string) => { setNotification(msg); setTimeout(() => setNotification(''), 3000); };

  const selectChild = (childId: string) => {
    setSelectedChildId(childId);
    setEditing(false);
    setEditingSummary(false);
    setShowExtraInput(false);
    if (user) updateRecentInteraction(user.id, childId);
  };

  const handleEdit  = () => { if (doc) { setDraft({ ...doc }); setEditing(true); } };
  const handleSave  = () => { if (draft) { upsertDoc(draft); setEditing(false); notify('Youth Catalog saved.'); } };

  const handleSaveSummary = () => {
    if (!selectedChildId) return;
    updateSummary(selectedChildId, summaryDraft);
    setEditingSummary(false);
    notify('Summary saved.');
  };

  const handleAddExtraNote = () => {
    if (!selectedChildId || !extraNoteInput.trim()) return;
    appendExtraNotes(selectedChildId, extraNoteInput.trim());
    setExtraNoteInput('');
    setShowExtraInput(false);
    notify('Extra note added.');
  };

  const [creatingChild, setCreatingChild] = useState(false);

  const handleCreateChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!childForm.fullName || !childForm.username || !childForm.email || !childForm.password || !childForm.dateOfBirth) {
      setChildFormError('All fields are required.'); return;
    }
    setCreatingChild(true);
    setChildFormError('');
    try {
      await addChildAccount({
        fullName: childForm.fullName,
        username: childForm.username,
        email: childForm.email,
        password: childForm.password,
        dateOfBirth: childForm.dateOfBirth,
      });
      setShowCreateChild(false);
      setChildForm({ fullName: '', dateOfBirth: '', username: '', email: '', password: '' });
      notify(`Account created for ${childForm.fullName}.`);
    } catch (err) {
      setChildFormError(err instanceof Error ? err.message : 'Failed to create account. Please try again.');
    } finally {
      setCreatingChild(false);
    }
  };

  const current = editing ? draft : doc;

  return (
    <div className="active-cases-layout">
      {/* ── Sidebar ── */}
      <aside className="cases-sidebar">
        <div style={{ padding: '16px 18px 8px' }}>
          <h2 className="cases-sidebar-title" style={{ padding: 0, borderBottom: 'none', marginBottom: 10 }}>
            Youth Catalog
          </h2>
          <ChildSearchBar onSelect={selectChild} placeholder="Search child..." />
        </div>
        <div style={{ borderTop: '1px solid var(--border)', marginTop: 8, flex: 1 }}>
          {sortedCases.map(c => {
            const child = allChildren[c.childId];
            return (
              <div
                key={c.childId}
                className={`cases-row${selectedChildId === c.childId ? ' cases-row--active' : ''}`}
                onClick={() => selectChild(c.childId)}
              >
                <div className="case-avatar">{child?.name?.[0] ?? '?'}</div>
                <div className="case-info">
                  <p className="case-name">{child?.name ?? c.childId}</p>
                </div>
              </div>
            );
          })}
          {sortedCases.length === 0 && (
            <p className="empty-state" style={{ padding: '12px 18px' }}>No active cases.</p>
          )}
        </div>
        {/* ── Create Child Account — below the child profiles ── */}
        <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border)' }}>
          <button
            className="btn btn--primary btn--full"
            style={{ fontSize: 13 }}
            onClick={() => setShowCreateChild(true)}
          >
            + Create Child Account
          </button>
        </div>
      </aside>

      {/* ── Detail panel ── */}
      <div className="case-detail">
        {notification && <div className="alert alert--info">{notification}</div>}

        {!selectedChildId || !current ? (
          <p className="empty-state">Select a child from the sidebar.</p>
        ) : (
          <>
            <div className="page-header">
              <div>
                <h1 className="page-title">{allChildren[selectedChildId]?.name ?? selectedChildId}</h1>
                <p className="page-sub">Youth Catalog &amp; Documentation</p>
              </div>
              {doc && (
                <div style={{ display: 'flex', gap: 8 }}>
                  {editing ? (
                    <>
                      <button className="btn btn--outline" onClick={() => setEditing(false)}>Cancel</button>
                      <button className="btn btn--primary" onClick={handleSave}>Save</button>
                    </>
                  ) : (
                    <button className="btn btn--primary" onClick={handleEdit}>Edit Profile</button>
                  )}
                </div>
              )}
            </div>

            {!doc ? (
              <div className="case-section">
                <p className="empty-state">No documentation returned from the backend for this child yet.</p>
              </div>
            ) : (
              <>
                {/* ── Summary Section ── */}
                <div className="case-section">
                  <div className="case-section-header">
                    <h3 className="case-section-title">Summary</h3>
                    {!editingSummary && (
                      <button
                        className="btn btn--outline btn--sm"
                        onClick={() => { setSummaryDraft(doc.summary ?? ''); setEditingSummary(true); }}
                      >
                        Edit
                      </button>
                    )}
                  </div>
                  {editingSummary ? (
                    <>
                      <textarea
                        className="form-input notes-textarea"
                        rows={4}
                        placeholder="Write a brief overview of this youth's background, progress, and current situation..."
                        value={summaryDraft}
                        onChange={e => setSummaryDraft(e.target.value)}
                      />
                      <div className="modal-actions" style={{ marginTop: '0.75rem' }}>
                        <button className="btn btn--outline btn--sm" onClick={() => setEditingSummary(false)}>Cancel</button>
                        <button className="btn btn--primary btn--sm" onClick={handleSaveSummary}>Save Summary</button>
                      </div>
                    </>
                  ) : (
                    <p className="notes-display">
                      {doc.summary || 'No summary yet. Click Edit to add one.'}
                    </p>
                  )}
                </div>

                {/* ── Personal Information ── */}
                <div className="case-section">
                  <h3 className="case-section-title">Personal Information</h3>
                  <div className="doc-grid">
                    {([
                      ['Full Name',     'fullName'],
                      ['NRIC (Last 4)', 'nricLast4'],
                      ['Date of Birth', 'dateOfBirth', 'date'],
                      ['Gender',        'gender'],
                      ['Race',          'race'],
                      ['Nationality',   'nationality'],
                    ] as [string, keyof ChildDocumentation, string?][]).map(([label, key, type]) => (
                      <div key={key} className="form-group">
                        <label className="form-label">{label}</label>
                        {editing ? (
                          <input
                            className="form-input"
                            type={type ?? 'text'}
                            value={String(draft?.[key] ?? '')}
                            onChange={e => setDraft(d => d ? { ...d, [key]: e.target.value } : d)}
                          />
                        ) : (
                          <p className="doc-field-val">{String(current?.[key] || '—')}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Contact & School ── */}
                <div className="case-section">
                  <h3 className="case-section-title">Contact &amp; School</h3>
                  <div className="doc-grid">
                    {([
                      ['Address',             'address'],
                      ['Parent Contact',      'parentContact'],
                      ['School',              'school'],
                      ['Level / Year',        'level'],
                      ['Hobbies / Interests', 'hobbies'],
                    ] as [string, keyof ChildDocumentation][]).map(([label, key]) => (
                      <div key={key} className="form-group">
                        <label className="form-label">{label}</label>
                        {editing ? (
                          <input
                            className="form-input"
                            value={String(draft?.[key] ?? '')}
                            onChange={e => setDraft(d => d ? { ...d, [key]: e.target.value } : d)}
                          />
                        ) : (
                          <p className="doc-field-val">{String(current?.[key] || '—')}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Extra Notes ── */}
                <div className="case-section">
                  <div className="case-section-header">
                    <h3 className="case-section-title">Extra Notes</h3>
                    <button
                      className="btn btn--outline btn--sm"
                      onClick={() => setShowExtraInput(v => !v)}
                    >
                      {showExtraInput ? 'Cancel' : '+ Add Note'}
                    </button>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-soft)', marginBottom: 10 }}>
                    Additional observations, referral notes, or supplementary documentation from meetup sessions and chatbot interactions will appear here.
                  </p>

                  {showExtraInput && (
                    <div style={{ marginBottom: 14 }}>
                      <textarea
                        className="form-input"
                        rows={3}
                        placeholder="Add an extra note or observation..."
                        value={extraNoteInput}
                        onChange={e => setExtraNoteInput(e.target.value)}
                      />
                      <div className="modal-actions" style={{ marginTop: 8 }}>
                        <button className="btn btn--primary btn--sm" onClick={handleAddExtraNote}>Save Note</button>
                      </div>
                    </div>
                  )}

                  {(current?.cansItems ?? []).filter(item => item.domain === 'Meetup Session').length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
                      <p className="cans-label" style={{ marginBottom: 4 }}>From Meetup Sessions</p>
                      {(current?.cansItems ?? [])
                        .filter(item => item.domain === 'Meetup Session')
                        .map(item => (
                          <div key={item.id} className="cans-card">
                            <div className="cans-header">
                              <span className="cans-item-name">{item.item}</span>
                              <span className="cans-rating" style={{ color: '#2563EB', background: '#2563EB18' }}>
                                Meetup Note
                              </span>
                            </div>
                            {item.caseNotes && (
                              <div className="cans-notes">
                                <p className="cans-text" style={{ whiteSpace: 'pre-wrap' }}>{item.caseNotes}</p>
                              </div>
                            )}
                          </div>
                        ))
                      }
                    </div>
                  )}

                  {doc.extraNotes ? (
                    <div className="cans-card">
                      <div className="cans-header">
                        <span className="cans-item-name">Social Worker Notes</span>
                      </div>
                      <div className="cans-notes">
                        <p className="cans-text" style={{ whiteSpace: 'pre-wrap' }}>{doc.extraNotes}</p>
                      </div>
                    </div>
                  ) : (
                    !showExtraInput && (current?.cansItems ?? []).filter(i => i.domain === 'Meetup Session').length === 0 && (
                      <p className="empty-state">No extra notes yet. Notes from meetup sessions will appear here automatically, or you can add your own above.</p>
                    )
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* ── Create Child Account Modal ── */}
      {showCreateChild && (
        <div className="modal-overlay" onClick={() => setShowCreateChild(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Create Child Account</h2>
            <form className="auth-form" onSubmit={handleCreateChild}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    className="form-input"
                    value={childForm.fullName}
                    onChange={e => setChildForm(f => ({ ...f, fullName: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input
                    className="form-input"
                    type="date"
                    value={childForm.dateOfBirth}
                    onChange={e => setChildForm(f => ({ ...f, dateOfBirth: e.target.value }))}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  className="form-input"
                  value={childForm.username}
                  onChange={e => setChildForm(f => ({ ...f, username: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  className="form-input"
                  type="email"
                  value={childForm.email}
                  onChange={e => setChildForm(f => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  className="form-input"
                  type="password"
                  value={childForm.password}
                  onChange={e => setChildForm(f => ({ ...f, password: e.target.value }))}
                />
              </div>
              {childFormError && <p className="form-error">{childFormError}</p>}
              <div className="modal-actions">
                <button type="button" className="btn btn--outline" onClick={() => setShowCreateChild(false)}>Cancel</button>
                <button type="submit" className="btn btn--primary" disabled={creatingChild}>
                  {creatingChild ? 'Creating…' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default YouthCatalog;
