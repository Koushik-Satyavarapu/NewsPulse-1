import sys
from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.errors import ConnectionFailure
from app.core.config import settings

try:
    client = MongoClient(settings.MONGO_URI, serverSelectionTimeoutMS=5000)
    db = client[settings.MONGO_DB]
    client.admin.command('ping')
    print("✨ MongoDB Engine Connected Successfully & Handshake Confirmed.")
except ConnectionFailure as e:
    print(f"❌ Critical: Unable to baseline database connectivity: {e}")
    sys.exit(1)

search_logs = db["search_logs"]
users = db["users"]
bookmarks = db["bookmarks"]
preferences = db["preferences"]
sessions = db["sessions"]

search_logs.create_index([("searched_at", DESCENDING)])
users.create_index([("email", ASCENDING)], unique=True)
users.create_index([("username", ASCENDING)], unique=True)
bookmarks.create_index([("user_id", ASCENDING), ("saved_at", DESCENDING)])
bookmarks.create_index([("url", ASCENDING)])
preferences.create_index([("user_id", ASCENDING)], unique=True)
sessions.create_index([("token", ASCENDING)], unique=True)
sessions.create_index([("user_id", ASCENDING)])