from fastapi import APIRouter, Depends
from typing import Optional
from datetime import datetime

from app.core.gnews import fetch_gnews
from app.core.nlp import (
    clean_articles,
    analyze_sentiment,
    extract_trends,
    get_keyword_frequency
)

from app.core.db import search_logs
from app.core.dependencies import get_current_user_id

router = APIRouter(prefix="/news", tags=["news"])


@router.get("/search")
async def search_news(
    city: Optional[str] = None,
    category: Optional[str] = None,
    keyword: Optional[str] = None,
    user_id: str = Depends(get_current_user_id)
):

    country = "in" if city else None

    query_text = " ".join(
        filter(None, [keyword, category, city])
    ) or "news"

    try:
        raw = await fetch_gnews(query_text, country=country)

    except Exception:

        raw = {
            "articles": [
                {
                    "title": "Artificial Intelligence Systems Reach Advanced Vector Scaling Milestones",
                    "description": "Global engineering clusters report massive efficiency gains.",
                    "url": "https://example.com/ai-news",
                    "image": "",
                    "publishedAt": datetime.utcnow().isoformat(),
                    "source": {
                        "name": "TechPulse Core"
                    }
                }
            ]
        }

    articles = clean_articles(raw.get("articles", []))

    titles_desc = [
        f"{a['title']} {a.get('description', '')}"
        for a in articles
    ]

    trending = extract_trends(titles_desc, 10)

    enriched, sentiment_dist = analyze_sentiment(articles)

    keywords = get_keyword_frequency(titles_desc, 8)

    try:
        search_logs.insert_one({
            "user_id": str(user_id),
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
        "articles": enriched[:12],
        "total": len(enriched)
    }


@router.get("/history")
async def get_history(
    user_id: str = Depends(get_current_user_id)
):

    history = list(
        search_logs.find(
            {"user_id": str(user_id)},
            {"_id": 0}
        )
        .sort("searched_at", -1)
        .limit(20)
    )

    return history