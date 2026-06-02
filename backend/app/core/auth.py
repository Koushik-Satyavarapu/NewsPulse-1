import secrets
from datetime import datetime, timedelta
import bcrypt
from app.core.db import sessions

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

def create_user_session(user_id: str) -> str:
    session_token = secrets.token_urlsafe(32)
    session_data = {
        "user_id": str(user_id),
        "token": session_token,
        "login_time": datetime.utcnow().isoformat(),
        "expires_at": (datetime.utcnow() + timedelta(days=7)).isoformat()
    }
    sessions.insert_one(session_data)
    return session_token