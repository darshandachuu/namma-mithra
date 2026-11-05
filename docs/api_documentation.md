# CampusCare: REST API Documentation

Base URL: `http://127.0.0.1:5000/api`

All protected routes require an HTTP Header:
`Authorization: Bearer <jwt_access_token>`

---

## 1. Authentication Endpoints (`/api/auth`)

### 1.1 Student Registration
- **URL**: `POST /api/auth/register`
- **Access**: Public
- **Request Body**:
```json
{
  "full_name": "Alex Rivera",
  "email": "alex.rivera@campuscare.edu",
  "password": "password123",
  "department": "Computer Applications",
  "phone": "9876543210"
}
```
- **Response** (201 Created):
```json
{
  "success": true,
  "message": "Registration successful. Welcome to CampusCare!",
  "data": {
    "user": { "id": 6, "full_name": "Alex Rivera", "email": "alex.rivera@campuscare.edu", "role": "student" },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 1.2 User Login
- **URL**: `POST /api/auth/login`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "student@campuscare.edu",
  "password": "password123"
}
```

### 1.3 User Profile
- **URL**: `GET /api/auth/profile`
- **Access**: Authenticated (`student`, `staff`, `admin`)

---

## 2. Complaints Endpoints (`/api/complaints`)

### 2.1 List Complaints
- **URL**: `GET /api/complaints`
- **Query Params**: `status`, `category_id`, `location_id`, `priority`, `search`, `sort_by`

### 2.2 Submit Complaint
- **URL**: `POST /api/complaints`
- **Access**: Authenticated (`student`, `admin`)
- **Content-Type**: `multipart/form-data` or `application/json`
- **Form Fields**:
  - `title`: string
  - `description`: string
  - `category_id`: integer
  - `location_id`: integer
  - `severity_score`: integer (0-40)
  - `affected_score`: integer (0-30)
  - `images`: file[] (JPG, PNG, WEBP $\le$ 5MB)

### 2.3 Complaint Details
- **URL**: `GET /api/complaints/:id`
- **Access**: Public / Authenticated

### 2.4 Support / Upvote Issue
- **URL**: `POST /api/complaints/:id/support`
- **Access**: Authenticated

### 2.5 Find Duplicate Issues
- **URL**: `GET /api/complaints/duplicates?category_id=1&location_id=2`
- **Access**: Public / Authenticated

---

## 3. Staff Operations (`/api/staff`)

### 3.1 List Assigned Tasks
- **URL**: `GET /api/staff/complaints`
- **Access**: `staff`

### 3.2 Update Task Status & Work Remarks
- **URL**: `PUT /api/staff/complaints/:id/status`
- **Access**: `staff`
- **Request Body**:
```json
{
  "status": "in_progress",
  "remarks": "Replaced fuse and verified power line"
}
```

---

## 4. Administration Endpoints (`/api/admin`)

### 4.1 Assign Complaint to Technician
- **URL**: `POST /api/admin/assignments`
- **Access**: `admin`
- **Request Body**:
```json
{
  "complaint_id": 1,
  "staff_id": 2,
  "notes": "Urgent electrical inspection required"
}
```

### 4.2 User Management
- `GET /api/admin/users?role=staff`
- `POST /api/admin/users`
- `PUT /api/admin/users/:id`

### 4.3 Facility Auditing & Reports
- **URL**: `GET /api/admin/reports`
- **Access**: `admin`
