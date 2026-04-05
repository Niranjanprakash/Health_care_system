import React, { useEffect } from 'react';
import './Toast.css';

export default function Toast({ toasts, remove }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`} onClick={() => remove(t.id)}>
          <span className="toast-icon">{t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : 'ℹ️'}</span>
          <span className="toast-msg">{t.message}</span>
          <div className="toast-bar" style={{ animationDuration: `${t.duration}ms` }} />
        </div>
      ))}
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = React.useState([]);
  const add = React.useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type, duration }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), duration);
  }, []);
  const remove = React.useCallback(id => setToasts(t => t.filter(x => x.id !== id)), []);
  return { toasts, add, remove };
}
