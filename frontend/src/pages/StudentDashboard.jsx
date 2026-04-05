import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Chatbot from '../components/Chatbot';
import Toast, { useToast } from '../components/Toast';
import './Dashboard.css';

const api = (url, body) => fetch(url, {
  method: 'POST', credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
}).then(r => r.json());

export default function StudentDashboard({ setAuth }) {
  const today = new Date().toISOString().split('T')[0];
  const [appointments, setAppointments] = useState([]);
  const [aptForm, setAptForm] = useState({ date: '', time: '', reason: '' });
  const [psychForm, setPsychForm] = useState({ date: '', time: '' });
  const [pwdForm, setPwdForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [loadingBtn, setLoadingBtn] = useState('');
  const { toasts, add: addToast, remove } = useToast();

  const loadApts = () => fetch('/api/appointments', { credentials: 'include' }).then(r => r.json()).then(setAppointments);
  useEffect(() => { loadApts(); }, []);

  const logout = async () => {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    setAuth({ user: null, role: null });
  };

  const bookAppointment = async (e) => {
    e.preventDefault(); setLoadingBtn('apt');
    const r = await api('/api/book-appointment', aptForm);
    setLoadingBtn('');
    addToast(r.message, r.success ? 'success' : 'error');
    if (r.success) { setAptForm({ date: '', time: '', reason: '' }); loadApts(); }
  };

  const bookPsych = async (e) => {
    e.preventDefault(); setLoadingBtn('psych');
    const r = await api('/api/book-psychiatrist', psychForm);
    setLoadingBtn('');
    addToast(r.message, r.success ? 'success' : 'error');
    if (r.success) setPsychForm({ date: '', time: '' });
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwdForm.new_password !== pwdForm.confirm_password) { addToast('Passwords do not match!', 'error'); return; }
    setLoadingBtn('pwd');
    const r = await api('/api/change-password', pwdForm);
    setLoadingBtn('');
    addToast(r.message, r.success ? 'success' : 'error');
    if (r.success) setPwdForm({ current_password: '', new_password: '', confirm_password: '' });
  };

  const checkThursday = (val) => {
    if (!val) return '';
    const day = new Date(val + 'T00:00:00').getDay();
    if (day !== 4) { addToast('Only Thursdays available for psychiatrist!', 'error'); return ''; }
    return val;
  };

  const stats = {
    total: appointments.length,
    approved: appointments.filter(a => a.status === 'Approved').length,
    pending: appointments.filter(a => a.status === 'Pending').length,
  };

  return (
    <div className="bg">
      <Header title="👨🎓 Student Dashboard — Health Care Medical College" onLogout={logout} />
      <div className="dashboard">

        {/* Mini Stats */}
        <div className="analytics-grid" style={{ marginBottom: '20px' }}>
          {[
            { label: 'My Appointments', val: stats.total, icon: '📋', bg: 'linear-gradient(135deg,#667eea,#764ba2)' },
            { label: 'Approved', val: stats.approved, icon: '✅', bg: 'linear-gradient(135deg,#48bb78,#38a169)' },
            { label: 'Pending', val: stats.pending, icon: '⏳', bg: 'linear-gradient(135deg,#ed8936,#dd6b20)' },
          ].map((c, i) => (
            <div key={c.label} className="analytics-card" style={{ background: c.bg, animationDelay: `${i * 0.1}s` }}>
              <div className="card-icon">{c.icon}</div>
              <h3>{c.label}</h3>
              <div className="number">{c.val}</div>
            </div>
          ))}
        </div>

        <div className="card card-anim">
          <h3>📅 Book Medical Appointment</h3>
          <form onSubmit={bookAppointment}>
            <input type="date" value={aptForm.date} min={today} required onChange={e => setAptForm({ ...aptForm, date: e.target.value })} />
            <select value={aptForm.time} required onChange={e => setAptForm({ ...aptForm, time: e.target.value })}>
              <option value="">⏰ Select Time</option>
              {[['11','11:00 AM'],['12','12:00 PM'],['13','01:00 PM'],['14','02:00 PM'],['15','03:00 PM'],['16','04:00 PM'],['17','05:00 PM']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <input value={aptForm.reason} placeholder="Reason for visit" required onChange={e => setAptForm({ ...aptForm, reason: e.target.value })} />
            <button type="submit" disabled={loadingBtn === 'apt'}>
              {loadingBtn === 'apt' ? <><span className="spinner" /> Booking...</> : '📋 Book Appointment'}
            </button>
          </form>
        </div>

        <Chatbot />

        <div className="card card-anim">
          <h3>🧠 Psychiatrist Appointment <span className="badge-anon">Anonymous</span></h3>
          <p className="warn-text">⚠️ Available only on Thursdays — Your identity remains confidential</p>
          <form onSubmit={bookPsych}>
            <input type="date" value={psychForm.date} min={today} required onChange={e => setPsychForm({ ...psychForm, date: checkThursday(e.target.value) })} />
            <select value={psychForm.time} required onChange={e => setPsychForm({ ...psychForm, time: e.target.value })}>
              <option value="">⏰ Select Time</option>
              {['10:00 AM','11:00 AM','02:00 PM','03:00 PM','04:00 PM'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <button type="submit" disabled={loadingBtn === 'psych'}>
              {loadingBtn === 'psych' ? <><span className="spinner" /> Booking...</> : '🔒 Book Anonymous Appointment'}
            </button>
          </form>
        </div>

        <div className="card card-anim">
          <h3>🔐 Change Password</h3>
          <form onSubmit={changePassword}>
            <input type="password" value={pwdForm.current_password} placeholder="Current Password" required onChange={e => setPwdForm({ ...pwdForm, current_password: e.target.value })} />
            <input type="password" value={pwdForm.new_password} placeholder="New Password" required minLength={6} onChange={e => setPwdForm({ ...pwdForm, new_password: e.target.value })} />
            <input type="password" value={pwdForm.confirm_password} placeholder="Confirm New Password" required minLength={6} onChange={e => setPwdForm({ ...pwdForm, confirm_password: e.target.value })} />
            <button type="submit" disabled={loadingBtn === 'pwd'}>
              {loadingBtn === 'pwd' ? <><span className="spinner" /> Updating...</> : '🔄 Update Password'}
            </button>
          </form>
        </div>

        <div className="card card-anim">
          <h3>📋 My Appointments</h3>
          {appointments.length > 0 ? (
            <div className="table-wrap">
              <table className="appointments-table">
                <thead><tr><th>#</th><th>Date</th><th>Time</th><th>Reason</th><th>Status</th></tr></thead>
                <tbody>
                  {appointments.map((apt, i) => (
                    <tr key={apt.id}>
                      <td>{i + 1}</td>
                      <td>{apt.date}</td>
                      <td>{apt.time}:00</td>
                      <td>{apt.reason}</td>
                      <td><span className={`status-badge status-${apt.status.toLowerCase()}`}>{apt.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="empty-msg">📅 No appointments yet. Book your first one above!</p>}
        </div>

      </div>
      <Toast toasts={toasts} remove={remove} />
    </div>
  );
}
