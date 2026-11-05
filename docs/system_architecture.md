# CampusCare: System Architecture & Workflow

## 1. High-Level Architecture

CampusCare is structured as a decoupled, multi-tier client-server architecture:

```
[ React SPA Client (Port 3000) ]
        │
        │ HTTP / JSON / JWT (Bearer Tokens)
        ▼
[ Flask REST API Server (Port 5000) ]
  ├── Routes Layer (Blueprints: Auth, Student, Complaint, Staff, Admin, Dashboard, Notifications)
  ├── Security Layer (JWT Manager, RBAC Decorators, Input Validators)
  ├── Services Layer (Priority Service, Duplicate Service, Image Service, Complaint Service)
  └── ORM Layer (Flask-SQLAlchemy Models)
        │
        ├── File System: uploads/complaints/ (Sanitized Photographs)
        │
        └── MySQL 8.0 Engine (Port 3306) / Fallback SQLite
```

---

## 2. Complaint Processing Lifecycle

```
[ Student files Complaint ]
         │
         ├── Selects Category & Location
         ├── Real-time duplicate lookup checks existing tickets
         │      ├── Found existing -> Student supports existing (+1)
         │      └── New distinct issue -> Proceeds to submit
         ├── Uploads defect photographs (JPG/PNG/WEBP)
         └── Sets severity & affected users scope
                     │
                     ▼
             [ Priority Engine ]
       Calculates P = S + A + T + C
       Records initial score & priority level
                     │
                     ▼
             [ Status: Pending ]
                     │
         Admin inspects ticket & assigns staff
                     │
                     ▼
             [ Status: Assigned ]
                     │
         Staff inspects defect & starts repair
                     │
                     ▼
            [ Status: In Progress ]
                     │
         Staff completes repair & submits notes
                     │
                     ▼
             [ Status: Resolved ]
                     │
         Admin / Student verifies & closes ticket
                     │
                     ▼
             [ Status: Closed ]
```

---

## 3. Priority Algorithm Architecture

The rule-based calculation algorithm ensures objective, institutional allocation:

$$P = S + A + T + C$$

1. **Severity Score ($S \in [0, 40]$)**:
   - Evaluates danger, electrical risks, water leaks, or total equipment failure.
2. **Affected Users Scope ($A \in [0, 30]$)**:
   - Evaluates number of students impacted (Individual: 8, Room/Lab: 16, Wing: 24, Campus-wide: 30).
3. **Pending Aging Score ($T \in [0, 20]$)**:
   - Prevents starvation of older tickets: $>7$ days: 20 pts; $5-7$ days: 16 pts; $3-5$ days: 12 pts; $1-3$ days: 8 pts; $<24$ hrs: $2-4$ pts.
4. **Community Support Score ($C \in [0, 10]$)**:
   - Each community upvote adds 2 marks, capped at 10 marks (5 upvotes).
