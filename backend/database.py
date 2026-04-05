import json, csv, os
from datetime import datetime

BASE = os.path.dirname(__file__)
DATA = os.path.join(BASE, "data")

STUDENTS_FILE     = os.path.join(DATA, "students.json")
ADMINS_FILE       = os.path.join(DATA, "admins.json")
APPOINTMENTS_FILE = os.path.join(DATA, "appointments.json")
PSYCH_FILE        = os.path.join(DATA, "psychiatrist.json")
EXPENSES_FILE     = os.path.join(DATA, "expenses.csv")

def _load(file, default):
    if not os.path.exists(file):
        return default
    with open(file, "r") as f:
        return json.load(f)

def _save(file, data):
    with open(file, "w") as f:
        json.dump(data, f, indent=2)

# ── STUDENTS ──────────────────────────────────────────────
def get_student(sid):
    s = _load(STUDENTS_FILE, {}).get(sid)
    if not s:
        return None
    if isinstance(s, dict):
        return (s["password"], s.get("email", ""), s.get("created_at", ""))
    return (s, "", "")

def get_all_students():
    students = _load(STUDENTS_FILE, {})
    return [(sid, v.get("email", "") if isinstance(v, dict) else "",
             v.get("created_at", "") if isinstance(v, dict) else "")
            for sid, v in students.items()]

def add_student(sid, password, email=""):
    students = _load(STUDENTS_FILE, {})
    students[sid] = {"password": password, "email": email,
                     "created_at": datetime.now().strftime("%Y-%m-%d")}
    _save(STUDENTS_FILE, students)

def update_student_email(sid, email):
    students = _load(STUDENTS_FILE, {})
    if sid in students:
        if isinstance(students[sid], dict):
            students[sid]["email"] = email
        else:
            students[sid] = {"password": students[sid], "email": email, "created_at": ""}
        _save(STUDENTS_FILE, students)

def update_student_password(sid, new_password):
    students = _load(STUDENTS_FILE, {})
    if sid in students:
        if isinstance(students[sid], dict):
            students[sid]["password"] = new_password
        else:
            students[sid] = {"password": new_password, "email": "", "created_at": ""}
        _save(STUDENTS_FILE, students)

def delete_student(sid):
    students = _load(STUDENTS_FILE, {})
    students.pop(sid, None)
    _save(STUDENTS_FILE, students)

# ── ADMINS ────────────────────────────────────────────────
def check_admin(username, password):
    return _load(ADMINS_FILE, {}).get(username) == password

# ── APPOINTMENTS ──────────────────────────────────────────
def get_appointments(student_id=None):
    apts = _load(APPOINTMENTS_FILE, [])
    return [a for a in apts if a["student"] == student_id] if student_id else apts

def add_appointment(student_id, date, time, reason):
    apts = _load(APPOINTMENTS_FILE, [])
    new_id = max((a["id"] for a in apts), default=0) + 1
    apts.append({"id": new_id, "student": student_id, "date": date,
                 "time": time, "reason": reason, "status": "Pending"})
    _save(APPOINTMENTS_FILE, apts)

def update_appointment_status(apt_id, status):
    apts = _load(APPOINTMENTS_FILE, [])
    for a in apts:
        if a["id"] == apt_id:
            a["status"] = status
    _save(APPOINTMENTS_FILE, apts)

# ── PSYCHIATRIST ──────────────────────────────────────────
def get_psychiatrist_appointments():
    return _load(PSYCH_FILE, [])

def add_psychiatrist_appointment(date, time):
    apts = _load(PSYCH_FILE, [])
    new_id = max((a["id"] for a in apts), default=0) + 1
    apts.append({"id": new_id, "date": date, "time": time, "status": "Pending"})
    _save(PSYCH_FILE, apts)

def update_psychiatrist_status(apt_id, status):
    apts = _load(PSYCH_FILE, [])
    for a in apts:
        if a["id"] == apt_id:
            a["status"] = status
    _save(PSYCH_FILE, apts)

# ── EXPENSES ──────────────────────────────────────────────
def get_expenses():
    if not os.path.exists(EXPENSES_FILE):
        return []
    with open(EXPENSES_FILE, "r") as f:
        return list(csv.DictReader(f))

def add_expense(month, tablet, lab, doctor):
    total = tablet + lab + doctor
    exists = os.path.exists(EXPENSES_FILE)
    with open(EXPENSES_FILE, "a", newline="") as f:
        w = csv.writer(f)
        if not exists:
            w.writerow(["Month", "Tablet", "LabTest", "DoctorFee", "Total"])
        w.writerow([month, tablet, lab, doctor, total])
