import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../services/api';
import bgImage from '../images/background/Bg1.png';

const RegisterPage: React.FC = () => {
  const [form, setForm] = useState({ fullName: '', username: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.fullName || !form.username || !form.email || !form.password) {
      setError('Please fill in all required fields.'); return;
    }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const data = await apiFetch<{ token: string; user: User }>('/register', {
        method: 'POST',
        body: JSON.stringify({
          fullName: form.fullName,
          username: form.username,
          email: form.email,
          password: form.password,
        }),
      });
      login(data.user, data.token);
      navigate('/sw/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', minHeight: '100vh' }}>
      <div className="auth-card auth-card--wide">
        <Link to="/" className="auth-brand"><span>🌿</span> Regrove</Link>
        <h1 className="auth-title">Create Social Worker Account</h1>
        <p className="auth-sub">Register to start supporting children through Regrove.</p>
        <div className="role-info-banner">
          <span>👩‍💼</span>
          <div>
            <p style={{ fontWeight: 600, fontSize: 14 }}>Social Worker Registration</p>
            <p style={{ fontSize: 12, color: 'var(--text-mid)' }}>Child accounts are created by social workers from Active Cases after login.</p>
          </div>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" type="text" placeholder="Your full name" value={form.fullName} onChange={set('fullName')} />
            </div>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input className="form-input" type="text" placeholder="Choose a username" value={form.username} onChange={set('username')} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="Your work email" value={form.email} onChange={set('email')} />
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
          <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login" className="auth-link">Sign in</Link></p>
      </div>
    </div>
  );
};

export default RegisterPage;
