import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchAllChildren, createChild, type ChildProfile } from '../../services/childService';

const RISK_META = {
  LOW:      { bg: '#F0FDF4', text: '#166534', dot: '#22C55E', label: 'Low',      card: 'stat-card--green'  },
  MEDIUM:   { bg: '#FEFCE8', text: '#92400E', dot: '#EAB308', label: 'Medium',   card: 'stat-card--yellow' },
  HIGH:     { bg: '#FEF2F2', text: '#B91C1C', dot: '#EF4444', label: 'High',     card: 'stat-card--red'    },
  CRITICAL: { bg: '#F5F3FF', text: '#6D28D9', dot: '#7C3AED', label: 'Critical', card: 'stat-card--purple' },
} as const;

type RiskLevel = keyof typeof RISK_META;

const EMPTY_FORM = {
  full_name: '',
  age: '' as string | number,
  school: '',
  interests: '',
  category: '',
  status: 'ACTIVE',
  latest_risk_level: 'LOW',
};

const ChildCatalog: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const urlParams  = new URLSearchParams(location.search);
  const deepLinkId = urlParams.get('child');

  const [children,     setChildren]     = useState<ChildProfile[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [search,       setSearch]       = useState('');
  const [riskFilter,   setRiskFilter]   = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedId,   setSelectedId]   = useState<number | null>(
    deepLinkId ? Number(deepLinkId) : null,
  );

  // ── New-profile modal ────────────────────────────────────────────────────────
  const [showModal,    setShowModal]    = useState(false);
  const [form,         setForm]         = useState({ ...EMPTY_FORM });
  const [formError,    setFormError]    = useState('');
  const [submitting,   setSubmitting]   = useState(false);

  const loadChildren = () => {
    setLoading(true);
    fetchAllChildren()
      .then(setChildren)
      .catch(() => setError('Failed to load youth profiles.'))
      .finally(() => setLoading(false));
  };

  useEffect(loadChildren, []);

  useEffect(() => {
    if (deepLinkId) setSelectedId(Number(deepLinkId));
  }, [deepLinkId]);

  const filtered = children.filter((c) => {
    const matchName   = c.full_name.toLowerCase().includes(search.toLowerCase());
    const matchRisk   = riskFilter   ? c.latest_risk_level === riskFilter   : true;
    const matchStatus = statusFilter ? c.status            === statusFilter : true;
    return matchName && matchRisk && matchStatus;
  });

  const countByRisk = (level: string) =>
    children.filter((c) => c.latest_risk_level === level).length;

  const selected = selectedId !== null
    ? (children.find((c) => c.id === selectedId) ?? null)
    : null;

  const selectChild = (id: number) => {
    setSelectedId(id);
    navigate(`/sw/child-catalog?child=${id}`, { replace: true });
  };

  // ── Modal handlers ───────────────────────────────────────────────────────────

  const openModal = () => {
    setForm({ ...EMPTY_FORM });
    setFormError('');
    setShowModal(true);
  };

  const closeModal = () => {
    if (submitting) return;
    setShowModal(false);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!form.full_name.trim()) {
      setFormError('Full name is required.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await createChild({
        ...form,
        age: form.age !== '' ? Number(form.age) : undefined,
      });
      setShowModal(false);
      // Reload list and select the new child
      const fresh = await fetchAllChildren();
      setChildren(fresh);
      selectChild(created.id);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create profile.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="active-cases-layout">

        {/* ── Left sidebar ─────────────────────────────────────────── */}
        <aside className="cases-sidebar">

          <div style={{ padding: '16px 18px 10px' }}>
            <h2 className="cases-sidebar-title" style={{ padding: 0, borderBottom: 'none', marginBottom: 10 }}>
              Youth Catalogue
            </h2>

            {/* Risk level quick-filter pills */}
            {!loading && !error && (
              <div style={{ display: 'flex', gap: 5, marginBottom: 10, flexWrap: 'wrap' }}>
                {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as RiskLevel[]).map((level) => {
                  const meta  = RISK_META[level];
                  const count = countByRisk(level);
                  if (count === 0) return null;
                  const active = riskFilter === level;
                  return (
                    <button
                      key={level}
                      onClick={() => setRiskFilter(active ? '' : level)}
                      style={{
                        fontSize: 11, padding: '2px 8px', borderRadius: 12, cursor: 'pointer',
                        background: active ? meta.dot : meta.bg,
                        color:      active ? '#fff'   : meta.text,
                        border:     `1px solid ${meta.dot}`,
                      }}
                    >
                      {meta.label} {count}
                    </button>
                  );
                })}
              </div>
            )}

            <input
              className="form-input"
              style={{ width: '100%', marginBottom: 6, fontSize: 13 }}
              placeholder="Search by name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="form-input"
              style={{ width: '100%', fontSize: 13 }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', flex: 1, overflowY: 'auto' }}>
            {loading && (
              <p className="empty-state" style={{ padding: '12px 18px' }}>Loading…</p>
            )}
            {error && (
              <p className="empty-state" style={{ padding: '12px 18px', color: '#B91C1C' }}>{error}</p>
            )}
            {filtered.map((c) => {
              const meta = RISK_META[c.latest_risk_level as RiskLevel] ?? RISK_META.LOW;
              return (
                <div
                  key={c.id}
                  className={`cases-row${selectedId === c.id ? ' cases-row--active' : ''}`}
                  onClick={() => selectChild(c.id)}
                >
                  <div className="case-avatar">{c.full_name[0]}</div>
                  <div className="case-info">
                    <p className="case-name">{c.full_name}</p>
                    <span
                      className="risk-badge"
                      style={{ background: meta.bg, color: meta.text, fontSize: 11 }}
                    >
                      <span className="risk-dot" style={{ background: meta.dot }} />
                      {meta.label}
                    </span>
                  </div>
                </div>
              );
            })}
            {!loading && !error && filtered.length === 0 && (
              <p className="empty-state" style={{ padding: '12px 18px' }}>No youth found.</p>
            )}
          </div>

        </aside>

        {/* ── Main detail panel ────────────────────────────────────── */}
        <div className="case-detail">
          <div className="page-header">
            <div>
              <h1 className="page-title">Youth Catalogue</h1>
              <p className="page-sub">All youth profiles under your care.</p>
            </div>
            <button className="btn btn--primary btn--sm" onClick={openModal}>
              + New Profile
            </button>
          </div>

          {!selected ? (
            <p className="empty-state">Select a youth from the sidebar to view their profile.</p>
          ) : (
            <>
              <div className="page-header" style={{ marginTop: 16 }}>
                <div>
                  <h1 className="page-title">{selected.full_name}</h1>
                  <p className="page-sub">Youth Profile</p>
                </div>
              </div>

              <div className="case-section">
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                    gap: 20,
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <p className="cell-muted" style={{ fontSize: 12, marginBottom: 2 }}>Age</p>
                    <p>{selected.age ?? '—'}</p>
                  </div>
                  <div>
                    <p className="cell-muted" style={{ fontSize: 12, marginBottom: 2 }}>School</p>
                    <p>{selected.school || '—'}</p>
                  </div>
                  <div>
                    <p className="cell-muted" style={{ fontSize: 12, marginBottom: 2 }}>Category</p>
                    <p>{selected.category || '—'}</p>
                  </div>
                  <div>
                    <p className="cell-muted" style={{ fontSize: 12, marginBottom: 2 }}>Status</p>
                    <p>{selected.status}</p>
                  </div>
                  <div>
                    <p className="cell-muted" style={{ fontSize: 12, marginBottom: 4 }}>Risk Level</p>
                    {(() => {
                      const meta = RISK_META[selected.latest_risk_level as RiskLevel] ?? RISK_META.LOW;
                      return (
                        <span className="risk-badge" style={{ background: meta.bg, color: meta.text }}>
                          <span className="risk-dot" style={{ background: meta.dot }} />
                          {meta.label}
                        </span>
                      );
                    })()}
                  </div>
                </div>

                {selected.interests && (
                  <div>
                    <p className="cell-muted" style={{ fontSize: 12, marginBottom: 4 }}>Interests</p>
                    <p>{selected.interests}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── New Profile Modal ─────────────────────────────────────────────────── */}
      {showModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div
            style={{
              background: 'var(--surface, #fff)',
              borderRadius: 12,
              padding: '28px 32px',
              width: '100%',
              maxWidth: 520,
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 18 }}>New Youth Profile</h2>
              <button
                onClick={closeModal}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--text-muted, #888)' }}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {formError && (
              <p style={{ color: '#B91C1C', fontSize: 13, marginBottom: 14, padding: '8px 12px', background: '#FEF2F2', borderRadius: 6 }}>
                {formError}
              </p>
            )}

            <form onSubmit={(e) => { void handleSubmit(e); }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              <label className="field-label" style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
                Full Name <span style={{ color: '#B91C1C' }}>*</span>
                <input
                  className="form-input"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleFormChange}
                  placeholder="e.g. Alex Tan"
                  autoFocus
                />
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <label className="field-label" style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
                  Age
                  <input
                    className="form-input"
                    type="number"
                    name="age"
                    value={form.age as string}
                    onChange={handleFormChange}
                    min={0}
                    max={25}
                    placeholder="e.g. 15"
                  />
                </label>
                <label className="field-label" style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
                  School
                  <input
                    className="form-input"
                    name="school"
                    value={form.school}
                    onChange={handleFormChange}
                    placeholder="e.g. Northview Sec"
                  />
                </label>
              </div>

              <label className="field-label" style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
                Interests
                <textarea
                  className="form-input"
                  name="interests"
                  value={form.interests}
                  onChange={handleFormChange}
                  rows={2}
                  placeholder="e.g. Basketball, drawing, music"
                />
              </label>

              <label className="field-label" style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
                Category
                <input
                  className="form-input"
                  name="category"
                  value={form.category}
                  onChange={handleFormChange}
                  placeholder="e.g. At-risk, School dropout"
                />
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <label className="field-label" style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
                  Status
                  <select className="form-input" name="status" value={form.status} onChange={handleFormChange}>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </label>
                <label className="field-label" style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
                  Initial Risk Level
                  <select className="form-input" name="latest_risk_level" value={form.latest_risk_level} onChange={handleFormChange}>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </label>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
                <button
                  type="button"
                  className="btn btn--outline"
                  onClick={closeModal}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={submitting}
                >
                  {submitting ? 'Creating…' : 'Create Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ChildCatalog;
