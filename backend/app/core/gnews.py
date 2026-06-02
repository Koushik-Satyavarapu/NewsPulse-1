import httpx
from app.core.config import settings

BASE_URL = "https://gnews.io/api/v4/search"

async def fetch_gnews(keyword: str, country: str = None, max_results: int = 25):
    params = {
        "q": keyword or "news",
        "lang": "en",
        "max": max_results,
        "apikey": settings.GNEWS_API_KEY
    }
    if country:
        params["country"] = country

    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.get(BASE_URL, params=params)
        response.raise_for_status()
        return response.json()