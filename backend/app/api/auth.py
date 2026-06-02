from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from datetime import datetime
from app.core.db import users, preferences
from app.core.auth import hash_password, verify_password, create_user_session

router = APIRouter(prefix="/auth", tags=["authentication"])

class UserRegisterSchema(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLoginSchema(BaseModel):
    email: EmailStr
    password: str

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_account(user_data: UserRegisterSchema):
    if users.find_one({"email": user_data.email.lower()}):
        raise HTTPException(status_code=400, detail="Email already registered.")
    if users.find_one({"username": user_data.username.strip()}):
        raise HTTPException(status_code=400, detail="Username already claimed.")

    hashed = hash_password(user_data.password)
    new_user = {
        "username": user_data.username.strip(),
        "email": user_data.email.lower(),
        "password_hash": hashed,
        "bio": "Enterprise infrastructure information matrix collector.",
        "created_at": datetime.utcnow().isoformat()
    }
    inserted = users.insert_one(new_user)
    user_id = str(inserted.inserted_id)

    preferences.insert_one({
        "user_id": user_id,
        "categories": ["Politics", "Technology", "Business", "Science"],
        "keywords": "AI, Quantum, Vector Core"
    })

    token = create_user_session(user_id)
    return {"status": "success", "session_token": token, "username": new_user["username"]}

@router.post("/login")
async def login_account(credentials: UserLoginSchema):
    user = users.find_one({"email": credentials.email.lower()})
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credential combination.")

    token = create_user_session(user["_id"])
    return {"status": "success", "session_token": token, "username": user["username"]}