# CampusCare: Entity-Relationship Diagram & Database Design

## 1. Relational Entity Overview

```mermaid
erDiagram
    USERS ||--o{ COMPLAINTS : "submits"
    USERS ||--o{ COMPLAINT_SUPPORTS : "votes"
    USERS ||--o{ ASSIGNMENTS : "assigned_to"
    USERS ||--o{ STATUS_HISTORY : "updates"
    USERS ||--o{ NOTIFICATIONS : "receives"

    CATEGORIES ||--o{ COMPLAINTS : "classifies"
    LOCATIONS ||--o{ COMPLAINTS : "identifies_area"

    COMPLAINTS ||--o{ COMPLAINT_IMAGES : "contains"
    COMPLAINTS ||--o{ COMPLAINT_SUPPORTS : "supported_by"
    COMPLAINTS ||--o{ ASSIGNMENTS : "assigned_with"
    COMPLAINTS ||--o{ STATUS_HISTORY : "tracks"
    COMPLAINTS ||--o{ COMPLAINT_PRIORITY_HISTORY : "records_score"

    USERS {
        int id PK
        string full_name
        string email UK
        string password_hash
        enum role "student, staff, admin"
        string department
        string phone
        boolean is_active
        datetime created_at
    }

    CATEGORIES {
        int id PK
        string name UK
        string description
        int default_severity
        datetime created_at
    }

    LOCATIONS {
        int id PK
        string building_name
        string block
        string floor
        string room_number
        datetime created_at
    }

    COMPLAINTS {
        int id PK
        string title
        text description
        int category_id FK
        int location_id FK
        int student_id FK
        enum status "pending, assigned, in_progress, resolved, closed, rejected"
        int severity_score
        int affected_score
        int pending_score
        int support_score
        int total_priority_score
        enum priority_level "Low, Medium, High, Critical"
        datetime created_at
        datetime updated_at
    }

    COMPLAINT_IMAGES {
        int id PK
        int complaint_id FK
        string image_url
        string file_name
        int file_size
        datetime uploaded_at
    }

    COMPLAINT_SUPPORTS {
        int id PK
        int complaint_id FK
        int user_id FK
        datetime supported_at
    }

    ASSIGNMENTS {
        int id PK
        int complaint_id FK
        int staff_id FK
        int assigned_by FK
        text notes
        datetime assigned_at
        datetime updated_at
    }

    STATUS_HISTORY {
        int id PK
        int complaint_id FK
        int changed_by FK
        string old_status
        string new_status
        text remarks
        datetime created_at
    }

    NOTIFICATIONS {
        int id PK
        int user_id FK
        string title
        text message
        boolean is_read
        string type
        datetime created_at
    }

    COMPLAINT_PRIORITY_HISTORY {
        int id PK
        int complaint_id FK
        int severity_score
        int affected_score
        int pending_score
        int support_score
        int total_priority_score
        string priority_level
        string trigger_event
        datetime calculated_at
    }
```

---

## 2. Table Cardinalities & Constraints

1. **Users $\rightarrow$ Complaints**: One-to-Many (`1:N`). One student can submit multiple complaints. If a user is removed, complaints cascade or are preserved according to institutional policy.
2. **Categories $\rightarrow$ Complaints**: One-to-Many (`1:N`). Categories cannot be deleted if associated complaints exist (`ON DELETE RESTRICT`).
3. **Locations $\rightarrow$ Complaints**: One-to-Many (`1:N`). Locations cannot be deleted if referenced by active complaints (`ON DELETE RESTRICT`).
4. **Complaints $\rightarrow$ Complaint Images**: One-to-Many (`1:N`). If complaint is deleted, images cascade (`ON DELETE CASCADE`).
5. **Complaints $\rightarrow$ Complaint Supports**: Many-to-Many (`N:M`) between Users and Complaints. Enforced with unique composite constraint `uq_complaint_user_support (complaint_id, user_id)` preventing duplicate votes.
6. **Complaints $\rightarrow$ Assignments**: One-to-One / Unique (`1:1`). Each complaint has one active staff assignment ticket.
7. **Complaints $\rightarrow$ Status History**: One-to-Many (`1:N`). Maintains an append-only audit trail of status transitions.
8. **Complaints $\rightarrow$ Complaint Priority History**: One-to-Many (`1:N`). Tracks dynamic priority score evolution over time.
