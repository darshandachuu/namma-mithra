# CampusCare: Project Overview

## 1. Executive Summary
**CampusCare** is a modern, full-stack campus complaint and facility management web application engineered for colleges and universities. It bridges the gap between students, facility maintenance technicians, and institutional administrators by providing:
- Transparent, rule-based complaint prioritization ($P = S + A + T + C$).
- Manual defect photograph verification with secure storage.
- Real-time detection of existing active issues in the same category or location, allowing students to upvote/support existing tickets instead of creating redundant duplicates.
- Complete work order lifecycle tracking: `pending` $\rightarrow$ `assigned` $\rightarrow$ `in_progress` $\rightarrow$ `resolved` $\rightarrow$ `closed`.
- Comprehensive reporting with SLA resolution velocity metrics.

---

## 2. Target Users & Access Levels

| User Role | Permissions & Workflow |
|---|---|
| **Student** | Registers with campus email; submits complaints with categories, locations, descriptions, and photograph uploads; reviews duplicate suggestions; upvotes/supports peer complaints; tracks status timeline. |
| **Maintenance Staff** | Views assigned tasks; updates work order status (`in_progress`, `resolved`); adds materials and progress remarks; inspects defect photos. |
| **Campus Admin** | Central executive control; monitors priority scores; assigns complaints to staff; manages categories, locations, and user accounts; generates printable SLA performance reports. |

---

## 3. Technology Stack

- **Frontend**: React 18, Vite, Bootstrap 5, Recharts, Lucide React, Axios, React Router, Dayjs, React-Toastify.
- **Backend**: Python 3.14+, Flask 3, Flask-SQLAlchemy, Flask-Migrate, Flask-JWT-Extended, PyMySQL, Pillow, Python-Dotenv, Werkzeug.
- **Database**: MySQL 8.0 (with graceful automatic fallback to SQLite for portable local evaluations).
- **Architecture**: Modular REST API + Decoupled Single Page Application (SPA).
