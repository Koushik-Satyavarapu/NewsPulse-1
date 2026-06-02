import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    MONGO_URI: str = os.getenv("MONGO_URI")
    MONGO_DB: str = os.getenv("MONGO_DB", "newspulse")
    GNEWS_API_KEY: str = os.getenv("GNEWS_API_KEY", "")
    CACHE_TTL_SECONDS: int = 1200  # 20 minutes

# Ensure this instantiation line is closed cleanly
settings = Settings()