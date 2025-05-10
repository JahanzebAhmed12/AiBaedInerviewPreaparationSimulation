from app import bcrypt, db
from app.models import User
from flask import request, jsonify
from sqlalchemy.exc import IntegrityError
from app.utils import generate_jwt
from app.email_utils import send_email  # Import the email function
from flask import current_app



# Signup logic
# app/auth.py
from app.email_utils import send_email  # Import the email function
# Other imports and functions

# Signup logic
def signup():
    data = request.get_json()

    # Validate required fields
    if not data or not data.get('name') or not data.get('email') or not data.get('password'):
        return jsonify({"msg": "Missing required fields (name, email, password)"}), 400

    # Check if email already exists
    existing_user = User.query.filter_by(email=data['email']).first()
    if existing_user:
        return jsonify({"msg": "Email already exists"}), 400

    # Hash the password
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')

    # Create new user
    new_user = User(
        name=data['name'],
        email=data['email'],
        password=hashed_password
    )

    try:
        db.session.add(new_user)
        db.session.commit()
        # Send a welcome email after successful signup
        print("📨 Sending welcome email to:", data['email'])
        
        send_email("Welcome to our platform!", [data['email']], "Thank you for signing up!")  
        return jsonify({"msg": "User created successfully"}), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({"msg": "Database error, could not create user"}), 500

# Login logic
def login():
    data = request.get_json()

    # Validate required fields
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"msg": "Email and password are required"}), 400

    # Check if the user exists
    user = User.query.filter_by(email=data['email']).first()
    if not user:
        return jsonify({"msg": "User not found"}), 404

    # Check if password matches
    if not bcrypt.check_password_hash(user.password, data['password']):
        return jsonify({"msg": "Invalid credentials"}), 401

    # Check if profile is incomplete
    profile_incomplete = not all([user.experience, user.designation, user.interview_field])

    # Generate JWT token
    token = generate_jwt(user.user_id)

    return jsonify({
        "msg": "Login successful",
        "token": token,
        "profile_incomplete": profile_incomplete
    }), 200
