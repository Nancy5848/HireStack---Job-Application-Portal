import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const dashboardPath = user?.role === 'recruiter' ? '/recruiter/dashboard' : '/student/dashboard';

  return (
    <nav className="hs-glass" style={{ position: 'sticky', top: 0, zIndex: 50 }}>
      <div className="hs-container d-flex align-items-center justify-content-between py-3">
        <Link to="/" className="hs-display fw-bold fs-4 hs-gradient-text">
          Hirestack
        </Link>

        <div className="d-flex align-items-center gap-3">
          <Link to="/jobs" className="d-none d-md-inline text-decoration-none" style={{ color: 'var(--hs-text-dim)' }}>
            Browse Jobs
          </Link>

          <button
            className="hs-btn hs-btn-outline"
            style={{ padding: '8px 12px' }}
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            <i className={`bi ${theme === 'dark' ? 'bi-sun' : 'bi-moon-stars'}`} />
          </button>

          <NotificationBell />

          {user ? (
            <>
              <Link to={dashboardPath} className="hs-btn hs-btn-outline">
                Dashboard
              </Link>
              <button className="hs-btn hs-btn-primary" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hs-btn hs-btn-outline">
                Log in
              </Link>
              <Link to="/register" className="hs-btn hs-btn-primary">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
