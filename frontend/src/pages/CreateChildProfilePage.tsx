import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createChild, type CreateChildPayload } from '../services/childService';

const EMPTY: CreateChildPayload = {
  full_name: '',
  age: '',
  school: '',
  interests: '',
  category: '',
  status: 'ACTIVE',
  latest_risk_level: 'LOW',
};

export default function CreateChildProfilePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<CreateChildPayload>(EMPTY);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: { target: { name: string; value: string } }) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.full_name.trim()) {
      setError('Full name is required.');
      return;
    }

    const payload: CreateChildPayload = {
      ...form,
      age: form.age !== '' ? Number(form.age) : undefined,
    };

    setSubmitting(true);
    try {
      await createChild(payload);
      setSuccess('Child profile created. Redirecting...');
      setTimeout(() => navigate('/child'), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page-shell">
      <section className="card" style={{ maxWidth: 640 }}>
        <p className="eyebrow">Child Support Platform</p>
        <h1>Create Child Profile</h1>

        <nav className="nav-links" style={{ marginBottom: 20 }}>
          <Link to="/child" className="secondary-btn">← Back to Catalogue</Link>
        </nav>

        {error && <p className="error-box">{error}</p>}
        {success && <p className="success-box">{success}</p>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <label className="field-label">
            Full Name <span style={{ color: '#b91c1c' }}>*</span>
            <input className="field-input" name="full_name" value={form.full_name} onChange={handleChange} placeholder="e.g. Alex Tan" />
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <label className="field-label">
              Age
              <input className="field-input" type="number" name="age" value={form.age} onChange={handleChange} min={0} max={25} placeholder="e.g. 15" />
            </label>
            <label className="field-label">
              School
              <input className="field-input" name="school" value={form.school} onChange={handleChange} placeholder="e.g. Northview Sec" />
            </label>
          </div>

          <label className="field-label">
            Interests
            <textarea
              className="field-input"
              name="interests"
              value={form.interests}
              onChange={handleChange}
              rows={3}
              placeholder="e.g. Basketball, drawing, music - helps workers connect with the child"
            />
          </label>

          <label className="field-label">
            Category
            <input className="field-input" name="category" value={form.category} onChange={handleChange} placeholder="e.g. At-risk, School dropout, Family issues" />
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <label className="field-label">
              Status
              <select className="field-input" name="status" value={form.status} onChange={handleChange}>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="CLOSED">Closed</option>
              </select>
            </label>
            <label className="field-label">
              Initial Risk Level
              <select className="field-input" name="latest_risk_level" value={form.latest_risk_level} onChange={handleChange}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </label>
          </div>

          <button type="submit" className="primary-btn" disabled={submitting} style={{ marginTop: 4 }}>
            {submitting ? 'Creating...' : 'Create Profile'}
          </button>
        </form>
      </section>
    </main>
  );
}
