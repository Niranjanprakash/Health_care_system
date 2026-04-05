import React, { useState, useEffect, useRef } from 'react';
import { apiPost, setAuth as storeAuth } from '../api';
import './Login.css';

function ParticleCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 3 + 1, dx: (Math.random() - 0.5) * 0.6,
      dy: (Math.random() - 0.5) * 0.6, alpha: Math.random() * 0.5 + 0.2,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.alpha})`; ctx.fill();
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} className="particle-canvas" />;
}

export default function Login({ setAuth }) {
  const [uid, setUid] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [focused, setFocused] = useState('');
  const fullTitle = 'Health Care Medical College';

  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      setTitle(fullTitle.slice(0, ++i));
      if (i >= fullTitle.length) clearInterval(t);
    }, 55);
    return () => clearInterval(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    const data = await apiPost('/api/login', { uid, password });
    setLoading(false);
    if (data.success) {
      storeAuth(data.user, data.role, data.token);
      setAuth({ user: data.user, role: data.role });
    } else {
      setError(data.message);
    }
  };

  return (
    <div className="login-bg">
      <ParticleCanvas />
      <div className="orb orb1" /><div className="orb orb2" /><div className="orb orb3" /><div className="orb orb4" />
      <div className="center-box">
        <div className="login-card">
          <div className="login-top-bar" />
          <div className="login-logo-wrap">
            <div className="login-logo">🏥</div>
            <div className="logo-ring" />
          </div>
          <h2>{title}<span className="cursor">|</span></h2>
          <p>Smart Health Care Management System</p>
          <div className="divider"><span>SECURE LOGIN</span></div>
          <div className="admin-notice">
            <span className="notice-icon">🔒</span>
            <span>Student accounts are created by Admin only. Contact your administrator for access.</span>
          </div>
          {error && <div className="message error shake">⚠️ {error}</div>}
          <form onSubmit={handleSubmit}>
            <div className={`input-group ${focused === 'uid' ? 'focused' : ''}`}>
              <span className="input-icon">👤</span>
              <input value={uid} onChange={e => setUid(e.target.value)}
                onFocus={() => setFocused('uid')} onBlur={() => setFocused('')}
                placeholder="Enter Login ID" required />
              {uid && <span className="input-check">✓</span>}
            </div>
            <div className={`input-group ${focused === 'pwd' ? 'focused' : ''}`}>
              <span className="input-icon">🔑</span>
              <input type={showPwd ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocused('pwd')} onBlur={() => setFocused('')}
                placeholder="Enter Password" required />
              <button type="button" className="pwd-toggle" onClick={() => setShowPwd(s => !s)}>
                {showPwd
                  ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? <><span className="spinner" /> Authenticating...</> : <><span>🔐</span> LOGIN</>}
            </button>
          </form>
          <div className="login-footer">
            <span>🏥 Health Care Medical College</span>
            <span className="secure-tag">🛡️ Secure Portal</span>
          </div>
        </div>
      </div>
    </div>
  );
}
