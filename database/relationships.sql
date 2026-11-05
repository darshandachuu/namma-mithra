-- CampusCare: Database Relationship Integrity & Constraints
-- Verifies and documents foreign keys, cascading rules, and indexes

USE campuscare;

-- 1. Complaints -> Users (student_id)
-- If a student user is deleted, complaints cascade or are preserved according to policy
ALTER TABLE complaints
    DROP FOREIGN KEY IF EXISTS fk_complaint_student;
ALTER TABLE complaints
    ADD CONSTRAINT fk_complaint_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE;

-- 2. Complaints -> Categories (category_id)
ALTER TABLE complaints
    DROP FOREIGN KEY IF EXISTS fk_complaint_category;
ALTER TABLE complaints
    ADD CONSTRAINT fk_complaint_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT;

-- 3. Complaints -> Locations (location_id)
ALTER TABLE complaints
    DROP FOREIGN KEY IF EXISTS fk_complaint_location;
ALTER TABLE complaints
    ADD CONSTRAINT fk_complaint_location FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE RESTRICT;

-- 4. Complaint Images -> Complaints
ALTER TABLE complaint_images
    DROP FOREIGN KEY IF EXISTS fk_image_complaint;
ALTER TABLE complaint_images
    ADD CONSTRAINT fk_image_complaint FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE;

-- 5. Complaint Supports -> Complaints & Users
ALTER TABLE complaint_supports
    DROP FOREIGN KEY IF EXISTS fk_support_complaint;
ALTER TABLE complaint_supports
    ADD CONSTRAINT fk_support_complaint FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE;

ALTER TABLE complaint_supports
    DROP FOREIGN KEY IF EXISTS fk_support_user;
ALTER TABLE complaint_supports
    ADD CONSTRAINT fk_support_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- 6. Assignments -> Complaints & Users (staff_id, assigned_by)
ALTER TABLE assignments
    DROP FOREIGN KEY IF EXISTS fk_assignment_complaint;
ALTER TABLE assignments
    ADD CONSTRAINT fk_assignment_complaint FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE;

ALTER TABLE assignments
    DROP FOREIGN KEY IF EXISTS fk_assignment_staff;
ALTER TABLE assignments
    ADD CONSTRAINT fk_assignment_staff FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE assignments
    DROP FOREIGN KEY IF EXISTS fk_assignment_admin;
ALTER TABLE assignments
    ADD CONSTRAINT fk_assignment_admin FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE CASCADE;

-- 7. Status History -> Complaints & Users
ALTER TABLE status_history
    DROP FOREIGN KEY IF EXISTS fk_history_complaint;
ALTER TABLE status_history
    ADD CONSTRAINT fk_history_complaint FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE;

ALTER TABLE status_history
    DROP FOREIGN KEY IF EXISTS fk_history_user;
ALTER TABLE status_history
    ADD CONSTRAINT fk_history_user FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE CASCADE;

-- 8. Notifications -> Users
ALTER TABLE notifications
    DROP FOREIGN KEY IF EXISTS fk_notification_user;
ALTER TABLE notifications
    ADD CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- 9. Priority History -> Complaints
ALTER TABLE complaint_priority_history
    DROP FOREIGN KEY IF EXISTS fk_priority_complaint;
ALTER TABLE complaint_priority_history
    ADD CONSTRAINT fk_priority_complaint FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE;
