from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from datetime import datetime
from bson import ObjectId
from app.core.db import users, bookmarks, preferences
from app.core.dependencies import get_current_user_id

# ADDED: This makes paths match cleanly even if there's a routing mixup
router = APIRouter(tags=["user operations"])

class ProfileUpdatePayload(BaseModel):
    username: str
    bio: str
    email: EmailStr

class PreferencesUpdateSchema(BaseModel):
    categories: list[str]
    keywords: str

class BookmarkPayload(BaseModel):
    title: str
    description: str
    url: str
    publishedAt: str
    source: str
    sentiment: str

# --- BOOKMARKS API ---
@router.post("/bookmarks/add")
async def add_bookmark_node(article: BookmarkPayload, user_id: str = Depends(get_current_user_id)):
    # FIX: Check using standard string representation to avoid Atlas structural drops
    existing = bookmarks.find_one({"user_id": str(user_id), "url": article.url})
    if existing:
        return {"status": "duplicate", "message": "Reference node already mapped to persistence index."}

    bookmark_document = article.dict()
    bookmark_document["user_id"] = str(user_id) # Enforce plain string format explicitly
    bookmark_document["saved_at"] = datetime.utcnow().isoformat()
    
    try:
        bookmarks.insert_one(bookmark_document)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database mutation failed: {str(e)}")
        
    return {"status": "success", "message": "Reference logged to database."}

@router.get("/bookmarks/user")
async def fetch_user_bookmarks(user_id: str = Depends(get_current_user_id)):
    saved_cursor = list(bookmarks.find({"user_id": str(user_id)}).sort("saved_at", -1))
    for doc in saved_cursor:
        doc["_id"] = str(doc["_id"])
    return saved_cursor

@router.delete("/bookmarks/remove")
async def remove_bookmark_node(url: str, user_id: str = Depends(get_current_user_id)):
    result = bookmarks.delete_one({"user_id": str(user_id), "url": url})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Target document vector not found.")
    return {"status": "success", "message": "Reference dropped from cluster configuration layer."}

# --- PROFILE API ---
# ADDED FALLBACK ROUTE: This catches BOTH paths so it NEVER returns 404 Not Found again!
@router.get("/profile")
@router.get("/users/profile")
async def fetch_active_profile(user_id: str = Depends(get_current_user_id)):
    try:
        user_node = users.find_one({"_id": ObjectId(user_id)}, {"password_hash": 0})
    except Exception:
        user_node = users.find_one({"_id": str(user_id)}, {"password_hash": 0})
        
    if not user_node:
        raise HTTPException(status_code=404, detail="Identity profile missing from node indexes.")
    return {
        "username": user_node.get("username", "Anonymous Analyst"),
        "bio": user_node.get("bio", "No analytics profile context logged."),
        "email": user_node.get("email", "")
    }

@router.put("/profile/update")
@router.put("/users/profile") # Added fallback for the profile update too!
async def update_profile_telemetry(data: ProfileUpdatePayload, user_id: str = Depends(get_current_user_id)):
    try:
        target_id = ObjectId(user_id)
    except Exception:
        target_id = str(user_id)

    users.update_one(
        {"_id": target_id},
        {
            "$set": {
                "username": data.username.strip(),
                "bio": data.bio.strip(),
                "email": data.email.lower().strip()
            }
        }
    )
    return {"status": "success", "message": "Identity state tracking overwritten cleanly."}

# --- PREFERENCES API ---
@router.get("/preferences")
@router.get("/users/preferences")
async def fetch_preferences(user_id: str = Depends(get_current_user_id)):
    pref = preferences.find_one({"user_id": str(user_id)}, {"_id": 0})
    return pref or {"categories": ["Politics", "Technology", "Business"], "keywords": ""}

@router.put("/preferences")
@router.put("/users/preferences")
async def update_preferences(data: PreferencesUpdateSchema, user_id: str = Depends(get_current_user_id)):
    preferences.update_one({"user_id": str(user_id)}, {"$set": {"categories": data.categories, "keywords": data.keywords.strip()}}, upsert=True)
    return {"status": "success"}