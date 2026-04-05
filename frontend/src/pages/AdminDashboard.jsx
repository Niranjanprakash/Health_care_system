import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from '../components/Header';
import Modal from '../components/Modal';
import Toast, { useToast } from '../components/Toast';
import './Dashboard.css';

const api = (url, body) => fetch(url, {
  method: 'POST', credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
}).then(r => r.json());

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    let start = 0; const end = value; const dur = 800;
    const step = end / (dur / 16);
    clearInterval(ref.current);
    ref.current = setInterval(() => {
      start += step;
      if (start >= end) { setDisplay(end); clearInterval(ref.current); }
      else setDisplay(Math.floor(start));
    }, 16);
    return () => clearInterval(ref.current);
  }, [value]);
  return <span>{display}</span>;
}

export default function AdminDashboard({ setAuth }) {
  const [data, setData] = useState(null);
  const [modals, setModals] = useState({ student: false, expense: false, email: false });
  const [studentForm, setStudentForm] = useState({ sid: '', password: '', email: '' });
  const [expenseForm, setExpenseForm] = useState({ month: '', tablet: '', lab: '', doctor: '' });
  const [emailForm, setEmailForm] = useState({ student_id: '', email: '' });
  const [loadingBtn, setLoadingBtn] = useState('');
  const { toasts, add: addToast, remove } = useToast();

  const openModal = (k) => setModals(m => ({ ...m, [k]: true }));
  const closeModal = (k) => setModals(m => ({ ...m, [k]: false }));

  const load = useCallback(() => {
    fetch('/api/admin/dashboard', { credentials: 'include' })
      .then(r => r.json()).then(setData);
  }, []);

  useEffect(() => { load(); }, [load]);

  const logout = async () => {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    setAuth({ user: null, role: null });
  };

  const manageApt = async (apt_id, action, type = 'regular') => {
    await api('/api/manage-appointment', { apt_id, action, type });
    addToast(`Appointment ${action === 'approve' ? 'approved' : 'rejected'} successfully!`, action === 'approve' ? 'success' : 'error');
    load();
  };

  const createStudent = async (e) => {
    e.preventDefault(); setLoadingBtn('student');
    const r = await api('/api/create-student', studentForm);
    setLoadingBtn('');
    addToast(r.message, r.success ? 'success' : 'error');
    if (r.success) { setStudentForm({ sid: '', password: '', email: '' }); setTimeout(() => { closeModal('student'); load(); }, 1200); }
  };

  const addExpense = async (e) => {
    e.preventDefault(); setLoadingBtn('expense');
    const r = await api('/api/add-expense', expenseForm);
    setLoadingBtn('');
    addToast(r.message, r.success ? 'success' : 'error');
    if (r.success) { setExpenseForm({ month: '', tablet: '', lab: '', doctor: '' }); setTimeout(() => closeModal('expense'), 1200); }
  };

  const updateEmail = async (e) => {
    e.preventDefault(); setLoadingBtn('email');
    const r = await api('/api/update-student-email', emailForm);
    setLoadingBtn('');
    addToast(r.message, r.success ? 'success' : 'error');
    if (r.success) { setTimeout(() => { closeModal('email'); load(); }, 1200); }
  };

  const deleteStudent = async (sid) => {
    if (!window.confirm(`Delete student ${sid}? This cannot be undone.`)) return;
    const r = await api('/api/delete-student', { student_id: sid });
    addToast(r.message, r.success ? 'success' : 'error');
    load();
  };

  const total = Number(expenseForm.tablet || 0) + Number(expenseForm.lab || 0) + Number(expenseForm.doctor || 0);

  if (!data) return (
    <div className="loading-screen">
      <div className="loading-spinner" />
      <span>Loading Admin Dashboard...</span>
    </div>
  );

  const { analytics, appointments, psych_appointments, students } = data;

  return (
    <div className="bg">
      <Header title="👨⚕️ Admin Dashboard — Health Care Medical College" onLogout={logout} />
      <div className="dashboard">

        <div className="analytics-section">
          <h2 className="section-title">📊 Real-Time Analytics</h2>
          <div className="analytics-grid">
            {[
              { label: 'Total Appointments', val: analytics.total,    icon: '📋', bg: 'linear-gradient(135deg,#667eea,#764ba2)' },
              { label: 'Approved',           val: analytics.approved, icon: '✅', bg: 'linear-gradient(135deg,#48bb78,#38a169)' },
              { label: 'Pending',            val: analytics.pending,  icon: '⏳', bg: 'linear-gradient(135deg,#ed8936,#dd6b20)' },
              { label: 'Rejected',           val: analytics.rejected, icon: '❌', bg: 'linear-gradient(135deg,#f56565,#e53e3e)' },
            ].map((c, i) => (
              <div key={c.label} className="analytics-card" style={{ background: c.bg, animationDelay: `${i * 0.1}s` }}>
                <div className="card-icon">{c.icon}</div>
                <h3>{c.label}</h3>
                <div className="number"><AnimatedNumber value={c.val} /></div>
              </div>
            ))}
          </div>
        </div>

        <div className="action-section">
          <h2 className="section-title">⚡ Quick Actions</h2>
          <div className="action-grid">
            <div className="action-card" onClick={() => openModal('student')}>
              <span className="action-icon">👨🎓</span>
              <h3>Create Student Account</h3>
              <p>Add new student to the health centre system</p>
            </div>
            <div className="action-card" onClick={() => openModal('expense')}>
              <span className="action-icon">💰</span>
              <h3>Monthly Expense Management</h3>
              <p>Track and manage monthly healthcare expenses</p>
            </div>
          </div>
        </div>

        <div className="card card-anim">
          <h3>📋 Manage Regular Appointments</h3>
          {appointments.length > 0 ? (
            <div className="table-wrap">
              <table className="appointments-table">
                <thead><tr><th>Roll No</th><th>Date</th><th>Time</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {appointments.map(apt => (
                    <tr key={apt.id}>
                      <td><span className="id-badge">{apt.student}</span></td>
                      <td>{apt.date}</td><td>{apt.time}:00</td><td>{apt.reason}</td>
                      <td><span className={`status-badge status-${apt.status.toLowerCase()}`}>{apt.status}</span></td>
                      <td>
                        {apt.status === 'Pending' && <>
                          <button className="btn-approve" onClick={() => manageApt(apt.id, 'approve')}>✅ Approve</button>
                          <button className="btn-reject" onClick={() => manageApt(apt.id, 'reject')}>❌ Reject</button>
                        </>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="empty-msg">No appointments found.</p>}
        </div>

        <div className="card card-anim">
          <h3>🧠 Psychiatrist Appointments <span className="badge-anon">Anonymous</span></h3>
          <p className="warn-text">🔒 Student identities are kept confidential for privacy</p>
          {psych_appointments.length > 0 ? (
            <div className="table-wrap">
              <table className="appointments-table">
                <thead><tr><th>ID</th><th>Date</th><th>Time</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {psych_appointments.map(apt => (
                    <tr key={apt.id}>
                      <td><span className="id-badge">PSYCH-{apt.id}</span></td>
                      <td>{apt.date}</td><td>{apt.time}</td>
                      <td><span className={`status-badge status-${apt.status.toLowerCase()}`}>{apt.status}</span></td>
                      <td>
                        {apt.status === 'Pending' && <>
                          <button className="btn-approve" onClick={() => manageApt(apt.id, 'approve', 'psychiatrist')}>✅ Approve</button>
                          <button className="btn-reject" onClick={() => manageApt(apt.id, 'reject', 'psychiatrist')}>❌ Reject</button>
                        </>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="empty-msg">No psychiatrist appointments found.</p>}
        </div>

        <div className="card card-anim">
          <h3>📧 Student Management</h3>
          {students.length > 0 ? (
            <div className="table-wrap">
              <table className="appointments-table">
                <thead><tr><th>Roll No</th><th>Email</th><th>Created</th><th>Actions</th></tr></thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.id}>
                      <td><span className="id-badge">{s.id}</span></td>
                      <td>{s.email || '—'}</td>
                      <td>{s.created_at || 'N/A'}</td>
                      <td>
                        <button className="btn-edit" onClick={() => { setEmailForm({ student_id: s.id, email: s.email || '' }); openModal('email'); }}>✏️ Email</button>
                        <button className="btn-reject" onClick={() => deleteStudent(s.id)}>🗑️ Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="empty-msg">No students found.</p>}
        </div>

        <div className="card card-anim">
          <h3>📥 Download Reports</h3>
          <a href="/api/download-expense-csv" className="btn btn-green">📊 Download Expense Report (CSV)</a>
        </div>

      </div>

      <Modal show={modals.student} onClose={() => closeModal('student')} title="👨🎓 Create New Student Account">
        <form onSubmit={createStudent}>
          <input value={studentForm.sid} placeholder="Roll No (727823TUAD101–727823TUAD163)" required onChange={e => setStudentForm({ ...studentForm, sid: e.target.value })} />
          <input type="password" value={studentForm.password} placeholder="Default Password" required minLength={6} onChange={e => setStudentForm({ ...studentForm, password: e.target.value })} />
          <input type="email" value={studentForm.email} placeholder="Email Address (Optional)" onChange={e => setStudentForm({ ...studentForm, email: e.target.value })} />
          <button type="submit" disabled={loadingBtn === 'student'}>
            {loadingBtn === 'student' ? <><span className="spinner" /> Creating...</> : '✅ Create Account'}
          </button>
        </form>
      </Modal>

      <Modal show={modals.expense} onClose={() => closeModal('expense')} title="💰 Add Monthly Expense">
        <form onSubmit={addExpense}>
          <input value={expenseForm.month} placeholder="Month (e.g. January 2024)" required onChange={e => setExpenseForm({ ...expenseForm, month: e.target.value })} />
          <input type="number" value={expenseForm.tablet} placeholder="Tablet Expenses (₹)" required min="0" onChange={e => setExpenseForm({ ...expenseForm, tablet: e.target.value })} />
          <input type="number" value={expenseForm.lab} placeholder="Lab Test Expenses (₹)" required min="0" onChange={e => setExpenseForm({ ...expenseForm, lab: e.target.value })} />
          <input type="number" value={expenseForm.doctor} placeholder="Doctor Fee (₹)" required min="0" onChange={e => setExpenseForm({ ...expenseForm, doctor: e.target.value })} />
          {total > 0 && <div className="total-display">💰 Total: ₹{total.toLocaleString()}</div>}
          <button type="submit" disabled={loadingBtn === 'expense'}>
            {loadingBtn === 'expense' ? <><span className="spinner" /> Saving...</> : '💾 Save Expense'}
          </button>
        </form>
      </Modal>

      <Modal show={modals.email} onClose={() => closeModal('email')} title="📧 Update Student Email">
        <form onSubmit={updateEmail}>
          <input value={emailForm.student_id} readOnly style={{ opacity: 0.6 }} />
          <input type="email" value={emailForm.email} placeholder="Email Address" required onChange={e => setEmailForm({ ...emailForm, email: e.target.value })} />
          <button type="submit" disabled={loadingBtn === 'email'}>
            {loadingBtn === 'email' ? <><span className="spinner" /> Updating...</> : '✅ Update Email'}
          </button>
        </form>
      </Modal>

      <Toast toasts={toasts} remove={remove} />
    </div>
  );
}
