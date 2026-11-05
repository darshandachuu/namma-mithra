# CampusCare: Functional & Non-Functional Requirements

## 1. Functional Requirements

### 1.1 Authentication & Profile Management
- **FR-01**: Secure registration for students with validation on email, full name, and minimum 6-character passwords.
- **FR-02**: JWT-based stateless authentication with token verification on all protected endpoints.
- **FR-03**: Password hashing via Werkzeug secure hashing (`pbkdf2` / `scrypt`).
- **FR-04**: Role-based access control (RBAC) strictly isolating Student, Staff, and Admin routes.

### 1.2 Complaint Submission & Image Upload
- **FR-05**: Complaint registration supporting Title, Category, Location, Description, Severity assessment, and Affected user scope.
- **FR-06**: Manual photograph upload supporting JPG, JPEG, PNG, WEBP with client-side preview, file size check ($\le 5\text{MB}$), and backend validation.
- **FR-07**: Storage of photographs in backend file storage with UUID sanitization and database path persistence in `complaint_images`.
- **FR-08**: Display of attached photographs in student, staff, and admin dashboards with full-screen zoom modal.

### 1.3 Duplicate Prevention & Community Support
- **FR-09**: Automatic query for existing active complaints matching the chosen Category and Location.
- **FR-10**: Ability for students to "+1 Support / Upvote" an existing complaint instead of filing a duplicate.
- **FR-11**: Dynamic recalculation of the complaint priority score upon receiving community support.

### 1.4 Rule-Based Priority Engine
- **FR-12**: Deterministic calculation of total priority score out of 100:
  $$P = S + A + T + C$$
  - Severity $S \in [0, 40]$
  - Affected Users $A \in [0, 30]$
  - Pending Aging Time $T \in [0, 20]$
  - Community Support $C \in [0, 10]$
- **FR-13**: Priority categorization:
  - Critical ($80 - 100$)
  - High ($60 - 79$)
  - Medium ($35 - 59$)
  - Low ($0 - 34$)
- **FR-14**: Transparent, explainable priority breakdown displayed on complaint details.
- **FR-15**: Full audit logging of priority recalculation history in `complaint_priority_history`.

### 1.5 Maintenance Assignment & Workflow
- **FR-16**: Administrator can assign complaints to staff members with technician instructions.
- **FR-17**: Staff can transition complaint statuses (`assigned` $\rightarrow$ `in_progress` $\rightarrow$ `resolved`) with work remarks.
- **FR-18**: Audit logging of all status changes in `status_history`.

---

## 2. Non-Functional Requirements

- **Performance**: API responses delivered in $< 200\text{ms}$.
- **Security**: No plain-text passwords or exposed sensitive secrets.
- **Reliability**: Automatic database reconnection and graceful fallback.
- **Responsiveness**: Mobile-friendly layout across desktop, tablet, and smartphone screens.
- **Maintainability**: Clean modular separation of models, routes, services, and utilities.
