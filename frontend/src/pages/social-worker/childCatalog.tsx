import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCases } from '../../contexts/CasesContext';
import { useDocumentation } from '../../contexts/DocumentationContext';
import { ChildDocumentation } from '../../types';
import ChildSearchBar from '../../components/shared/ChildSearchBar';

const ChildCatalog: React.FC = () => {
  const { user } = useAuth();
  const { cases, allChildren, getRecentChildren, updateRecentInteraction, addChildAccount } = useCases();
  const { docs, upsertDoc, updateSummary, appendExtraNotes, fetchDocForChild } = useDocumentation();
  const location = useLocation();

  const urlParams = new URLSearchParams(location.search);
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

  const [editing, setEditing] = useState(false);
  const [notification, setNotification] = useState('');
  const [editingSummary, setEditingSummary] = useState(false);
  const [summaryDraft, setSummaryDraft] = useState('');
  const [extraNoteInput, setExtraNoteInput] = useState('');
  const [showExtraInput, setShowExtraInput] = useState(false);

  const [showCreateChild, setShowCreateChild] = useState(false);
  const [childForm, setChildForm] = useState({
    fullName: '', dateOfBirth: '', username: '', email: '', password: '',
  });
  const [childFormError, setChildFormError] = useState('');

  const doc = selectedChildId
    ? (docs.find((entry) => entry.childId === selectedChildId) ?? null)
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

  const handleEdit = () => { if (doc) { setDraft({ ...doc }); setEditing(true); } };
  const handleSave = () => { if (draft) { upsertDoc(draft); setEditing(false); notify('Child Catalog saved.'); } };

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
      setChildFormError('All fields are required.');
      return;
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
      <aside className="cases-sidebar">
        <div style={{ padding: '16px 18px 8px' }}>
          <h2 className="cases-sidebar-title" style={{ padding: 0, borderBottom: 'none', marginBottom: 10 }}>
            Child Catalog
          </h2>
          <ChildSearchBar onSelect={selectChild} placeholder="Search child..." />
        </div>
        <div style={{ borderTop: '1px solid var(--border)', marginTop: 8, flex: 1 }}>
          {sortedCases.map((caseItem) => {
            const child = allChildren[caseItem.childId];
            return (
              <div
                key={caseItem.childId}
                className={`cases-row${selectedChildId === caseItem.childId ? ' cases-row--active' : ''}`}
                onClick={() => selectChild(caseItem.childId)}
              >
                <div className="case-avatar">{child?.name?.[0] ?? '?'}</div>
                <div className="case-info">
                  <p className="case-name">{child?.name ?? caseItem.childId}</p>
                </div>
              </div>
            );
          })}
          {sortedCases.length === 0 && (
            <p className="empty-state" style={{ padding: '12px 18px' }}>No active cases.</p>
          )}
        </div>
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

      <div className="case-detail">
        {notification && <div className="alert alert--info">{notification}</div>}

        {!selectedChildId || !current ? (
          <p className="empty-state">Select a child from the sidebar.</p>
        ) : (
          <>
            <div className="page-header">
              <div>
                <h1 className="page-title">{allChildren[selectedChildId]?.name ?? selectedChildId}</h1>
                <p className="page-sub">Child Catalog &amp; Documentation</p>
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
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};

export default ChildCatalog;
