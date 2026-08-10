import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--hs-border)', marginTop: 80 }}>
      <div className="hs-container py-5 d-flex flex-column flex-md-row justify-content-between gap-4">
        <div>
          <div className="hs-display fw-bold fs-4 hs-gradient-text mb-2">Hirestack</div>
          <p style={{ color: 'var(--hs-text-dim)', maxWidth: 320 }}>
            The hiring platform built for people who ship. Find the role that fits your skills, not just your resume.
          </p>
        </div>

        <div className="d-flex gap-5 flex-wrap">
          <div>
            <div className="fw-semibold mb-2">For Candidates</div>
            <Link to="/jobs" className="d-block mb-1" style={{ color: 'var(--hs-text-dim)' }}>Browse Jobs</Link>
            <Link to="/register" className="d-block mb-1" style={{ color: 'var(--hs-text-dim)' }}>Create Profile</Link>
          </div>
          <div>
            <div className="fw-semibold mb-2">For Recruiters</div>
            <Link to="/register" className="d-block mb-1" style={{ color: 'var(--hs-text-dim)' }}>Post a Job</Link>
            <Link to="/login" className="d-block mb-1" style={{ color: 'var(--hs-text-dim)' }}>Recruiter Login</Link>
          </div>
        </div>
      </div>
      <div className="hs-container pb-4" style={{ color: 'var(--hs-text-dim)', fontSize: '0.85rem' }}>
        © {new Date().getFullYear()} Hirestack. Built for students, by students.
      </div>
    </footer>
  );
}
