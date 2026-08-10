import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = idCounter++;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => {
      setToasts((t) => t.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 200, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            className="hs-card hs-fade-up"
            style={{
              padding: '14px 18px',
              minWidth: 260,
              borderLeft: `4px solid ${t.type === 'error' ? 'var(--hs-danger)' : 'var(--hs-accent-2)'}`,
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}
          >
            <i className={`bi ${t.type === 'error' ? 'bi-x-circle' : 'bi-check-circle'}`} style={{ color: t.type === 'error' ? 'var(--hs-danger)' : 'var(--hs-accent-2)' }} />
            <span className="small">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
