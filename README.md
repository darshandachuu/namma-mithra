# ನಮ್ಮ ಮಿತ್ರ (Namma Mithra)

<p align="center">
  <img src="frontend/public/logo.png" alt="Namma Mithra Logo" width="340" />
</p>

<p align="center">
  <em>MCA Final Year Project</em>
</p>

[![Technology: Flask](https://img.shields.io/badge/Backend-Flask%203.1-blue.svg)](https://flask.palletsprojects.com/)
[![Technology: React](https://img.shields.io/badge/Frontend-React%2018%20+%20Vite-61dafb.svg)](https://react.dev/)
[![Database: MySQL 8](https://img.shields.io/badge/Database-MySQL%208.0-orange.svg)](https://www.mysql.com/)
[![Tests: 15 Passed](https://img.shields.io/badge/Tests-15%2F15%20Passing-brightgreen.svg)]()
[![Academic Project: MCA Final Year](https://img.shields.io/badge/Degree-MCA%20Final%20Year%20Project-purple.svg)]()

**ನಮ್ಮ ಮಿತ್ರ (Namma Mithra)** is an attractive, modern, full-stack campus complaint and facility maintenance management system engineered for educational institutions. Styled in the rich institutional crimson and gold identity of the Namma Mithra emblem, it provides a transparent, accountable pipeline connecting students, maintenance staff, and campus administrators.

---

## 🌟 Key System Capabilities

1. **Rule-Based Explainable Priority Engine**:
   - Scores each complaint out of 100 based on institutional formulas:
     $$P = S + A + T + C$$
     - **$S$ (Severity)**: Max 40 marks
     - **$A$ (Affected Users)**: Max 30 marks
     - **$T$ (Pending Aging Duration)**: Max 20 marks
     - **$C$ (Community Support Upvotes)**: Max 10 marks
   - Categorizes tickets into **Critical** (80-100), **High** (60-79), **Medium** (35-59), and **Low** (0-34).
   - Generates transparent breakdown cards and logs priority history in `complaint_priority_history`.

2. **Manual Defect Photograph Upload**:
   - Students upload JPG, JPEG, PNG, or WEBP photos of defects (broken projector, sparking switchboard, leaking tap).
   - Real-time client-side preview with size validation ($\le 5\text{MB}$) and file removal.
   - Secure backend storage using UUIDs with database path persistence in `complaint_images`.
   - Authorized staff and administrators can inspect defect photos before visiting physical sites.

3. **Deterministic Duplicate Prevention & Upvoting**:
   - Automatically detects active open complaints matching the selected Category and Location.
   - Students can click **"+1 Support Existing Issue Instead"**, which boosts the complaint's priority score and avoids duplicate maintenance tickets.

4. **Multi-Role RBAC Architecture**:
   - **Student Portal**: File complaints with photos, track status timeline, upvote community tickets.
   - **Staff Workstation**: Manage assigned work orders, update status (`in_progress`, `resolved`), log materials/progress remarks.
   - **Admin Control Center**: Visual KPI metrics, Recharts analytics, technician work order dispatch, user/category/location CRUD, SLA performance reporting.

---

## 🏗️ Technology Stack

| Layer | Component | Version / Description |
|---|---|---|
| **Frontend** | React.js (Vite) | Single Page Application (SPA), React 18 |
| **UI Framework** | Bootstrap 5 & Custom CSS | Responsive layout, modern elevated cards, accessible forms |
| **Icons & Visuals** | Lucide React | Lightweight, scalable vector UI icons |
| **Data Analytics** | Recharts | Interactive pie and bar charts for complaint analytics |
| **Backend** | Python 3.14+ / Flask | Modular Blueprint architecture, REST API |
| **Authentication** | Flask-JWT-Extended | Stateless Bearer token authentication |
| **Password Security** | Werkzeug Hashing | Salted PBKDF2 / Scrypt password hashing |
| **Image Processing**| Pillow (PIL) | MIME type validation, file integrity check |
| **ORM** | Flask-SQLAlchemy | 10 Relational database entities |
| **Database** | MySQL 8.0 | Full schema DDL, seeds, constraints (with SQLite fallback) |
| **Testing** | Pytest | 15 Automated unit and integration test cases |

---

## 🗄️ Database Architecture (10 MySQL Tables)

```
1. users                       -> Students, staff technicians, and campus administrators
2. categories                  -> Projector, Electrical, Water, Network, Furniture, Cleanliness
3. locations                   -> Campus buildings, blocks, floors, and room numbers
4. complaints                  -> Main maintenance ticket details and priority scores
5. complaint_images            -> Uploaded defect photographs and server file paths
6. complaint_supports          -> Community support (+1) upvotes per user and complaint
7. assignments                 -> Technician dispatch records with admin instructions
8. status_history              -> Chronological audit log of all status transitions
9. notifications               -> User in-app notifications for status and assignments
10. complaint_priority_history -> Historical log of priority score changes over time
```

---

## 🚀 Quick Start Guide (Windows CMD)

### Prerequisites:
- Python 3.10+ installed and on system PATH
- Node.js 18+ and npm installed
- MySQL 8.0 (Optional: If MySQL is offline, the backend automatically uses SQLite for instant demonstration)

---

### Step 1: Database Setup (MySQL 8)
Open Windows Command Prompt:
```cmd
cd "c:\Users\mca.d\Desktop\project 1"
mysql -u root -p < database\schema.sql
mysql -u root -p < database\seed_data.sql
```
*(Or simply double-click `init_database.bat`)*

---

### Step 2: Run Backend Server (Flask)
```cmd
cd "c:\Users\mca.d\Desktop\project 1\backend"
python run.py
```
- Server starts on: **`http://127.0.0.1:5000`**
- REST API Base: **`http://127.0.0.1:5000/api`**

---

### Step 3: Run Frontend Server (React + Vite)
Open a second Windows Command Prompt:
```cmd
cd "c:\Users\mca.d\Desktop\project 1\frontend"
npm run dev
```
- Client opens at: **`http://localhost:3000`**

*(Or simply double-click `start_all.bat` to launch both servers in separate windows)*

---

## 👥 Demo User Accounts (Auto-fill Buttons on Login Page)

| Role | Email Address | Password | Primary Functions |
|---|---|---|---|
| **Student** | `student@campuscare.edu` | `password123` | Submit complaints, upload photos, upvote peer issues |
| **Staff Technician** | `staff@campuscare.edu` | `password123` | View assigned tasks, update status to `in_progress` / `resolved` |
| **Administrator** | `admin@campuscare.edu` | `password123` | Dispatch technicians, view charts, manage users & categories, export reports |

---

## 🧪 Automated Testing

CampusCare includes automated backend test coverage:
```cmd
cd backend
python -m pytest tests -v
```

### Results:
```text
tests/test_assignments.py::test_admin_assign_complaint PASSED            [  6%]
tests/test_assignments.py::test_staff_update_status PASSED               [ 13%]
tests/test_assignments.py::test_staff_cannot_update_unassigned PASSED    [ 20%]
tests/test_auth.py::test_login_successful PASSED                         [ 26%]
tests/test_auth.py::test_login_invalid_password PASSED                   [ 33%]
tests/test_auth.py::test_register_new_student PASSED                     [ 40%]
tests/test_auth.py::test_register_duplicate_email PASSED                 [ 46%]
tests/test_auth.py::test_get_profile PASSED                              [ 53%]
tests/test_complaints.py::test_get_complaints_list PASSED                [ 60%]
tests/test_complaints.py::test_create_complaint PASSED                   [ 66%]
tests/test_complaints.py::test_get_complaint_details PASSED              [ 73%]
tests/test_complaints.py::test_duplicate_complaint_lookup PASSED         [ 80%]
tests/test_priority.py::test_priority_score_calculation PASSED           [ 86%]
tests/test_priority.py::test_priority_levels PASSED                      [ 93%]
tests/test_priority.py::test_support_impact_on_complaint PASSED          [100%]

============================== 15 passed in 8.87s ===============================
```

---

## 📁 Complete Folder Structure

```
project 1/
│
├── backend/
│   ├── app/
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── category.py
│   │   │   ├── location.py
│   │   │   ├── complaint.py
│   │   │   ├── complaint_image.py
│   │   │   ├── support.py
│   │   │   ├── assignment.py
│   │   │   ├── status_history.py
│   │   │   ├── notification.py
│   │   │   └── priority_history.py
│   │   ├── routes/
│   │   │   ├── auth_routes.py
│   │   │   ├── student_routes.py
│   │   │   ├── complaint_routes.py
│   │   │   ├── staff_routes.py
│   │   │   ├── admin_routes.py
│   │   │   ├── dashboard_routes.py
│   │   │   └── notification_routes.py
│   │   ├── services/
│   │   │   ├── priority_service.py
│   │   │   ├── duplicate_service.py
│   │   │   ├── image_service.py
│   │   │   ├── complaint_service.py
│   │   │   └── notification_service.py
│   │   ├── utils/
│   │   │   ├── decorators.py
│   │   │   ├── validators.py
│   │   │   └── response.py
│   │   ├── uploads/
│   │   │   └── complaints/
│   │   ├── config.py
│   │   ├── extensions.py
│   │   └── __init__.py
│   ├── tests/
│   │   ├── conftest.py
│   │   ├── test_auth.py
│   │   ├── test_complaints.py
│   │   ├── test_priority.py
│   │   └── test_assignments.py
│   ├── run.py
│   ├── requirements.txt
│   ├── .env
│   └── .env.example
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ComplaintCard.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   ├── PriorityBadge.jsx
│   │   │   ├── DuplicateSuggestions.jsx
│   │   │   ├── ImagePreviewModal.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── CreateComplaint.jsx
│   │   │   ├── MyComplaints.jsx
│   │   │   ├── ComplaintDetails.jsx
│   │   │   ├── StaffDashboard.jsx
│   │   │   ├── AssignedComplaints.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AllComplaintsAdmin.jsx
│   │   │   ├── ManageUsers.jsx
│   │   │   ├── ManageCategories.jsx
│   │   │   ├── ManageLocations.jsx
│   │   │   └── Reports.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── complaintService.js
│   │   │   └── dashboardService.js
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/
│   │   │   └── useAuth.js
│   │   ├── utils/
│   │   │   ├── constants.js
│   │   │   └── formatDate.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   └── App.css
│   ├── package.json
│   ├── vite.config.js
│   ├── .env
│   └── .env.example
│
├── database/
│   ├── schema.sql
│   ├── seed_data.sql
│   └── relationships.sql
│
├── docs/
│   ├── project_overview.md
│   ├── requirements.md
│   ├── system_architecture.md
│   ├── er_diagram.md
│   ├── api_documentation.md
│   ├── testing_documentation.md
│   └── viva_questions.md
│
├── deployment/
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── docker-compose.yml
│
├── start_backend.bat
├── start_frontend.bat
├── start_all.bat
├── init_database.bat
├── README.md
└── .gitignore
```

---

## 🎓 Final Demonstration & Viva Checklist

- [x] **Student Registration & Login**: Validated and tested with JWT tokens.
- [x] **Complaint Submission**: Title, Category, Location, Severity, and Affected scope.
- [x] **Defect Photo Upload**: JPG, JPEG, PNG, WEBP with live preview, removal, and secure backend persistence.
- [x] **Duplicate Detection**: Real-time category/location matching with option to upvote existing issues.
- [x] **Rule-Based Priority Score**: $P = S + A + T + C$ calculated out of 100 with explainable breakdown.
- [x] **Community Upvotes**: Dynamically elevates total priority score and records history.
- [x] **Administrator Dispatch**: Assigns maintenance technician with instructions.
- [x] **Staff Execution**: Updates status (`in_progress`, `resolved`) with work progress remarks.
- [x] **Analytics Dashboard**: Recharts charts for status and category distributions.
- [x] **Institutional Reports**: Printable facility performance audit report.
- [x] **15 Automated Unit & Integration Tests**: 100% passing.
