"""
CampusCare Application Factory
Initializes extensions, registers blueprints, creates database tables and sample seeds.
"""
import os
from flask import Flask, send_from_directory
from app.config import Config
from app.extensions import db, migrate, jwt, cors
from app.utils.response import error_response

def create_app(config_class=Config):
    flask_app = Flask(__name__)
    flask_app.config.from_object(config_class)

    # Resolve database URI if not preset (e.g. In TestingConfig)
    if not flask_app.config.get('SQLALCHEMY_DATABASE_URI'):
        flask_app.config['SQLALCHEMY_DATABASE_URI'] = config_class.get_database_uri()

    # Ensure uploads folder exists
    os.makedirs(os.path.join(flask_app.config['UPLOAD_FOLDER'], 'complaints'), exist_ok=True)

    # Initialize Extensions
    db.init_app(flask_app)
    migrate.init_app(flask_app, db)
    jwt.init_app(flask_app)
    cors.init_app(flask_app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    # Register Blueprints
    from app.routes.auth_routes import auth_bp
    from app.routes.student_routes import student_bp
    from app.routes.complaint_routes import complaint_bp
    from app.routes.staff_routes import staff_bp
    from app.routes.admin_routes import admin_bp
    from app.routes.dashboard_routes import dashboard_bp
    from app.routes.notification_routes import notification_bp

    flask_app.register_blueprint(auth_bp)
    flask_app.register_blueprint(student_bp)
    flask_app.register_blueprint(complaint_bp)
    flask_app.register_blueprint(staff_bp)
    flask_app.register_blueprint(admin_bp)
    flask_app.register_blueprint(dashboard_bp)
    flask_app.register_blueprint(notification_bp)

    # Static file serving for uploaded photos
    @flask_app.route('/uploads/<path:filename>')
    def serve_uploaded_file(filename):
        return send_from_directory(flask_app.config['UPLOAD_FOLDER'], filename)

    # Global Error Handlers
    @flask_app.errorhandler(404)
    def not_found(e):
        return error_response("Endpoint or resource not found.", status_code=404)

    @flask_app.errorhandler(413)
    def request_entity_too_large(e):
        return error_response("File size exceeds server upload limit (Max 10MB).", status_code=413)

    @flask_app.errorhandler(500)
    def internal_error(e):
        return error_response("Internal server error. Please try again later.", status_code=500)

    # Auto initialize tables and seed defaults on startup
    with flask_app.app_context():
        try:
            # Import all models to ensure metadata registration
            from app import models
            db.create_all()
            _seed_initial_data_if_empty()
        except Exception as e:
            print(f"[CampusCare DB Init Warning] {e}")

    return flask_app

def _seed_initial_data_if_empty():
    from app.models.user import User
    from app.models.category import Category
    from app.models.location import Location
    from app.models.complaint import Complaint
    from app.models.assignment import Assignment
    from app.models.status_history import StatusHistory
    from app.models.notification import Notification
    from app.models.priority_history import ComplaintPriorityHistory
    from datetime import datetime, timedelta

    if User.query.first() is not None:
        return # Already seeded

    print("[CampusCare] Initializing default seed data...")

    # Default Users (Password: password123)
    admin = User(
        full_name='System Administrator',
        email='admin@campuscare.edu',
        role='admin',
        department='Administration',
        phone='9876543210'
    )
    admin.set_password('password123')

    staff1 = User(
        full_name='John Davis (Staff)',
        email='staff@campuscare.edu',
        role='staff',
        department='Estate & Electrical',
        phone='9876543211'
    )
    staff1.set_password('password123')

    staff2 = User(
        full_name='Sarah Connor (Staff)',
        email='sarah.staff@campuscare.edu',
        role='staff',
        department='IT & AV Support',
        phone='9876543212'
    )
    staff2.set_password('password123')

    student1 = User(
        full_name='Alex Rivera (Student)',
        email='student@campuscare.edu',
        role='student',
        department='Computer Applications (MCA)',
        phone='9876543213'
    )
    student1.set_password('password123')

    student2 = User(
        full_name='Emily Zhang (Student)',
        email='emily.student@campuscare.edu',
        role='student',
        department='Electronics Engineering',
        phone='9876543214'
    )
    student2.set_password('password123')

    db.session.add_all([admin, staff1, staff2, student1, student2])
    db.session.flush()

    # Default Categories
    cat1 = Category(name='Projector & AV Equipment', description='Smart boards, projectors, audio cables, microphones', default_severity=25)
    cat2 = Category(name='Electrical & Lighting', description='Switchboards, fans, tube lights, loose wirings, AC cooling', default_severity=35)
    cat3 = Category(name='Water & Plumbing', description='Water purifiers, washroom taps, leaking pipes, drainage', default_severity=30)
    cat4 = Category(name='Network & Wi-Fi', description='Campus Wi-Fi connectivity, LAN ports, router switches', default_severity=25)
    cat5 = Category(name='Furniture & Carpentry', description='Broken benches, chairs, lab tables, door hinges', default_severity=15)
    cat6 = Category(name='Cleanliness & Sanitation', description='Waste bins, floor cleaning, hygiene, chalkboard dusters', default_severity=20)
    db.session.add_all([cat1, cat2, cat3, cat4, cat5, cat6])
    db.session.flush()

    # Default Locations
    loc1 = Location(building_name='Academic Block A', block='West Wing', floor='2nd Floor', room_number='Seminar Hall 204')
    loc2 = Location(building_name='Computing Sciences Block', block='Central Wing', floor='3rd Floor', room_number='MCA Computer Lab 301')
    loc3 = Location(building_name='Student Hostel 1', block='Block B', floor='1st Floor', room_number='Room 108')
    loc4 = Location(building_name='Central Library Complex', block='Main Wing', floor='Ground Floor', room_number='Digital Reference Section')
    loc5 = Location(building_name='Science & Engineering Block', block='East Wing', floor='1st Floor', room_number='Lecture Theatre 102')
    loc6 = Location(building_name='Student Amenities Centre', block='North Wing', floor='Ground Floor', room_number='Cafeteria & Dining Area')
    db.session.add_all([loc1, loc2, loc3, loc4, loc5, loc6])
    db.session.flush()

    # Default Complaints
    c1 = Complaint(
        title='Overheating ceiling projector in Seminar Hall',
        description='The ceiling projector flickers and turns off abruptly after 10 minutes due to cooling fan blockage.',
        category_id=cat1.id,
        location_id=loc1.id,
        student_id=student1.id,
        status='in_progress',
        severity_score=30,
        affected_score=20,
        pending_score=8,
        support_score=4,
        total_priority_score=62,
        priority_level='High',
        created_at=datetime.utcnow() - timedelta(days=3)
    )

    c2 = Complaint(
        title='Exposed electrical wiring near water cooler',
        description='Sparks observed from loose conduit right beside drinking water station on 3rd floor. Critical safety risk!',
        category_id=cat2.id,
        location_id=loc2.id,
        student_id=student1.id,
        status='assigned',
        severity_score=40,
        affected_score=25,
        pending_score=4,
        support_score=6,
        total_priority_score=75,
        priority_level='High',
        created_at=datetime.utcnow() - timedelta(days=1)
    )

    c3 = Complaint(
        title='Low Wi-Fi signal & DNS drop in MCA Lab 301',
        description='Students are unable to access GitHub and project repositories during lab sessions due to weak access point signal.',
        category_id=cat4.id,
        location_id=loc2.id,
        student_id=student2.id,
        status='pending',
        severity_score=25,
        affected_score=20,
        pending_score=2,
        support_score=2,
        total_priority_score=49,
        priority_level='Medium',
        created_at=datetime.utcnow() - timedelta(hours=14)
    )

    c4 = Complaint(
        title='Broken armrests and loose hinges on student chairs',
        description='Multiple chairs in Lecture Theatre 102 have broken wooden armrests causing discomfort during continuous lectures.',
        category_id=cat5.id,
        location_id=loc5.id,
        student_id=student2.id,
        status='resolved',
        severity_score=15,
        affected_score=10,
        pending_score=14,
        support_score=2,
        total_priority_score=41,
        priority_level='Medium',
        created_at=datetime.utcnow() - timedelta(days=6)
    )

    db.session.add_all([c1, c2, c3, c4])
    db.session.flush()

    # Assignments
    a1 = Assignment(complaint_id=c1.id, staff_id=staff2.id, assigned_by=admin.id, notes='Checked fan unit. Replacement lamp module requisition submitted.')
    a2 = Assignment(complaint_id=c2.id, staff_id=staff1.id, assigned_by=admin.id, notes='High hazard ticket: Isolating power branch before inspection.')
    db.session.add_all([a1, a2])

    # Status History
    h1 = StatusHistory(complaint_id=c1.id, changed_by=student1.id, old_status='none', new_status='pending', remarks='Complaint submitted')
    h2 = StatusHistory(complaint_id=c1.id, changed_by=admin.id, old_status='pending', new_status='assigned', remarks=f'Assigned to {staff2.full_name}')
    h3 = StatusHistory(complaint_id=c1.id, changed_by=staff2.id, old_status='assigned', new_status='in_progress', remarks='Diagnosis started on projector cooling fan')
    db.session.add_all([h1, h2, h3])

    # Priority history
    p1 = ComplaintPriorityHistory(complaint_id=c1.id, severity_score=30, affected_score=20, pending_score=2, support_score=0, total_priority_score=52, priority_level='Medium', trigger_event='creation')
    p2 = ComplaintPriorityHistory(complaint_id=c1.id, severity_score=30, affected_score=20, pending_score=8, support_score=4, total_priority_score=62, priority_level='High', trigger_event='aging_and_support')
    db.session.add_all([p1, p2])

    # Notifications
    n1 = Notification(user_id=student1.id, title='Complaint Assigned', message=f"Your complaint #{c1.id} was assigned to {staff2.full_name}.", type='assignment')
    n2 = Notification(user_id=student1.id, title='Status Update', message=f"Complaint #{c1.id} is now In Progress.", type='status_change')
    db.session.add_all([n1, n2])

    db.session.commit()
    print("[CampusCare] Seed data loaded successfully!")
