-- CampusCare: Sample Seed Data
USE campuscare;

SET FOREIGN_KEY_CHECKS = 0;

-- Seed Users (Passwords are 'password123' hashed with Werkzeug pbkdf2:sha256)
-- Hash: pbkdf2:sha256:600000$p3s9Wj8w$f93f18bf5d70f90cb5a94ee2e185e49f2b347b749fe18828e8d89a74aa977826 or generate standard werkzeug compatible
INSERT INTO users (id, full_name, email, password_hash, role, department, phone, is_active, created_at) VALUES
(1, 'System Administrator', 'admin@campuscare.edu', 'scrypt:32768:8:1$i8N71sYx6V0fL2M8$b4dcf3a8907f16f5c88c7e937d1cfcba42a4253907705139031ef06fc9e09d1245fa22fa14467d0130d2d2c140411a76c8bb0037a4eef0368a6fcfec5e10c733', 'admin', 'Administration', '9876543210', 1, NOW()),
(2, 'John Davis (Staff)', 'staff@campuscare.edu', 'scrypt:32768:8:1$i8N71sYx6V0fL2M8$b4dcf3a8907f16f5c88c7e937d1cfcba42a4253907705139031ef06fc9e09d1245fa22fa14467d0130d2d2c140411a76c8bb0037a4eef0368a6fcfec5e10c733', 'staff', 'Estate & Maintenance', '9876543211', 1, NOW()),
(3, 'Sarah Connor (Staff)', 'sarah.staff@campuscare.edu', 'scrypt:32768:8:1$i8N71sYx6V0fL2M8$b4dcf3a8907f16f5c88c7e937d1cfcba42a4253907705139031ef06fc9e09d1245fa22fa14467d0130d2d2c140411a76c8bb0037a4eef0368a6fcfec5e10c733', 'staff', 'IT & AV Support', '9876543212', 1, NOW()),
(4, 'Alex Rivera (Student)', 'student@campuscare.edu', 'scrypt:32768:8:1$i8N71sYx6V0fL2M8$b4dcf3a8907f16f5c88c7e937d1cfcba42a4253907705139031ef06fc9e09d1245fa22fa14467d0130d2d2c140411a76c8bb0037a4eef0368a6fcfec5e10c733', 'student', 'Computer Applications (MCA)', '9876543213', 1, NOW()),
(5, 'Emily Zhang (Student)', 'emily.student@campuscare.edu', 'scrypt:32768:8:1$i8N71sYx6V0fL2M8$b4dcf3a8907f16f5c88c7e937d1cfcba42a4253907705139031ef06fc9e09d1245fa22fa14467d0130d2d2c140411a76c8bb0037a4eef0368a6fcfec5e10c733', 'student', 'Electronics Engineering', '9876543214', 1, NOW());

-- Seed Categories
INSERT INTO categories (id, name, description, default_severity, created_at) VALUES
(1, 'Projector & AV Equipment', 'Smart boards, digital projectors, HDMI cables, audio systems, mics', 25, NOW()),
(2, 'Electrical & Lighting', 'Switchboards, fans, tube lights, loose wirings, AC cooling issues', 35, NOW()),
(3, 'Water & Plumbing', 'Water purifiers, washroom taps, leaking pipes, flush issues', 30, NOW()),
(4, 'Network & Wi-Fi', 'Campus Wi-Fi connectivity, LAN ports, router power, access points', 25, NOW()),
(5, 'Furniture & Carpentry', 'Broken benches, desk chairs, lab tables, door locks, whiteboard stands', 15, NOW()),
(6, 'Cleanliness & Sanitation', 'Dustbins overflowing, wet floors, lab hygiene, chalkboard cleaning', 20, NOW());

-- Seed Locations
INSERT INTO locations (id, building_name, block, floor, room_number, created_at) VALUES
(1, 'Academic Block A', 'West Wing', '2nd Floor', 'Seminar Hall 204', NOW()),
(2, 'Computing Sciences Block', 'Central Wing', '3rd Floor', 'MCA Computer Lab 301', NOW()),
(3, 'Student Hostel 1', 'Block B', '1st Floor', 'Room 108', NOW()),
(4, 'Central Library Complex', 'Main Wing', 'Ground Floor', 'Digital Reference Section', NOW()),
(5, 'Science & Engineering Block', 'East Wing', '1st Floor', 'Lecture Theatre 102', NOW()),
(6, 'Student Amenities Centre', 'North Wing', 'Ground Floor', 'Cafeteria & Dining Area', NOW());

-- Seed Complaints
INSERT INTO complaints (id, title, description, category_id, location_id, student_id, status, severity_score, affected_score, pending_score, support_score, total_priority_score, priority_level, created_at) VALUES
(1, 'Overheating ceiling projector in Seminar Hall', 'The Epson ceiling projector flickers continuously and turns off abruptly after 10 minutes of display due to cooling fan failure during lectures.', 1, 1, 4, 'in_progress', 30, 20, 8, 4, 62, 'High', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(2, 'Exposed electrical wiring near water cooler', 'Sparks observed from loose electrical conduit right next to the drinking water station on 3rd floor. Severe safety hazard for students.', 2, 2, 4, 'assigned', 40, 25, 4, 6, 75, 'High', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(3, 'Low Wi-Fi signal & DNS drop in MCA Lab 301', 'Students are unable to access GitHub and project repositories during lab sessions due to constant router reboots and weak signal.', 4, 2, 5, 'pending', 25, 20, 2, 2, 49, 'Medium', DATE_SUB(NOW(), INTERVAL 12 HOUR)),
(4, 'Broken armrest and loose hinges on desks', 'Multiple student chairs in Lecture Theatre 102 have broken wooden armrests causing discomfort during continuous lectures.', 5, 5, 5, 'resolved', 15, 10, 14, 2, 41, 'Medium', DATE_SUB(NOW(), INTERVAL 6 DAY));

-- Seed Supports
INSERT INTO complaint_supports (complaint_id, user_id, supported_at) VALUES
(1, 4, NOW()),
(1, 5, NOW()),
(2, 4, NOW()),
(2, 5, NOW()),
(3, 4, NOW());

-- Seed Assignments
INSERT INTO assignments (id, complaint_id, staff_id, assigned_by, notes, assigned_at) VALUES
(1, 1, 3, 1, 'Inspected filter and fan unit. Replacement lamp module ordered from campus IT inventory.', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(2, 2, 2, 1, 'Urgent electrical safety ticket. Disconnect branch circuit before water station maintenance.', DATE_SUB(NOW(), INTERVAL 20 HOUR));

-- Seed Status History
INSERT INTO status_history (complaint_id, changed_by, old_status, new_status, remarks, created_at) VALUES
(1, 4, 'none', 'pending', 'Complaint registered by student', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(1, 1, 'pending', 'assigned', 'Assigned to Sarah Connor (IT & AV Support)', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(1, 3, 'assigned', 'in_progress', 'Started hardware diagnosis and testing replacement HDMI/lamp', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(2, 4, 'none', 'pending', 'Complaint registered by student', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(2, 1, 'pending', 'assigned', 'Assigned with high urgency to John Davis (Estate)', DATE_SUB(NOW(), INTERVAL 20 HOUR)),
(4, 5, 'none', 'pending', 'Complaint registered by student', DATE_SUB(NOW(), INTERVAL 6 DAY)),
(4, 1, 'pending', 'assigned', 'Assigned to carpenter John Davis', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(4, 2, 'assigned', 'in_progress', 'Repaired 4 desk units', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(4, 2, 'in_progress', 'resolved', 'All chairs reinforced with metal brackets and new screws.', DATE_SUB(NOW(), INTERVAL 2 DAY));

-- Seed Notifications
INSERT INTO notifications (user_id, title, message, is_read, type, created_at) VALUES
(4, 'Complaint Assigned', 'Your complaint #1 (Overheating ceiling projector) has been assigned to Sarah Connor.', 1, 'assignment', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(4, 'Status Updated', 'Complaint #1 status changed to In Progress.', 0, 'status_change', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(4, 'Community Support Received', 'Another student supported your complaint #2 (Exposed electrical wiring).', 0, 'support', DATE_SUB(NOW(), INTERVAL 18 HOUR)),
(5, 'Complaint Resolved', 'Your complaint #4 regarding broken armrests in Lecture Theatre 102 has been resolved.', 1, 'status_change', DATE_SUB(NOW(), INTERVAL 2 DAY));

-- Seed Priority History
INSERT INTO complaint_priority_history (complaint_id, severity_score, affected_score, pending_score, support_score, total_priority_score, priority_level, trigger_event, calculated_at) VALUES
(1, 30, 20, 2, 0, 52, 'Medium', 'initial_submission', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(1, 30, 20, 8, 4, 62, 'High', 'community_support_and_aging', NOW()),
(2, 40, 25, 0, 0, 65, 'High', 'initial_submission', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(2, 40, 25, 4, 6, 75, 'High', 'community_support_and_aging', NOW());

SET FOREIGN_KEY_CHECKS = 1;
