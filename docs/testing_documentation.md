# CampusCare: Testing Documentation & Test Suite

## 1. Automated Backend Test Suite

The automated test suite is implemented using `pytest` and verifies end-to-end functionality across authorization, complaint lifecycles, and mathematical priority calculations.

### Test Execution Command:
```cmd
cd backend
python -m pytest tests -v
```

### Test Case Matrix:

| Test File | Test Case Name | Objective & Assertions | Status |
|---|---|---|---|
| `test_auth.py` | `test_login_successful` | Asserts valid student credentials generate JWT access token with role `student`. | **PASSED** |
| `test_auth.py` | `test_login_invalid_password` | Asserts HTTP 401 Unauthorized for incorrect passwords. | **PASSED** |
| `test_auth.py` | `test_register_new_student` | Asserts successful creation of student accounts with role isolation. | **PASSED** |
| `test_auth.py` | `test_register_duplicate_email` | Asserts HTTP 409 Conflict when attempting duplicate email registration. | **PASSED** |
| `test_auth.py` | `test_get_profile` | Asserts authenticated profile retrieval via Bearer token. | **PASSED** |
| `test_complaints.py` | `test_get_complaints_list` | Asserts public retrieval of complaint list with pagination/filtering. | **PASSED** |
| `test_complaints.py` | `test_create_complaint` | Asserts complaint submission, priority score calculation, and initial status history. | **PASSED** |
| `test_complaints.py` | `test_get_complaint_details` | Asserts detailed payload includes category, location, priority breakdown, and timeline. | **PASSED** |
| `test_complaints.py` | `test_duplicate_complaint_lookup` | Asserts rule-based detection flags open complaints with same Category & Location. | **PASSED** |
| `test_priority.py` | `test_priority_score_calculation` | Asserts maximum score calculation: $S(40) + A(30) + T(20) + C(10) = 100$ pts [Critical]. | **PASSED** |
| `test_priority.py` | `test_priority_levels` | Asserts boundary values: Critical ($\ge 80$), High ($\ge 60$), Medium ($\ge 35$), Low ($< 35$). | **PASSED** |
| `test_priority.py` | `test_support_impact_on_complaint` | Asserts community support (+1) dynamically increases the total priority score. | **PASSED** |
| `test_assignments.py` | `test_admin_assign_complaint` | Asserts administrator can assign complaint to technician with notes. | **PASSED** |
| `test_assignments.py` | `test_staff_update_status` | Asserts assigned technician can update status to `in_progress` with progress remarks. | **PASSED** |
| `test_assignments.py` | `test_staff_cannot_update_unassigned` | Asserts HTTP 403 Forbidden when technician attempts to update an unassigned ticket. | **PASSED** |

**Summary: 15 / 15 Tests Passed (100% Success Rate).**

---

## 2. Manual Testing Guide & Workflow Checklist

### Demonstration Step 1: Student Login & Registration
1. Navigate to `http://localhost:3000/login`.
2. Click **"Student: student@campuscare.edu"** autofill button.
3. Click **Sign In**.
4. Confirm redirection to **Student Portal** showing statistics.

### Demonstration Step 2: Complaint Submission & Live Photo Preview
1. Click **Submit New Complaint**.
2. Enter Title: `"Damaged electrical switchboard in MCA Computer Lab 301"`.
3. Select Category: `"Electrical & Lighting"`.
4. Select Location: `"Computing Sciences Block - Central Wing - 3rd Floor - MCA Computer Lab 301"`.
5. Notice the **Existing Open Complaints Drawer** appears, highlighting active issues in the same lab.
6. Attach a defect photograph (`.jpg`, `.png`, or `.webp`). Observe the immediate client preview.
7. Set Severity slider to `35` and Affected slider to `25`. Notice the estimated priority preview updates in real time.
8. Click **Submit Complaint**.
9. Confirm redirection to complaint details displaying photograph thumbnail and priority breakdown card.

### Demonstration Step 3: Community Support (+1) & Priority Recalculation
1. On the complaint details page, click the **"Support Issue"** button.
2. Observe support count increase and the total priority score recalculating upward!

### Demonstration Step 4: Administrator Work Order Allocation
1. Log out and sign in using **"Admin: admin@campuscare.edu"** (Password: `password123`).
2. Notice the **Admin Overview** with Recharts analytics and KPI cards.
3. Locate the newly filed complaint in the pending table.
4. Click **Assign**.
5. Select technician `"John Davis (Staff)"`, enter instructions, and submit.
6. Status changes to **Assigned**.

### Demonstration Step 5: Staff Execution & Resolution
1. Log out and sign in using **"Staff: staff@campuscare.edu"** (Password: `password123`).
2. Open **Assigned Work Orders**.
3. Click **Update Status** on the assigned complaint.
4. Select **In Progress** with remarks `"Inspected circuit breaker and ordered replacement module."`
5. Subsequently update to **Resolved** with remarks `"Completed rewiring and verified safe grounding."`
6. Verify status timeline records all operations with timestamps.
