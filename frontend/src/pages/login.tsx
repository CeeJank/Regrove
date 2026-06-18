import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!role) { setError('Please select your role.'); return; }
    if (!form.username || !form.email || !form.password) {
      setError('All fields are required.');
      return;
    }
    // Mock login — replace with real API call
    const mockUser = {
      id: role === 'social_worker' ? 'worker-1' : 'child-1',
      fullName: role === 'social_worker' ? 'Sarah Chen' : 'Alex Rivera',
      username: form.username,
      email: form.email,
      role,
      ...(role === 'child' ? { dateOfBirth: '2008-03-15', assignedWorkerId: 'worker-1', riskLevel: 'medium' as const } : { assignedChildIds: ['child-1', 'child-2', 'child-3'] }),
    };
    login(mockUser as any);
    navigate(role === 'social_worker' ? '/sw/home' : '/child/home');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-brand">
          <span>🌿</span> Regrove
        </Link>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Sign in to continue supporting growth.</p>

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
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                className="form-input"
                type="text"
                placeholder="Enter your username"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              />
            </div>
            {error && <p className="form-error">{error}</p>}
            <button type="submit" className="btn btn--primary btn--full">Sign in</button>
          </form>
        )}

        <p className="auth-switch">
          Don't have an account? <Link to="/register" className="auth-link">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;