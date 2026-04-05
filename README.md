# 🏥 Smart College Health Centre Management System with AI & Analytics

## 📋 Project Overview

A comprehensive, modern web-based health management system designed for Sri Ramakrishna Engineering College. This system features dual portals (Student & Admin), AI-powered health assistance, anonymous mental health support, and advanced analytics dashboard.

## 🚀 Features

### 🎓 Student Portal
- **Secure Authentication**: Role-based login with session management
- **Appointment Booking**: Time-restricted booking (after 11:00 AM only)
- **AI Health Chatbot**: Button-based health assistant with medical guidance
- **Anonymous Psychiatrist Booking**: Thursday-only confidential appointments
- **Password Management**: Secure password change functionality
- **Appointment History**: View all past and current appointments

### 👨⚕️ Admin Portal
- **Real-time Analytics Dashboard**: Live statistics with animated cards
- **Appointment Management**: Approve/reject regular and psychiatrist appointments
- **Student Account Creation**: Manage student registrations with email support (ID: 71812305101-71812305166)
- **Student Email Management**: Add, update, and remove student email addresses
- **Student Account Deletion**: Remove student accounts from the system
- **Expense Management**: Track monthly healthcare expenses with auto-calculation
- **CSV Export**: Download expense reports
- **Anonymous Privacy**: Psychiatrist appointments maintain student confidentiality

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Python Flask
- **Database**: MySQL
- **UI Framework**: Custom CSS with animations
- **Design**: Responsive, gradient-based modern interface

## 📁 Project Structure

```
Health-care-system/
├── app.py                 # Main Flask application
├── database.py           # MySQL database handler
├── setup_db.py          # Database setup script
├── requirements.txt     # Python dependencies
├── static/
│   ├── css/
│   │   └── style.css     # Modern CSS with animations
│   └── js/
│       └── chatbot.js    # AI health assistant
├── templates/
│   ├── login.html        # Common login page
│   ├── student_dashboard.html  # Student portal
│   └── admin_dashboard.html    # Admin portal
└── README.md           # Project documentation
```

## 🔧 Installation & Setup

### Prerequisites
- Python 3.7+
- MySQL Server 8.0+
- Flask
- mysql-connector-python

### Installation Steps

1. **Clone/Download the project**
   ```bash
   cd Health-care-system
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Setup MySQL Database**
   - Start your MySQL server
   - Update database credentials in `database.py` and `setup_db.py`
   - Run the database setup:
   ```bash
   python setup_db.py
   ```

4. **Run the application**
   ```bash
   python app.py
   ```

5. **Access the system**
   - Open browser and go to: `http://localhost:5000`

## 🔐 Login Credentials

### Student Accounts
- **Student ID Range**: 71812305101 to 71812305166
- **Sample Accounts**:
  - ID: `71812305101`, Password: `student123`
  - ID: `71812305102`, Password: `password123`
  - ID: `71812305103`, Password: `health2024`

### Admin Account
- **Username**: `admin`
- **Password**: `admin@health`

## 📊 System Features in Detail

### 🤖 AI Health Chatbot
- **Fever**: Paracetamol recommendations with dosage
- **Headache**: Crocin/pain relief guidance
- **Cold & Cough**: Cetirizine and home remedies
- **Stomach Pain**: Antacid suggestions and dietary advice
- **Stress/Anxiety**: Mental health support and psychiatrist referral

### 📅 Appointment System
- **Time Restriction**: Bookings only after 11:00 AM
- **Status Tracking**: Pending → Approved/Rejected
- **Real-time Updates**: Instant status notifications

### 🧠 Mental Health Support
- **Anonymous Booking**: Student identity protected
- **Thursday Only**: Psychiatrist available on Thursdays
- **Confidential**: Admin cannot see student details

### 💰 Expense Management
- **Auto-calculation**: Total expenses computed automatically
- **CSV Export**: Download financial reports
- **Monthly Tracking**: Organized by month and category

## 🎨 UI/UX Features

### Design Elements
- **Gradient Backgrounds**: Professional medical theme
- **Card-based Layout**: Modern dashboard design
- **Smooth Animations**: Hover effects, transitions, loading states
- **Responsive Design**: Mobile, tablet, desktop compatible

### Animation Features
- **Loading Spinners**: Form submission feedback
- **Slide Animations**: Modal popups and notifications
- **Hover Effects**: Interactive button responses
- **Pulse Effects**: Analytics card highlights

## 🔒 Security Features

- **Session Management**: Secure user sessions
- **Role-based Access**: Students cannot access admin features
- **Input Validation**: Form data validation and sanitization
- **Anonymous Privacy**: Psychiatrist appointments maintain confidentiality
- **Password Security**: Secure password change functionality

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Tablet Support**: Perfect tablet experience
- **Desktop Enhanced**: Full desktop functionality
- **Cross-browser**: Compatible with all modern browsers

## 🚀 Advanced Features

1. **Real-time Analytics**: Live dashboard updates
2. **AI Integration**: Intelligent health recommendations
3. **Anonymous System**: Privacy-focused mental health support
4. **Auto-validation**: Time and day constraint enforcement
5. **Export Functionality**: CSV download capabilities
6. **Modern UI**: Professional animations and transitions

## 📈 Analytics Dashboard

The admin dashboard provides real-time insights:
- **Total Appointments**: All booking statistics
- **Approval Rates**: Success/rejection ratios
- **Pending Queue**: Awaiting review count
- **Visual Cards**: Color-coded status indicators

## 🎯 Project Suitability

This system is designed for:
- ✅ College project submission
- ✅ Technical presentations (PPT)
- ✅ Viva voce demonstrations
- ✅ Real-world simulation
- ✅ Portfolio showcase

## 🗄️ Database Structure

### MySQL Tables
- **students**: Student accounts with email management
- **appointments**: Regular medical appointments
- **psychiatrist_appointments**: Anonymous mental health appointments
- **expenses**: Monthly healthcare expense tracking
- **admins**: Administrator accounts

### Key Features
- **Email Management**: Admin can add/update/remove student emails
- **Data Integrity**: Foreign key relationships maintain data consistency
- **Anonymous Privacy**: Psychiatrist appointments don't store student IDs
- **Audit Trail**: Timestamps for all records

## 🔧 Customization

### Adding New Students
Admin can create accounts with IDs in range: 71812305101-71812305166

### Modifying AI Responses
Edit `static/js/chatbot.js` to customize health recommendations

### Styling Changes
Modify `static/css/style.css` for UI customizations

## 🐛 Troubleshooting

### Common Issues
1. **Port Already in Use**: Change port in `app.py`
2. **File Permissions**: Ensure write access to JSON/CSV files
3. **Browser Cache**: Clear cache for CSS/JS updates

### Error Handling
- Invalid login attempts are logged
- Form validation prevents invalid data
- Session timeouts redirect to login

## 📞 Support

For technical support or questions:
- Check the code comments for implementation details
- Verify file permissions for data storage
- Ensure Flask is properly installed

## 🏆 Project Highlights

- **Professional Grade**: Industry-standard code quality
- **Modern Design**: Contemporary UI/UX principles
- **Comprehensive Features**: Complete healthcare management
- **Security Focused**: Robust authentication and privacy
- **Scalable Architecture**: Easy to extend and modify

---

**Developed for Sri Ramakrishna Engineering College**  
*Smart Health Centre Management System with AI & Analytics*