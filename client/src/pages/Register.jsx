import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', companyName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register(form);
      navigate(user.role === 'recruiter' ? '/recruiter/dashboard' : '/student/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hs-container py-5" style={{ maxWidth: 460 }}>
      <h2 className="fw-bold mb-1 text-center">Create your account</h2>
      <p className="text-center mb-4" style={{ color: 'var(--hs-text-dim)' }}>Join Hirestack as a candidate or recruiter</p>

      <form onSubmit={handleSubmit} className="hs-card p-4">
        {error && <div className="alert alert-danger py-2">{error}</div>}

        <div className="mb-3">
          <label className="form-label small fw-semibold">I am a</label>
          <div className="d-flex gap-2">
            {['student', 'recruiter'].map((r) => (
              <button
                type="button"
                key={r}
                onClick={() => setForm((f) => ({ ...f, role: r }))}
                className="hs-btn flex-fill"
                style={{
                  background: form.role === r ? 'var(--hs-accent-grad)' : 'var(--hs-surface-2)',
                  color: form.role === r ? '#fff' : 'var(--hs-text)'
                }}
              >
                {r === 'student' ? 'Candidate' : 'Recruiter'}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label small fw-semibold">Full name</label>
          <input className="hs-input" name="name" value={form.name} onChange={handleChange} required />
        </div>

        {form.role === 'recruiter' && (
          <div className="mb-3">
            <label className="form-label small fw-semibold">Company name</label>
            <input className="hs-input" name="companyName" value={form.companyName} onChange={handleChange} placeholder="e.g. Acme Technologies" />
          </div>
        )}

        <div className="mb-3">
          <label className="form-label small fw-semibold">Email</label>
          <input className="hs-input" type="email" name="email" value={form.email} onChange={handleChange} required />
        </div>

        <div className="mb-4">
          <label className="form-label small fw-semibold">Password</label>
          <input className="hs-input" type="password" name="password" value={form.password} onChange={handleChange} required minLength={8} />
          <div className="form-text" style={{ color: 'var(--hs-text-dim)' }}>
            At least 8 characters, with upper and lower case letters and a number.
          </div>
        </div>

        <button className="hs-btn hs-btn-primary w-100" type="submit" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="text-center mt-4 small" style={{ color: 'var(--hs-text-dim)' }}>
        Already have an account? <Link to="/login" className="hs-gradient-text fw-semibold">Log in</Link>
      </p>
    </div>
  );
}
