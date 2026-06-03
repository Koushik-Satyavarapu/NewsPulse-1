from fastapi import Header, HTTPException, status
from datetime import datetime

from app.core.db import sessions


async def get_current_user_id(
    authorization: str = Header(None, alias="Authorization")
) -> str:

    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session token missing."
        )

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization format."
        )

    token = authorization.replace("Bearer ", "").strip()

    session = sessions.find_one({"token": token})

    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session."
        )

    expires_at = datetime.fromisoformat(session["expires_at"])

    if datetime.utcnow() > expires_at:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired."
        )

    return str(session["user_id"])