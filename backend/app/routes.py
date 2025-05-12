from flask import request, Blueprint, jsonify
from app.auth import signup, login
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import User
import markdown
from app import db
from app.models import ModelResponse
import requests
import json

import random
import string
from datetime import datetime, timedelta
from app.models import PasswordReset, User, InterviewFeedback, Preparation, Badge
from app.email_utils import send_email
from app import bcrypt
main_routes = Blueprint('main_routes', __name__)
FASTAPI_URL = "http://127.0.0.1:8000/generate_prompt/"



# In your Flask app


@main_routes.route('/save_response', methods=['POST'])
def save_response():
    data = request.json
    print("Received data:", data)  # Log incoming data
    user_id = data.get('user_id')
    interview_id = data.get('interview_id')
    human_response = data.get('human_response')
    llm_response = data.get('llm_response')

    if not user_id or not interview_id:
        return jsonify({'error': 'user_id and interview_id are required'}), 400

    try:
        response = ModelResponse(
            user_id=user_id,
            interview_id=interview_id,
            human_response=human_response,
            llm_response=llm_response
        )
        db.session.add(response)
        db.session.commit()
        return jsonify({'message': 'Response saved successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error saving response: {str(e)}'}), 500


@main_routes.route('/generate_prompt', methods=['POST'])
def generate_prompt():
    try:
        # Get the input data from the request
        data = request.get_json()
        mainField = data.get('mainField', '')
        subField = data.get('subField', '')
        difficulty = data.get('difficulty', '')
        useCached = data.get('useCached', True)  # Default to True if not specified
        selected_cache_id = data.get('selected_cache_id')  # New parameter for selecting specific cached response

        # Check if preparation material already exists and user wants to use cached content
        if useCached:
            existing_preparations = Preparation.query.filter_by(
                major_field=mainField,
                subfield=subField,
                difficulty_level=difficulty
            ).order_by(Preparation.created_at.desc()).all()

            if existing_preparations:
                # If a specific cache ID is provided, return that specific response
                if selected_cache_id:
                    selected_preparation = next(
                        (p for p in existing_preparations if p.preparation_id == selected_cache_id),
                        None
                    )
                    if selected_preparation:
                        # Update last accessed date
                        selected_preparation.last_accessed = datetime.utcnow()
                        db.session.commit()
                        return jsonify({
                            "generated_content": selected_preparation.content,
                            "from_cache": True,
                            "cache_id": selected_preparation.preparation_id,
                            "available_caches": [{
                                "id": p.preparation_id,
                                "created_at": p.created_at.isoformat()
                            } for p in existing_preparations]
                        })
                
                # If no specific cache ID or not found, return the most recent one
                most_recent = existing_preparations[0]
                most_recent.last_accessed = datetime.utcnow()
                db.session.commit()
                
                return jsonify({
                    "generated_content": most_recent.content,
                    "from_cache": True,
                    "cache_id": most_recent.preparation_id,
                    "available_caches": [{
                        "id": p.preparation_id,
                        "created_at": p.created_at.isoformat()
                    } for p in existing_preparations]
                })

        # If no existing preparation or user wants fresh content, generate new content
        fastapi_response = requests.post(
            FASTAPI_URL,
            json={"mainField": mainField, "subField": subField, "difficulty": difficulty}
        )

        if fastapi_response.status_code != 200:
            return jsonify({"error": "Failed to generate prompt"}), fastapi_response.status_code

        # Get the generated content from FastAPI
        generated_content = fastapi_response.json().get('generated_content', '')

        # Convert the markdown-like content to HTML
        html_content = markdown.markdown(generated_content)

        # Create a full HTML response with additional details
        response_html = f"""
            <h1>{mainField} - {subField}</h1>
            <p><strong>Difficulty:</strong> {difficulty}</p>
            <div>{html_content}</div>
            <a href="https://www.example.com">Learn More</a>
        """

        # Store the preparation material in the database
        new_preparation = Preparation(
            major_field=mainField,
            subfield=subField,
            difficulty_level=difficulty,
            content=response_html,
            user_id=1  # You might want to get this from the authenticated user
        )
        db.session.add(new_preparation)
        db.session.commit()

        # Get all available caches after adding new one
        all_preparations = Preparation.query.filter_by(
            major_field=mainField,
            subfield=subField,
            difficulty_level=difficulty
        ).order_by(Preparation.created_at.desc()).all()

        # Return the generated content
        return jsonify({
            "generated_content": response_html,
            "from_cache": False,
            "cache_id": new_preparation.preparation_id,
            "available_caches": [{
                "id": p.preparation_id,
                "created_at": p.created_at.isoformat()
            } for p in all_preparations]
        })

    except Exception as e:
        print(f"Error in generate_prompt: {str(e)}")  # Add error logging
        return jsonify({"error": str(e)}), 500


# Signup Route
@main_routes.route('/signup', methods=['POST'])
def signup_route():
    return signup()


# Login Route
@main_routes.route('/login', methods=['POST'])
def login_route():
    return login()


# Protected Route
@main_routes.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if user:
        profile_incomplete = not all([user.experience, user.designation, user.interview_field])

        return jsonify({
            "name": user.name,
            "email": user.email,
            "experience": user.experience,
            "designation": user.designation,
            "interview_field": user.interview_field,
            "profile_incomplete": profile_incomplete
        }), 200
    return jsonify({"msg": "User not found"}), 404


@main_routes.route('/update_profile', methods=['POST'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    print(user_id)
    user = User.query.get(user_id)

    if not user:
        return jsonify({"msg": "User not found"}), 404

    data = request.get_json()
    user.experience = data.get('experience')
    user.designation = data.get('designation')
    user.interview_field = data.get('interview_field')

    db.session.commit()
    return jsonify({"msg": "Profile updated successfully"}), 200



@main_routes.route('/reset_password', methods=['POST'])
def reset_password():
    data = request.get_json()
    email = data.get('email')
    code = data.get('code')
    new_password = data.get('new_password')

    if not all([email, code, new_password]):
        return jsonify({"msg": "All fields (email, code, new_password) are required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"msg": "User not found"}), 404

    reset_entry = PasswordReset.query.filter_by(
        user_id=user.user_id,
        reset_token=code,
        is_used=False
    ).first()

    if not reset_entry:
        return jsonify({"msg": "Invalid or expired code"}), 400

    if reset_entry.expires_at < datetime.utcnow():
        return jsonify({"msg": "Code has expired"}), 400

    # Update password
    user.password = bcrypt.generate_password_hash(new_password).decode('utf-8')

    # Mark the OTP as used
    reset_entry.is_used = True
    db.session.commit()

    return jsonify({"msg": "Password updated successfully"}), 200

@main_routes.route('/request_password_reset', methods=['POST'])
def request_password_reset():
    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({"msg": "Email is required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"msg": "User not found"}), 404

    # Generate a 6-digit verification code
    code = ''.join(random.choices(string.digits, k=6))
    expires_at = datetime.utcnow() + timedelta(minutes=15)

    # Save reset token
    reset_entry = PasswordReset(
        user_id=user.user_id,
        reset_token=code,
        expires_at=expires_at,
        is_used=False
    )
    db.session.add(reset_entry)
    db.session.commit()

    # Send email
    send_email(
        "Your Password Reset Code",
        [email],
        f"Your password reset code is: {code}. It expires in 15 minutes."
    )

    return jsonify({"msg": "Reset code sent to your email"}), 200

@main_routes.route('/save_feedback', methods=['POST'])
def save_feedback():
    try:
        data = request.json
        print("\n[DEBUG] Received feedback data:", json.dumps(data, indent=2))
        
        # Validate required fields
        required_fields = ['user_id', 'interview_id', 'interview_field', 'score', 'strengths', 'weaknesses', 'areas_to_improve', 'feedback_text']
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            print(f"\n[ERROR] Missing required fields: {missing_fields}")
            return jsonify({
                'error': 'Missing required fields',
                'missing_fields': missing_fields
            }), 400

        # Ensure all fields are properly formatted
        feedback = InterviewFeedback(
            user_id=int(data['user_id']),
            interview_id=str(data['interview_id']),  # Keep as string for UUID
            interview_field=str(data['interview_field']),
            score=int(data['score']),
            strengths=json.dumps(data['strengths']),
            weaknesses=json.dumps(data['weaknesses']),
            areas_to_improve=json.dumps(data['areas_to_improve']),
            feedback_text=data['feedback_text']
        )
        
        db.session.add(feedback)
        db.session.commit()
        
        print("\n[DEBUG] Feedback saved successfully")
        return jsonify({'message': 'Feedback saved successfully'}), 200
    except Exception as e:
        db.session.rollback()
        print(f"\n[ERROR] Error saving feedback: {str(e)}")
        return jsonify({'error': f'Error saving feedback: {str(e)}'}), 500

@main_routes.route('/get_interview_stats', methods=['GET'])
@jwt_required()
def get_interview_stats():
    user_id = get_jwt_identity()
    
    try:
        # Get total interviews count
        total_interviews = InterviewFeedback.query.filter_by(user_id=user_id).count()
        
        # Get average score
        avg_score = db.session.query(db.func.avg(InterviewFeedback.score))\
            .filter_by(user_id=user_id)\
            .scalar() or 0
        
        # Get worst score
        worst_score = db.session.query(db.func.min(InterviewFeedback.score))\
            .filter_by(user_id=user_id)\
            .scalar() or 0
            
        # Get best score
        best_score = db.session.query(db.func.max(InterviewFeedback.score))\
            .filter_by(user_id=user_id)\
            .scalar() or 0
        
        return jsonify({
            'total_interviews': total_interviews,
            'average_score': round(float(avg_score), 2),
            'worst_score': worst_score,
            'best_score': best_score
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@main_routes.route('/get_interview_history', methods=['GET'])
@jwt_required()
def get_interview_history():
    try:
        user_id = get_jwt_identity()
        feedbacks = InterviewFeedback.query.filter_by(user_id=user_id)\
            .order_by(InterviewFeedback.created_at.desc())\
            .all()
        
        return jsonify([{
            'feedback_id': feedback.feedback_id,
            'interview_id': feedback.interview_id,
            'interview_field': feedback.interview_field,
            'score': feedback.score,
            'feedback_text': feedback.feedback_text,
            'created_at': feedback.created_at.isoformat()
        } for feedback in feedbacks])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@main_routes.route('/get_interview_feedback/<interview_id>', methods=['GET'])
@jwt_required()
def get_interview_feedback(interview_id):
    try:
        user_id = get_jwt_identity()
        feedback = InterviewFeedback.query.filter_by(interview_id=interview_id, user_id=user_id).first()
        if not feedback:
            return jsonify({'error': 'Feedback not found'}), 404
        
        # Debug logging
        print("\n[DEBUG] Raw feedback data:")
        print(f"Strengths: {feedback.strengths}")
        print(f"Areas to improve: {feedback.areas_to_improve}")
        
        # Ensure the data is properly formatted
        try:
            strengths = json.loads(feedback.strengths) if feedback.strengths else []
            areas_to_improve = json.loads(feedback.areas_to_improve) if feedback.areas_to_improve else []
        except json.JSONDecodeError as e:
            print(f"\n[ERROR] JSON decode error: {str(e)}")
            strengths = []
            areas_to_improve = []
        
        response_data = {
            'interview_id': feedback.interview_id,
            'interview_field': feedback.interview_field,
            'score': feedback.score,
            'strengths': strengths,
            'weaknesses': json.loads(feedback.weaknesses) if feedback.weaknesses else [],
            'areas_to_improve': areas_to_improve,
            'feedback_text': feedback.feedback_text,
            'created_at': feedback.created_at.isoformat()
        }
        
        print("\n[DEBUG] Response data:")
        print(json.dumps(response_data, indent=2))
        
        return jsonify(response_data)
    except Exception as e:
        print(f"\n[ERROR] Error in get_interview_feedback: {str(e)}")
        return jsonify({'error': str(e)}), 500

@main_routes.route('/get_interview_responses/<interview_id>', methods=['GET'])
@jwt_required()
def get_interview_responses(interview_id):
    try:
        user_id = get_jwt_identity()
        responses = ModelResponse.query.filter_by(interview_id=interview_id, user_id=user_id).order_by(ModelResponse.timestamp).all()
        if not responses:
            return jsonify([])  # Return empty array instead of error
        
        return jsonify([{
            'human_response': response.human_response,
            'llm_response': response.llm_response,
            'created_at': response.timestamp.isoformat()
        } for response in responses])
    except Exception as e:
        print(f"Error in get_interview_responses: {str(e)}")
        return jsonify({'error': str(e)}), 500

@main_routes.route('/get_score_distribution', methods=['GET'])
@jwt_required()
def get_score_distribution():
    try:
        user_id = get_jwt_identity()
        # Get all feedback for the user
        feedbacks = InterviewFeedback.query.filter_by(user_id=user_id).all()
        
        # Initialize distribution counters
        distribution = [0, 0, 0, 0, 0]  # 0-20, 21-40, 41-60, 61-80, 81-100
        
        # Count scores in each range
        for feedback in feedbacks:
            score = feedback.score
            if score <= 20:
                distribution[0] += 1
            elif score <= 40:
                distribution[1] += 1
            elif score <= 60:
                distribution[2] += 1
            elif score <= 80:
                distribution[3] += 1
            else:
                distribution[4] += 1
        
        return jsonify(distribution)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@main_routes.route('/get_score_trend', methods=['GET'])
@jwt_required()
def get_score_trend():
    try:
        user_id = get_jwt_identity()
        # Get last 10 feedback entries ordered by date
        feedbacks = InterviewFeedback.query.filter_by(user_id=user_id)\
            .order_by(InterviewFeedback.created_at.desc())\
            .limit(10)\
            .all()
        
        # Prepare data in reverse chronological order
        scores = [feedback.score for feedback in reversed(feedbacks)]
        dates = [feedback.created_at.strftime('%Y-%m-%d') for feedback in reversed(feedbacks)]
        
        return jsonify({
            'labels': dates,
            'data': scores
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@main_routes.route('/get_field_performance', methods=['GET'])
@jwt_required()
def get_field_performance():
    try:
        user_id = get_jwt_identity()
        # Get all unique interview fields
        fields = db.session.query(InterviewFeedback.interview_field)\
            .filter_by(user_id=user_id)\
            .distinct()\
            .all()
        
        field_data = []
        for field in fields:
            # Calculate average score for each field
            avg_score = db.session.query(db.func.avg(InterviewFeedback.score))\
                .filter_by(user_id=user_id, interview_field=field[0])\
                .scalar()
            
            field_data.append({
                'field': field[0],
                'score': round(avg_score or 0, 2)
            })
        
        # Sort by score in descending order
        field_data.sort(key=lambda x: x['score'], reverse=True)
        
        return jsonify({
            'labels': [item['field'] for item in field_data],
            'data': [item['score'] for item in field_data]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@main_routes.route('/get_skills_assessment', methods=['GET'])
@jwt_required()
def get_skills_assessment():
    try:
        user_id = get_jwt_identity()
        # Get all feedback for the user
        feedbacks = InterviewFeedback.query.filter_by(user_id=user_id).all()
        
        # Initialize skill scores
        skills = {
            'Problem Solving': 0,
            'Communication': 0,
            'Technical Knowledge': 0,
            'Time Management': 0,
            'Code Quality': 0
        }
        
        # Count occurrences of each skill in strengths
        for feedback in feedbacks:
            if feedback.strengths:
                try:
                    strengths = json.loads(feedback.strengths)
                    for strength in strengths:
                        for skill in skills.keys():
                            if skill.lower() in strength.lower():
                                skills[skill] += 1
                except json.JSONDecodeError:
                    continue
        
        # Calculate percentages based on total feedback count
        total_feedbacks = len(feedbacks) or 1  # Avoid division by zero
        skill_scores = {skill: (count / total_feedbacks) * 100 for skill, count in skills.items()}
        
        return jsonify({
            'labels': list(skills.keys()),
            'data': list(skill_scores.values())
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@main_routes.route('/get_question_type_performance', methods=['GET'])
@jwt_required()
def get_question_type_performance():
    try:
        user_id = get_jwt_identity()
        # Get all feedback for the user
        feedbacks = InterviewFeedback.query.filter_by(user_id=user_id).all()
        
        # Initialize counters for each difficulty level
        performance = {
            'Easy': {'correct': 0, 'incorrect': 0},
            'Medium': {'correct': 0, 'incorrect': 0},
            'Hard': {'correct': 0, 'incorrect': 0}
        }
        
        # Analyze feedback text to determine question type and correctness
        for feedback in feedbacks:
            if feedback.feedback_text:
                # Extract difficulty level from feedback text
                difficulty = 'Medium'  # Default
                if 'easy' in feedback.feedback_text.lower():
                    difficulty = 'Easy'
                elif 'hard' in feedback.feedback_text.lower():
                    difficulty = 'Hard'
                
                # Determine if the answer was correct based on score
                is_correct = feedback.score >= 70  # Consider 70% as passing
                
                if is_correct:
                    performance[difficulty]['correct'] += 1
                else:
                    performance[difficulty]['incorrect'] += 1
        
        return jsonify({
            'labels': list(performance.keys()),
            'correct': [data['correct'] for data in performance.values()],
            'incorrect': [data['incorrect'] for data in performance.values()]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@main_routes.route('/get_time_performance', methods=['GET'])
@jwt_required()
def get_time_performance():
    try:
        user_id = get_jwt_identity()
        # Get all feedback for the user
        feedbacks = InterviewFeedback.query.filter_by(user_id=user_id).all()
        
        # Initialize time slots
        time_slots = {
            'Morning': {'count': 0, 'total_score': 0},  # 6-12
            'Afternoon': {'count': 0, 'total_score': 0},  # 12-18
            'Evening': {'count': 0, 'total_score': 0},  # 18-24
            'Night': {'count': 0, 'total_score': 0}  # 0-6
        }
        
        # Analyze feedback timestamps
        for feedback in feedbacks:
            hour = feedback.created_at.hour
            
            # Determine time slot
            if 6 <= hour < 12:
                slot = 'Morning'
            elif 12 <= hour < 18:
                slot = 'Afternoon'
            elif 18 <= hour < 24:
                slot = 'Evening'
            else:
                slot = 'Night'
            
            time_slots[slot]['count'] += 1
            time_slots[slot]['total_score'] += feedback.score
        
        # Calculate average scores
        averages = []
        for slot in time_slots.values():
            avg = slot['total_score'] / slot['count'] if slot['count'] > 0 else 0
            averages.append(round(avg, 2))
        
        return jsonify({
            'labels': list(time_slots.keys()),
            'data': averages
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@main_routes.route('/save_badges', methods=['POST'])
@jwt_required()
def save_badges():
    try:
        user_id = get_jwt_identity()
        data = request.json
        badges_to_save = data.get('badges', [])
        
        if not badges_to_save:
            return jsonify({'message': 'No badges to save'}), 200
            
        # First, check which badges are already saved to avoid duplicates
        existing_badges = Badge.query.filter_by(user_id=user_id).all()
        existing_badge_names = set(badge.badge_name for badge in existing_badges)
        
        # Filter out badges that are already saved
        new_badges = [badge for badge in badges_to_save if badge['badge_name'] not in existing_badge_names]
        
        if not new_badges:
            return jsonify({'message': 'All badges already saved'}), 200
            
        # Save new badges
        for badge_data in new_badges:
            badge = Badge(
                badge_name=badge_data['badge_name'],
                criteria=badge_data['criteria'],
                user_id=user_id,
                date_awarded=datetime.utcnow()
            )
            db.session.add(badge)
            
        db.session.commit()
        return jsonify({'message': f'Successfully saved {len(new_badges)} new badges'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@main_routes.route('/get_user_badges', methods=['GET'])
@jwt_required()
def get_user_badges():
    try:
        user_id = get_jwt_identity()
        
        # Get all the badges for the user
        badges = Badge.query.filter_by(user_id=user_id).all()
        
        # Format the badge data
        badge_data = [{
            'badge_id': badge.badge_id,
            'badge_name': badge.badge_name,
            'criteria': badge.criteria,
            'date_awarded': badge.date_awarded.isoformat()
        } for badge in badges]
        
        return jsonify(badge_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@main_routes.route('/get_badge_progress', methods=['GET'])
@jwt_required()
def get_badge_progress():
    """Get the user's progress toward earning each badge"""
    try:
        user_id = get_jwt_identity()
        
        # Get interview stats
        total_interviews = InterviewFeedback.query.filter_by(user_id=user_id).count()
        
        highest_score = db.session.query(db.func.max(InterviewFeedback.score))\
            .filter_by(user_id=user_id)\
            .scalar() or 0
            
        # Get score trend to detect improvement
        feedbacks = InterviewFeedback.query.filter_by(user_id=user_id)\
            .order_by(InterviewFeedback.created_at)\
            .all()
            
        # Calculate score improvement
        score_improvement = 0
        if len(feedbacks) >= 2:
            score_improvement = feedbacks[-1].score - feedbacks[0].score
            
        # Get existing badges
        existing_badges = Badge.query.filter_by(user_id=user_id).all()
        existing_badge_names = set(badge.badge_name for badge in existing_badges)
        
        # Define badge progress
        badge_progress = [
            {
                "id": 1,
                "name": "First Step",
                "description": "Completed your first interview",
                "current": total_interviews,
                "required": 1,
                "progress": min(100, (total_interviews / 1) * 100),
                "unlocked": "First Step" in existing_badge_names or total_interviews >= 1
            },
            {
                "id": 2,
                "name": "Getting Started",
                "description": "Completed 3 interviews",
                "current": total_interviews,
                "required": 3,
                "progress": min(100, (total_interviews / 3) * 100),
                "unlocked": "Getting Started" in existing_badge_names or total_interviews >= 3
            },
            {
                "id": 3,
                "name": "On Fire",
                "description": "Completed 5 interviews",
                "current": total_interviews,
                "required": 5,
                "progress": min(100, (total_interviews / 5) * 100),
                "unlocked": "On Fire" in existing_badge_names or total_interviews >= 5
            },
            {
                "id": 4,
                "name": "Score Champion",
                "description": "Achieved a score of 80 or higher",
                "current": highest_score,
                "required": 80,
                "progress": min(100, (highest_score / 80) * 100),
                "unlocked": "Score Champion" in existing_badge_names or highest_score >= 80
            },
            {
                "id": 5,
                "name": "High Achiever",
                "description": "Achieved a score of 90 or higher",
                "current": highest_score,
                "required": 90,
                "progress": min(100, (highest_score / 90) * 100),
                "unlocked": "High Achiever" in existing_badge_names or highest_score >= 90
            },
            {
                "id": 6,
                "name": "Rising Star",
                "description": "Improved score by 20+ points",
                "current": score_improvement,
                "required": 20,
                "progress": min(100, (score_improvement / 20) * 100),
                "unlocked": "Rising Star" in existing_badge_names or score_improvement >= 20
            },
            {
                "id": 7,
                "name": "Feedback Master",
                "description": "Implemented feedback suggestions",
                "current": 1 if total_interviews >= 2 else 0,  # Assume implemented if they've done multiple interviews
                "required": 1,
                "progress": 100 if total_interviews >= 2 else 0,
                "unlocked": "Feedback Master" in existing_badge_names or total_interviews >= 2
            }
        ]
        
        return jsonify(badge_progress), 200
        
    except Exception as e:
        print(f"Error in get_badge_progress: {str(e)}")
        return jsonify({'error': str(e)}), 500

