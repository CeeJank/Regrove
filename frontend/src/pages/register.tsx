import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage: React.FC = () => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [form, setForm] = useState({
    fullName: '', dateOfBirth: '', username: '', email: '', password: '', confirm: '',
  });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!role) { setError('Please select your role.'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (!form.fullName || !form.username || !form.email || !form.password) {
      setError('Please fill in all required fields.'); return;
    }
    if (role === 'child' && !form.dateOfBirth) {
      setError('Date of birth is required for youth accounts.'); return;
    }
    // Mock register — replace with real API call
    const mockUser = {
      id: `user-${Date.now()}`,
      fullName: form.fullName,
      username: form.username,
      email: form.email,
      role,
      ...(role === 'child'
        ? { dateOfBirth: form.dateOfBirth, assignedWorkerId: 'worker-1', riskLevel: 'low' as const }
        : { assignedChildIds: [] }),
    };
    login(mockUser as any);
    navigate(role === 'social_worker' ? '/sw/home' : '/child/home');
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--wide">
        <Link to="/" className="auth-brand">
          <span>🌿</span> Regrove
        </Link>
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-sub">Start your journey with Regrove today.</p>

        <div className="role-selector">
          <button
            type="button"
            className={`role-btn${role === 'social_worker' ? ' role-btn--active' : ''}`}
            onClick={() => setRole('social_worker')}
          >
            👩‍💼 Social Worker
          </button>
          <button
            type="button"
            className={`role-btn${role === 'child' ? ' role-btn--active' : ''}`}
            onClick={() => setRole('child')}
          >
            🧑 Youth
          </button>
        </div>

        {role && (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" type="text" placeholder="Full name" value={form.fullName} onChange={set('fullName')} />
              </div>
              {role === 'child' && (
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input className="form-input" type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} />
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input className="form-input" type="text" placeholder="Choose a username" value={form.username} onChange={set('username')} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="Your email address" value={form.email} onChange={set('email')} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" placeholder="Create password" value={form.password} onChange={set('password')} />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input className="form-input" type="password" placeholder="Repeat password" value={form.confirm} onChange={set('confirm')} />
              </div>
            </div>
            {error && <p className="form-error">{error}</p>}
            <button type="submit" className="btn btn--primary btn--full">Create account</button>
          </form>
        )}

        <p className="auth-switch">
          Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;