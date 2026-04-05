import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import './index.css';

export default function App() {
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    fetch('/api/me', { credentials: 'include' })
      .then(r => r.json())
      .then(d => setAuth(d));
  }, []);

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
      </Routes>
    </BrowserRouter>
  );
}
