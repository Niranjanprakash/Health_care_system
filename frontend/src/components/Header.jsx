import React, { useState, useEffect } from 'react';
import './Header.css';

export default function Header({ title, onLogout }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="header">
      <div className="header-left">
        <div className="header-pulse" />
        <span className="header-title">{title}</span>
      </div>
      <div className="header-right">
        <div className="header-clock">
          🕐 {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
        <button className="logout-btn" onClick={onLogout}>🚪 Logout</button>
      </div>
    </div>
  );
}
