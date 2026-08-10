import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hs-container py-5" style={{ maxWidth: 440 }}>
      <h2 className="fw-bold mb-1 text-center">Reset your password</h2>
      <p className="text-center mb-4" style={{ color: 'var(--hs-text-dim)' }}>
        Enter your email and we'll send you a reset link
      </p>

      <div className="hs-card p-4">
        {sent ? (
          <div className="text-center">
            <i className="bi bi-envelope-check fs-1" style={{ color: 'var(--hs-accent-2)' }} />
            <p className="mt-3">If an account with that email exists, a reset link is on its way.</p>
            <Link to="/login" className="hs-btn hs-btn-outline mt-2">Back to login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger py-2">{error}</div>}
            <div className="mb-4">
              <label className="form-label small fw-semibold">Email</label>
              <input className="hs-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <button className="hs-btn hs-btn-primary w-100" type="submit" disabled={loading}>
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
