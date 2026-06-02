from fastapi import Header, HTTPException, status
from app.core.db import sessions

async def get_current_user_id(authorization: str = Header(None, alias="Authorization")) -> str:
    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session token missing.")
    
    token = authorization.replace("Bearer ", "").strip()
    session = sessions.find_one({"token": token})
    if not session:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Active session expired or invalid.")
        
    return str(session["user_id"])