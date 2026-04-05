import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import csv, jwt
from datetime import datetime, timedelta
from functools import wraps
import database as db

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "health-centre-key-2024")

# ── CORS: allow Netlify + localhost ───────────────────────
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")
CORS(app, resources={r"/api/*": {"origins": [FRONTEND_URL, "http://localhost:3000"]}})

# ── JWT HELPERS ───────────────────────────────────────────
def make_token(user, role):
    payload = {
        "user": user,
        "role": role,
        "exp": datetime.utcnow() + timedelta(hours=12)
    }
    return jwt.encode(payload, app.secret_key, algorithm="HS256")

def decode_token(token):
    try:
        return jwt.decode(token, app.secret_key, algorithms=["HS256"])
    except:
        return None

def get_current_user():
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        return decode_token(auth[7:])
    return None

def require_role(role):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            user = get_current_user()
            if not user or user.get("role") != role:
                return jsonify({"error": "Unauthorized"}), 401
            return f(user, *args, **kwargs)
        return wrapper
    return decorator

# ── AUTH ──────────────────────────────────────────────────
@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    uid, pwd = data.get("uid", ""), data.get("password", "")
    student = db.get_student(uid)
    if student and student[0] == pwd:
        return jsonify({"success": True, "role": "student", "user": uid, "token": make_token(uid, "student")})
    if db.check_admin(uid, pwd):
        return jsonify({"success": True, "role": "admin", "user": uid, "token": make_token(uid, "admin")})
    return jsonify({"success": False, "message": "Invalid credentials!"})

@app.route("/api/logout", methods=["POST"])
def logout():
    return jsonify({"success": True})

@app.route("/api/me")
def me():
    user = get_current_user()
    if user:
        return jsonify({"user": user["user"], "role": user["role"]})
    return jsonify({"user": None, "role": None})

# ── STUDENT ───────────────────────────────────────────────
@app.route("/api/appointments")
@require_role("student")
def get_appointments(user):
    return jsonify(db.get_appointments(user["user"]))

@app.route("/api/book-appointment", methods=["POST"])
@require_role("student")
def book_appointment(user):
    data = request.get_json()
    time = int(data.get("time", 0))
    if time < 11:
        return jsonify({"success": False, "message": "Appointments allowed only after 11:00 AM"})
    db.add_appointment(user["user"], data["date"], time, data["reason"])
    return jsonify({"success": True, "message": "Appointment booked successfully!"})

@app.route("/api/book-psychiatrist", methods=["POST"])
@require_role("student")
def book_psychiatrist(user):
    data = request.get_json()
    date = data.get("date", "")
    if datetime.strptime(date, "%Y-%m-%d").weekday() != 3:
        return jsonify({"success": False, "message": "Psychiatrist appointments only available on Thursdays"})
    db.add_psychiatrist_appointment(date, data["time"])
    return jsonify({"success": True, "message": "Anonymous psychiatrist appointment booked!"})

@app.route("/api/change-password", methods=["POST"])
@require_role("student")
def change_password(user):
    data = request.get_json()
    student = db.get_student(user["user"])
    if not student or student[0] != data.get("current_password"):
        return jsonify({"success": False, "message": "Current password is incorrect"})
    db.update_student_password(user["user"], data["new_password"])
    return jsonify({"success": True, "message": "Password changed successfully!"})

# ── ADMIN ─────────────────────────────────────────────────
@app.route("/api/admin/dashboard")
@require_role("admin")
def admin_dashboard(user):
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
@require_role("admin")
def manage_appointment(user):
    data = request.get_json()
    apt_id = int(data["apt_id"])
    status = "Approved" if data["action"] == "approve" else "Rejected"
    if data.get("type") == "psychiatrist":
        db.update_psychiatrist_status(apt_id, status)
    else:
        db.update_appointment_status(apt_id, status)
    return jsonify({"success": True})

@app.route("/api/create-student", methods=["POST"])
@require_role("admin")
def create_student(user):
    data = request.get_json()
    sid, pwd, email = data.get("sid",""), data.get("password",""), data.get("email","")
    try:
        num = int(str(sid).replace("727823TUAD", ""))
        if not str(sid).startswith("727823TUAD") or not (101 <= num <= 163):
            return jsonify({"success": False, "message": "Roll No must be between 727823TUAD101 and 727823TUAD163"})
    except:
        return jsonify({"success": False, "message": "Invalid Roll No format"})
    if db.get_student(sid):
        return jsonify({"success": False, "message": "Student ID already exists"})
    db.add_student(sid, pwd, email)
    return jsonify({"success": True, "message": "Student account created successfully!"})

@app.route("/api/add-expense", methods=["POST"])
@require_role("admin")
def add_expense(user):
    data = request.get_json()
    db.add_expense(data["month"], int(data["tablet"]), int(data["lab"]), int(data["doctor"]))
    return jsonify({"success": True, "message": "Expense added successfully!"})

@app.route("/api/download-expense-csv")
def download_csv():
    # Accept token from Authorization header OR query param (for file downloads)
    token_str = request.headers.get("Authorization", "").replace("Bearer ", "") or request.args.get("token", "")
    user = decode_token(token_str)
    if not user or user.get("role") != "admin":
        return jsonify({"error": "Unauthorized"}), 401
    expenses_path = os.path.join(os.path.dirname(__file__), "data", "expenses.csv")
    if not os.path.exists(expenses_path):
        with open(expenses_path, "w", newline="") as f:
            csv.writer(f).writerow(["Month", "Tablet", "LabTest", "DoctorFee", "Total"])
    return send_file(expenses_path, as_attachment=True)

@app.route("/api/update-student-email", methods=["POST"])
@require_role("admin")
def update_student_email(user):
    data = request.get_json()
    db.update_student_email(data["student_id"], data["email"])
    return jsonify({"success": True, "message": "Email updated successfully!"})

@app.route("/api/delete-student", methods=["POST"])
@require_role("admin")
def delete_student(user):
    data = request.get_json()
    db.delete_student(data["student_id"])
    return jsonify({"success": True, "message": "Student deleted successfully!"})

if __name__ == "__main__":
    app.run(debug=False, port=5000)
