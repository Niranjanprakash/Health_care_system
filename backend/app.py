import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from flask import Flask, request, jsonify, session, send_file
from flask_cors import CORS
import csv
from datetime import datetime
import database as db

app = Flask(__name__)
app.secret_key = "health-centre-key-2024"
CORS(app, supports_credentials=True, origins=["http://localhost:3000"])

# ── AUTH ──────────────────────────────────────────────────
@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    uid, pwd = data.get("uid", ""), data.get("password", "")
    student = db.get_student(uid)
    if student and student[0] == pwd:
        session["user"], session["role"] = uid, "student"
        return jsonify({"success": True, "role": "student", "user": uid})
    if db.check_admin(uid, pwd):
        session["user"], session["role"] = uid, "admin"
        return jsonify({"success": True, "role": "admin", "user": uid})
    return jsonify({"success": False, "message": "Invalid credentials!"})

@app.route("/api/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"success": True})

@app.route("/api/me")
def me():
    if "user" in session:
        return jsonify({"user": session["user"], "role": session["role"]})
    return jsonify({"user": None, "role": None})

# ── STUDENT ───────────────────────────────────────────────
@app.route("/api/appointments")
def get_appointments():
    if session.get("role") != "student":
        return jsonify({"error": "Unauthorized"}), 401
    return jsonify(db.get_appointments(session["user"]))

@app.route("/api/book-appointment", methods=["POST"])
def book_appointment():
    if session.get("role") != "student":
        return jsonify({"error": "Unauthorized"}), 401
    data = request.get_json()
    time = int(data.get("time", 0))
    if time < 11:
        return jsonify({"success": False, "message": "Appointments allowed only after 11:00 AM"})
    db.add_appointment(session["user"], data["date"], time, data["reason"])
    return jsonify({"success": True, "message": "Appointment booked successfully!"})

@app.route("/api/book-psychiatrist", methods=["POST"])
def book_psychiatrist():
    if session.get("role") != "student":
        return jsonify({"error": "Unauthorized"}), 401
    data = request.get_json()
    date = data.get("date", "")
    if datetime.strptime(date, "%Y-%m-%d").weekday() != 3:
        return jsonify({"success": False, "message": "Psychiatrist appointments only available on Thursdays"})
    db.add_psychiatrist_appointment(date, data["time"])
    return jsonify({"success": True, "message": "Anonymous psychiatrist appointment booked!"})

@app.route("/api/change-password", methods=["POST"])
def change_password():
    if session.get("role") != "student":
        return jsonify({"error": "Unauthorized"}), 401
    data = request.get_json()
    student = db.get_student(session["user"])
    if not student or student[0] != data.get("current_password"):
        return jsonify({"success": False, "message": "Current password is incorrect"})
    db.update_student_password(session["user"], data["new_password"])
    return jsonify({"success": True, "message": "Password changed successfully!"})

# ── ADMIN ─────────────────────────────────────────────────
@app.route("/api/admin/dashboard")
def admin_dashboard():
    if session.get("role") != "admin":
        return jsonify({"error": "Unauthorized"}), 401
    apts  = db.get_appointments()
    psych = db.get_psychiatrist_appointments()
    students = db.get_all_students()
    return jsonify({
        "analytics": {
            "total":    len(apts) + len(psych),
            "approved": sum(1 for a in apts + psych if a["status"] == "Approved"),
            "rejected": sum(1 for a in apts + psych if a["status"] == "Rejected"),
            "pending":  sum(1 for a in apts + psych if a["status"] == "Pending"),
        },
        "appointments": apts,
        "psych_appointments": psych,
        "students": [{"id": s[0], "email": s[1], "created_at": s[2]} for s in students]
    })

@app.route("/api/manage-appointment", methods=["POST"])
def manage_appointment():
    if session.get("role") != "admin":
        return jsonify({"error": "Unauthorized"}), 401
    data = request.get_json()
    apt_id = int(data["apt_id"])
    status = "Approved" if data["action"] == "approve" else "Rejected"
    if data.get("type") == "psychiatrist":
        db.update_psychiatrist_status(apt_id, status)
    else:
        db.update_appointment_status(apt_id, status)
    return jsonify({"success": True})

@app.route("/api/create-student", methods=["POST"])
def create_student():
    if session.get("role") != "admin":
        return jsonify({"success": False, "message": "Access denied. Only admin can create student accounts."}), 403
    data = request.get_json()
    sid, pwd, email = data.get("sid",""), data.get("password",""), data.get("email","")
    try:
        sid_str = str(sid)
        num = int(sid_str.replace('727823TUAD', ''))
        if not sid_str.startswith('727823TUAD') or not (101 <= num <= 163):
            return jsonify({"success": False, "message": "Roll No must be between 727823TUAD101 and 727823TUAD163"})
    except:
        return jsonify({"success": False, "message": "Invalid Roll No format"})
    if db.get_student(sid):
        return jsonify({"success": False, "message": "Student ID already exists"})
    db.add_student(sid, pwd, email)
    return jsonify({"success": True, "message": "Student account created successfully!"})

@app.route("/api/add-expense", methods=["POST"])
def add_expense():
    if session.get("role") != "admin":
        return jsonify({"error": "Unauthorized"}), 401
    data = request.get_json()
    db.add_expense(data["month"], int(data["tablet"]), int(data["lab"]), int(data["doctor"]))
    return jsonify({"success": True, "message": "Expense added successfully!"})

@app.route("/api/download-expense-csv")
def download_csv():
    if session.get("role") != "admin":
        return jsonify({"error": "Unauthorized"}), 401
    expenses_path = os.path.join(os.path.dirname(__file__), "data", "expenses.csv")
    if not os.path.exists(expenses_path):
        with open(expenses_path, "w", newline="") as f:
            csv.writer(f).writerow(["Month", "Tablet", "LabTest", "DoctorFee", "Total"])
    return send_file(expenses_path, as_attachment=True)

@app.route("/api/update-student-email", methods=["POST"])
def update_student_email():
    if session.get("role") != "admin":
        return jsonify({"error": "Unauthorized"}), 401
    data = request.get_json()
    db.update_student_email(data["student_id"], data["email"])
    return jsonify({"success": True, "message": "Email updated successfully!"})

@app.route("/api/delete-student", methods=["POST"])
def delete_student():
    if session.get("role") != "admin":
        return jsonify({"error": "Unauthorized"}), 401
    data = request.get_json()
    db.delete_student(data["student_id"])
    return jsonify({"success": True, "message": "Student deleted successfully!"})

if __name__ == "__main__":
    app.run(debug=True, port=5000)
