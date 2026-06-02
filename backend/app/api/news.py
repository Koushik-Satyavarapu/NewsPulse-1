from fastapi import APIRouter, HTTPException
from typing import Optional
from app.core.gnews import fetch_gnews
from app.core.nlp import clean_articles, analyze_sentiment, extract_trends, get_keyword_frequency
from app.core.db import search_logs
from datetime import datetime
import hashlib

router = APIRouter(prefix="/news", tags=["news"])

def get_cache_key(city: Optional[str], category: Optional[str], keyword: Optional[str]) -> str:
    key = f"{city or ''}|{category or ''}|{keyword or ''}".lower()
    return hashlib.sha256(key.encode()).hexdigest()

@router.get("/search")
async def search_news(city: Optional[str] = None, category: Optional[str] = None, keyword: Optional[str] = None):
    country = "in" if city else None
    query_text = " ".join(filter(None, [keyword, category, city])) or "news"

    try:
        raw = await fetch_gnews(query_text, country=country)
    except Exception:
        raise HTTPException(status_code=502, detail="GNews API failed")

    articles = clean_articles(raw.get("articles", []))
    titles_desc = [f"{a['title']} {a.get('description','')}" for a in articles]

    trending = extract_trends(titles_desc, 10)
    enriched, sentiment_dist = analyze_sentiment(articles)
    keywords = get_keyword_frequency(titles_desc, 8)

    try:
        search_logs.insert_one({
            "city": city,
            "category": category,
            "keyword": keyword,
            "searched_at": datetime.utcnow().isoformat()
        })
    except Exception:
        pass

    return {
        "trending": trending,
        "sentiments": sentiment_dist,
        "keywords": keywords,
        "articles": enriched[:12],  # Cap displaying limit to 12
        "total": len(enriched)
    }

@router.get("/history")
async def get_history():
    return list(search_logs.find({}, {"_id": 0}).sort("searched_at", -1).limit(20))