import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../Icon';

const ToastCtx = createContext({ show: () => {} });

/** Notifikasi singkat yang juga diumumkan ke pembaca layar (aria-live). */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const show = useCallback((message, opts = {}) => {
    const id = ++idRef.current;
    setToasts((t) => [...t.slice(-2), { id, message, tone: opts.tone || 'success', action: opts.action }]);
    setTimeout(() => dismiss(id), opts.duration || 3200);
  }, [dismiss]);

  const value = useMemo(() => ({ show }), [show]);
  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="toasts" role="status" aria-live="polite" aria-atomic="false">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.tone}`}>
            <span className="toast-ic"><Icon name={t.tone === 'error' ? 'alert' : 'check'} size={16} /></span>
            <span className="toast-msg">{t.message}</span>
            {t.action && <Link className="toast-act" to={t.action.to} onClick={() => dismiss(t.id)}>{t.action.label}</Link>}
            <button type="button" className="toast-x" onClick={() => dismiss(t.id)} aria-label="Tutup notifikasi">
              <Icon name="close" size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);
