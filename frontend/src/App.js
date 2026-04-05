import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { getAuth, apiGet } from './api';
import './index.css';

export default function App() {
  const [auth, setAuthState] = useState(null);

  useEffect(() => {
    const { token, user, role } = getAuth();
    if (token && user && role) {
      // Verify token is still valid
      apiGet('/api/me').then(d => {
        if (d.user) setAuthState({ user: d.user, role: d.role });
        else setAuthState({ user: null, role: null });
      }).catch(() => setAuthState({ user: null, role: null }));
    } else {
      setAuthState({ user: null, role: null });
    }
  }, []);

  const setAuth = (data) => setAuthState(data);

  if (auth === null) return (
    <div className="loading-screen">
      <div className="loading-spinner" />
      <span>🏥 Health Care Medical College</span>
      <small style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>Loading secure portal...</small>
    </div>
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          auth.role ? <Navigate to={auth.role === 'admin' ? '/admin' : '/student'} /> : <Login setAuth={setAuth} />
        } />
        <Route path="/student" element={
          auth.role === 'student' ? <StudentDashboard setAuth={setAuth} /> : <Navigate to="/" />
        } />
        <Route path="/admin" element={
          auth.role === 'admin' ? <AdminDashboard setAuth={setAuth} /> : <Navigate to="/" />
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
