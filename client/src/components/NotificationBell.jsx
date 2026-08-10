import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const load = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      /* silent — notifications are non-critical */
    }
  };

  useEffect(() => {
    if (!user) return;
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    load();
  };

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    load();
  };

  if (!user) return null;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button className="hs-btn hs-btn-outline" style={{ padding: '8px 12px', position: 'relative' }} onClick={() => setOpen((o) => !o)} aria-label="Notifications">
        <i className="bi bi-bell" />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute', top: -4, right: -4, background: 'var(--hs-danger)',
              color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: '0.65rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="hs-card hs-fade-up"
          style={{ position: 'absolute', right: 0, top: 48, width: 340, maxHeight: 420, overflowY: 'auto', zIndex: 100, padding: 0 }}
        >
          <div className="d-flex justify-content-between align-items-center p-3" style={{ borderBottom: '1px solid var(--hs-border)' }}>
            <span className="fw-semibold">Notifications</span>
            {unreadCount > 0 && (
              <button className="btn btn-link p-0 small" style={{ color: 'var(--hs-accent)' }} onClick={markAllRead}>
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 && (
            <div className="p-4 text-center small" style={{ color: 'var(--hs-text-dim)' }}>
              You're all caught up.
            </div>
          )}

          {notifications.map((n) => (
            <Link
              key={n._id}
              to={n.link || '#'}
              onClick={() => markRead(n._id)}
              className="d-block p-3"
              style={{
                borderBottom: '1px solid var(--hs-border)',
                background: n.isRead ? 'transparent' : 'var(--hs-surface-2)'
              }}
            >
              <div className="small fw-semibold mb-1">{n.type}</div>
              <div className="small" style={{ color: 'var(--hs-text-dim)' }}>{n.message}</div>
              <div className="small mt-1" style={{ color: 'var(--hs-text-dim)', fontSize: '0.7rem' }}>
                {new Date(n.createdAt).toLocaleDateString()}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
