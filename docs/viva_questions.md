# CampusCare: MCA Project Viva Voce & Technical Defense Q&A

### Q1: What problem does CampusCare solve that traditional Google Forms or paper registers cannot?
**Answer**: Traditional methods lack real-time visibility, automated duplicate detection, and objective prioritization. Complaints often get lost or duplicated. CampusCare introduces:
1. An objective priority formula ($P = S + A + T + C$) preventing subjective bias.
2. Rule-based duplicate checking on Category and Location so students can upvote existing issues rather than re-creating them.
3. Complete audit history of who touched the complaint, what was repaired, and when it was completed.
4. Defect photograph storage enabling technicians to review parts before visiting the physical location.

---

### Q2: Explain the priority calculation formula in detail.
**Answer**: The priority score out of 100 is given by:
$$P = S + A + T + C$$
- **Severity ($S \le 40$)**: Evaluates physical defect danger (e.g. electrical sparks, water leakage, broken glass).
- **Affected Users ($A \le 30$)**: Assesses the blast radius (Individual desk $= 8$, Classroom/Lab $= 16$, Entire floor/wing $= 24$, Campus-wide $= 30$).
- **Pending Aging Time ($T \le 20$)**: Gradually increases as complaints remain unresolved ($>7$ days $= 20$ marks), preventing low-severity complaints from being ignored indefinitely (anti-starvation).
- **Community Support ($C \le 10$)**: Each student upvote adds 2 marks, capped at 10 marks (5 upvotes).

Priority tiers:
- **Critical (80–100)**: Immediate hazard requiring 4-hour SLA.
- **High (60–79)**: Disrupted academic activity requiring 24-hour SLA.
- **Medium (35–59)**: Routine maintenance requiring 48-hour SLA.
- **Low (0–34)**: Minor cosmetic fixes.

---

### Q3: How does the system handle duplicate complaints without machine learning?
**Answer**: We utilize a deterministic, rule-based approach:
1. When a student chooses a Category and Location, an asynchronous query checks all active non-resolved tickets with matching Category and Location (Exact Match) or matching Location in the same building.
2. The UI surfaces a highlighted "Existing Complaints In This Area" drawer.
3. Students can click **"+1 Support Instead"**, which upvotes the existing ticket, elevates its priority score, and avoids creating redundant records.
4. If their issue is genuinely distinct, they can still submit a separate complaint without restriction.

---

### Q4: How are photographs handled and secured?
**Answer**:
1. Files are validated for MIME type and file extension (`.jpg`, `.jpeg`, `.png`, `.webp`) and restricted to $\le 5\text{MB}$.
2. Filenames are secured using `uuid.uuid4()` to prevent directory traversal and collision attacks.
3. Images are opened via the `Pillow` library to verify header integrity before writing to `backend/uploads/complaints/`.
4. Only relative paths are stored in MySQL table `complaint_images`, ensuring decoupled, portable file storage.

---

### Q5: How is user authentication and authorization handled?
**Answer**:
- **Authentication**: JWT (`Flask-JWT-Extended`) tokens containing encrypted user identities.
- **Password Security**: Passwords are never stored in plain text; they are hashed with `Werkzeug` secure hashing using salts and PBKDF2/scrypt.
- **Authorization**: Custom decorators (`@role_required(['admin'])`, `@staff_required`, `@student_required`) intercept API requests and verify the active token and database role before allowing endpoint execution.

---

### Q6: What database design choices were made for high integrity?
**Answer**:
- 10 distinct tables in 3rd Normal Form (3NF).
- Strict foreign key constraints with `ON DELETE CASCADE` on dependent details (photos, supports, priority history) and `ON DELETE RESTRICT` on master lookups (categories, locations).
- Unique composite constraint `(complaint_id, user_id)` on `complaint_supports` preventing double-voting.
- Indexed columns on `email`, `status`, `category_id`, `location_id`, and `total_priority_score` for fast query performance.
