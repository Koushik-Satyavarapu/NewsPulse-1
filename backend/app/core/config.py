import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    MONGO_DB: str = os.getenv("MONGO_DB", "newspulse")
    GNEWS_API_KEY: str = os.getenv("GNEWS_API_KEY", "")
    CACHE_TTL_SECONDS: int = 1200  # 20 minutes

settings = Settings()