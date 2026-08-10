import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="hs-container py-5 text-center" style={{ paddingTop: 100, paddingBottom: 100 }}>
      <h1 className="display-1 fw-bold hs-gradient-text">404</h1>
      <p className="fs-5 mb-4" style={{ color: 'var(--hs-text-dim)' }}>This page doesn't exist — maybe it was never posted.</p>
      <Link to="/" className="hs-btn hs-btn-primary">Back to home</Link>
    </div>
  );
}
