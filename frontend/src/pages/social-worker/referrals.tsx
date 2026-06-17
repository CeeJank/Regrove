import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useReferrals } from '../../contexts/ReferralsContext';

const MOCK_WORKERS: Record<string, string> = { 'worker-1': 'Sarah Chen', 'worker-2': 'Marcus Lee', 'worker-3': 'Priya Nair' };
const MOCK_CHILDREN: Record<string, string> = { 'child-1': 'Alex Rivera', 'child-2': 'Jamie Tan', 'child-3': 'Sam Lim' };

const Referrals: React.FC = () => {
  const { user } = useAuth();
  const { createReferral, respondToReferral, getIncomingReferrals, getOutgoingReferrals } = useReferrals();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ toWorkerId: 'worker-2', childId: 'child-1', message: '' });
  const [notification, setNotification] = useState('');

  const incoming = user ? getIncomingReferrals(user.id) : [];
  const outgoing = user ? getOutgoingReferrals(user.id) : [];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    createReferral({ fromWorkerId: user.id, toWorkerId: form.toWorkerId, childId: form.childId, message: form.message });
    setShowCreate(false);
    setForm({ toWorkerId: 'worker-2', childId: 'child-1', message: '' });
    notify('Referral sent successfully.');
  };

  const respond = (id: string, accept: boolean) => {
    respondToReferral(id, accept);
    notify(accept ? 'Referral accepted.' : 'Referral declined.');
  };

  const notify = (msg: string) => { setNotification(msg); setTimeout(() => setNotification(''), 3000); };

  const statusColor: Record<string, string> = { pending: '#EAB308', accepted: '#22C55E', declined: '#EF4444' };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Referrals</h1>
          <p className="page-sub">Transfer or receive cases from other social workers.</p>
        </div>
        <button className="btn btn--primary" onClick={() => setShowCreate(true)}>+ New Referral</button>
      </div>
      {notification && <div className="alert alert--info">{notification}</div>}

      <h2 className="section-title">Incoming Referrals</h2>
      {incoming.length === 0 ? (
        <p className="empty-state">No incoming referrals.</p>
      ) : (
        <div className="referral-list">
          {incoming.map(r => (
            <div key={r.id} className="referral-card">
              <div className="referral-meta">
                <p className="referral-from">From: <strong>{MOCK_WORKERS[r.fromWorkerId] ?? r.fromWorkerId}</strong></p>
                <p className="referral-child">Youth: <strong>{MOCK_CHILDREN[r.childId] ?? r.childId}</strong></p>
                <span className="status-chip" style={{ color: statusColor[r.status] }}>{r.status}</span>
              </div>
              <p className="referral-message">"{r.message}"</p>
              {r.status === 'pending' && (
                <div className="referral-actions">
                  <button className="btn btn--primary btn--sm" onClick={() => respond(r.id, true)}>Accept</button>
                  <button className="btn btn--outline btn--sm" onClick={() => respond(r.id, false)}>Decline</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <h2 className="section-title" style={{ marginTop: '2rem' }}>Outgoing Referrals</h2>
      {outgoing.length === 0 ? (
        <p className="empty-state">No outgoing referrals.</p>
      ) : (
        <div className="referral-list">
          {outgoing.map(r => (
            <div key={r.id} className="referral-card">
              <div className="referral-meta">
                <p className="referral-from">To: <strong>{MOCK_WORKERS[r.toWorkerId] ?? r.toWorkerId}</strong></p>
                <p className="referral-child">Youth: <strong>{MOCK_CHILDREN[r.childId] ?? r.childId}</strong></p>
                <span className="status-chip" style={{ color: statusColor[r.status] }}>{r.status}</span>
              </div>
              <p className="referral-message">"{r.message}"</p>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">New Referral</h2>
            <form className="auth-form" onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Refer to Social Worker</label>
                <select className="form-input" value={form.toWorkerId} onChange={e => setForm(f => ({ ...f, toWorkerId: e.target.value }))}>
                  {Object.entries(MOCK_WORKERS).filter(([id]) => id !== user?.id).map(([id, name]) => (
                    <option key={id} value={id}>{name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Youth</label>
                <select className="form-input" value={form.childId} onChange={e => setForm(f => ({ ...f, childId: e.target.value }))}>
                  {Object.entries(MOCK_CHILDREN).map(([id, name]) => (
                    <option key={id} value={id}>{name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Referral Message</label>
                <textarea
                  className="form-input"
                  rows={4}
                  required
                  placeholder="Explain the reason for this referral..."
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn--outline" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn--primary">Send Referral</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Referrals;