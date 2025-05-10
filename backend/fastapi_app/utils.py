import jwt
from fastapi import HTTPException
from app.models import Session, User, db
from datetime import datetime
import os
from dotenv import load_dotenv
from fastapi_app.settings import settings
# Load environment variables
load_dotenv()



def verify_token(token: str) -> int:
    """
    Verify the JWT token and return the user_id if valid.
    
    Args:
        token: The JWT token to verify
        
    Returns:
        int: The user_id if token is valid
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        # First verify the JWT token
        try:
            payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=["HS256"])
            user_id = payload.get("user_id")
            if not user_id:
                raise HTTPException(status_code=401, detail="Invalid token payload")
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token has expired")
        except jwt.InvalidTokenError:
            raise HTTPException(status_code=401, detail="Invalid token")

        # Then check if token exists in Session table
        session = Session.query.filter_by(token=token, is_valid=True).first()
        if not session:
            raise HTTPException(status_code=401, detail="Session not found")
            
        # Check if session is expired
        if session.expires_at and session.expires_at < datetime.utcnow():
            session.is_valid = False
            db.session.commit()
            raise HTTPException(status_code=401, detail="Session expired")
            
        # Get user from session
        user = User.query.get(session.user_id)
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
            
        return user.user_id
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error verifying token: {str(e)}")
        raise HTTPException(status_code=401, detail="Token verification failed")
