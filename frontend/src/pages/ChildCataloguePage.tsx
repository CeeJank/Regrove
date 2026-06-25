import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchAllChildren, type ChildProfile } from '../services/childService';
import { logout, getCurrentUser } from '../services/authService';

const RISK_COLOURS: Record<string, string> = {
  LOW: '#166534',
  MEDIUM: '#92400e',
  HIGH: '#b91c1c',
  CRITICAL: '#6b21a8',
};

export default function ChildCataloguePage() {
  const navigate = useNavigate();
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const user = getCurrentUser();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    fetchAllChildren()
      .then(setChildren)
      .catch(() => setError('Failed to load child profiles.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = children.filter((child) => {
    const matchName = child.full_name.toLowerCase().includes(search.toLowerCase());
    const matchRisk = riskFilter ? child.latest_risk_level === riskFilter : true;
    const matchStatus = statusFilter ? child.status === statusFilter : true;
    return matchName && matchRisk && matchStatus;
  });

  return (
    <main className="page-shell" style={{ alignItems: 'flex-start' }}>
      <section className="card" style={{ maxWidth: 1000 }}>
        <p className="eyebrow">Child Support Platform</p>
        <h1>Child Catalogue</h1>

        <div className="button-row">
          <Link to="/child/create" className="primary-btn">+ New Profile</Link>
          <Link to="/" className="secondary-btn">Home</Link>
          {user && (
            <span style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--text)', alignSelf: 'center' }}>
              {user.email} ({user.role})
            </span>
          )}
          <button onClick={handleLogout} className="secondary-btn">Logout</button>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <input
            className="field-input"
            style={{ flex: 1, minWidth: 200 }}
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="field-input" style={{ minWidth: 140 }} value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)}>
            <option value="">All risk levels</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
          <select className="field-input" style={{ minWidth: 130 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>

        {loading && <p className="status">Loading...</p>}
        {error && <p className="error-box">{error}</p>}
        {!loading && !error && filtered.length === 0 && <p className="status">No child profiles found.</p>}

        {!loading && !error && filtered.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                  <th style={th}>Name</th>
                  <th style={th}>Age</th>
                  <th style={th}>School</th>
                  <th style={th}>Category</th>
                  <th style={th}>Interests</th>
                  <th style={th}>Status</th>
                  <th style={th}>Risk</th>
                  <th style={th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((child) => (
                  <tr key={child.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ ...td, fontWeight: 600 }}>{child.full_name}</td>
                    <td style={td}>{child.age ?? '—'}</td>
                    <td style={td}>{child.school || '—'}</td>
                    <td style={td}>{child.category || '—'}</td>
                    <td style={{ ...td, maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {child.interests || '—'}
                    </td>
                    <td style={td}>{child.status}</td>
                    <td style={td}>
                      <span style={{
                        color: RISK_COLOURS[child.latest_risk_level] || '#374151',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                      }}>
                        {child.latest_risk_level}
                      </span>
                    </td>
                    <td style={td}>
                      <Link to={`/child/${child.id}`} className="secondary-btn" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

const th = { padding: '8px 12px', fontWeight: 600 } as const;
const td = { padding: '8px 12px' } as const;
