import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', rememberMe: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password, form.rememberMe);
      navigate(user.role === 'recruiter' ? '/recruiter/dashboard' : '/student/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hs-container py-5" style={{ maxWidth: 440 }}>
      <h2 className="fw-bold mb-1 text-center">Welcome back</h2>
      <p className="text-center mb-4" style={{ color: 'var(--hs-text-dim)' }}>Log in to continue to Hirestack</p>

      <form onSubmit={handleSubmit} className="hs-card p-4">
        {error && <div className="alert alert-danger py-2">{error}</div>}

        <div className="mb-3">
          <label className="form-label small fw-semibold">Email</label>
          <input className="hs-input" type="email" name="email" value={form.email} onChange={handleChange} required />
        </div>

        <div className="mb-3">
          <label className="form-label small fw-semibold">Password</label>
          <input className="hs-input" type="password" name="password" value={form.password} onChange={handleChange} required minLength={8} />
        </div>

        <div className="d-flex justify-content-between align-items-center mb-4">
          <label className="d-flex align-items-center gap-2 small" style={{ color: 'var(--hs-text-dim)' }}>
            <input type="checkbox" name="rememberMe" checked={form.rememberMe} onChange={handleChange} />
            Remember me
          </label>
          <Link to="/forgot-password" className="small hs-gradient-text">Forgot password?</Link>
        </div>

        <button className="hs-btn hs-btn-primary w-100" type="submit" disabled={loading}>
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <p className="text-center mt-4 small" style={{ color: 'var(--hs-text-dim)' }}>
        Don't have an account? <Link to="/register" className="hs-gradient-text fw-semibold">Sign up</Link>
      </p>
    </div>
  );
}
