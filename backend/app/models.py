from app import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'user'
    user_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    experience = db.Column(db.String(50))
    designation = db.Column(db.String(100))
    interview_field = db.Column(db.String(100))

    # Relationships
    preparations = db.relationship('Preparation', backref='user', lazy=True)
    progress_reports = db.relationship('ProgressReport', backref='user', lazy=True)
    interviews = db.relationship('UserInterview', backref='user', lazy=True)
    badges = db.relationship('Badge', backref='user', lazy=True)

class Preparation(db.Model):
    __tablename__ = 'preparation'
    preparation_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)
    start_date = db.Column(db.Date)
    last_accessed = db.Column(db.Date)
    progress_status = db.Column(db.String(50))
    resource_link = db.Column(db.String(255))
    content = db.Column(db.Text)
    major_field = db.Column(db.String(100))
    subfield = db.Column(db.String(100))
    difficulty_level = db.Column(db.String(50))

class Session(db.Model):
    __tablename__ = 'session'
    session_id = db.Column(db.String(36), primary_key=True)  # UUID as string
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)
    token = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    expires_at = db.Column(db.DateTime)
    is_valid = db.Column(db.Boolean, default=True)

class PasswordReset(db.Model):
    __tablename__ = 'password_reset'
    reset_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)
    reset_token = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    expires_at = db.Column(db.DateTime)
    is_used = db.Column(db.Boolean, default=False)

class ProgressReport(db.Model):
    __tablename__ = 'progress_report'
    report_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)
    date = db.Column(db.Date)
    field = db.Column(db.String(100))
    score = db.Column(db.Integer)
    feedback = db.Column(db.Text)

class UserInterview(db.Model):
    __tablename__ = 'user_interview'
    interview_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)
    total_interviews = db.Column(db.Integer)
    upcoming_interviews = db.Column(db.Integer)
    best_score = db.Column(db.Integer)
    average_score = db.Column(db.Integer)

class InterviewFeedback(db.Model):
    __tablename__ = 'interview_feedback'
    feedback_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)
    interview_id = db.Column(db.String(36), db.ForeignKey('user_interview.interview_id'), nullable=False)
    score = db.Column(db.Integer)
    strengths = db.Column(db.Text)  # Store strengths as JSON string
    weaknesses = db.Column(db.Text)  # Store weaknesses as JSON string
    areas_to_improve = db.Column(db.Text)  # Store improvement areas as JSON string
    feedback_text = db.Column(db.Text)  # Store the complete feedback text
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class ModelResponse(db.Model):
    __tablename__ = 'model_response'
    response_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)
    interview_id = db.Column(db.Integer, db.ForeignKey('user_interview.interview_id'), nullable=False)
    human_response = db.Column(db.Text)
    llm_response = db.Column(db.Text)
    timestamp = db.Column(db.DateTime, server_default=db.func.now())

class Badge(db.Model):
    __tablename__ = 'badge'
    badge_id = db.Column(db.Integer, primary_key=True)
    badge_name = db.Column(db.String(100), nullable=False)
    criteria = db.Column(db.String(255))
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)
    date_awarded = db.Column(db.DateTime, server_default=db.func.now())
