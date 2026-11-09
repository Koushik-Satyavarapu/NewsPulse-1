from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.core.gnews import fetch_gnews
from app.core.nlp import clean_articles, analyze_sentiment, extract_trends, get_keyword_frequency
from app.core.llm import generate_article_summary, answer_article_question
from app.core.db import search_logs
from datetime import datetime

router = APIRouter(prefix="/news", tags=["news"])

class SummaryRequest(BaseModel):
    title: str
    description: str

class AskRequest(BaseModel):
    title: str
    description: str
    question: str

@router.get("/search")
async def search_news(city: Optional[str] = None, category: Optional[str] = None, keyword: Optional[str] = None):
    country = "in" if city else None
    query_text = " ".join(filter(None, [keyword, category, city])) or "news"

    try:
        raw = await fetch_gnews(query_text, country=country)
    except Exception:
        raw = {
            "articles": [
                {
                    "title": "Artificial Intelligence Systems Reach Advanced Vector Scaling Milestones",
                    "description": "Global engineering clusters report massive efficiency gains in modern neural parsing layouts.",
                    "url": "https://example.com/ai-news",
                    "image": "",
                    "publishedAt": datetime.utcnow().isoformat(),
                    "source": {"name": "TechPulse Core"}
                }
            ]
        }

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
        "articles": enriched[:12],
        "total": len(enriched)
    }

@router.post("/summarize")
async def summarize_article_endpoint(payload: SummaryRequest):
    summary = generate_article_summary(payload.title, payload.description)
    return {"summary": summary}

@router.post("/ask")
async def ask_article_endpoint(payload: AskRequest):
    if not payload.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")
    answer = answer_article_question(payload.title, payload.description, payload.question.strip())
    return {"answer": answer}

@router.get("/history")
async def get_history():
    return list(search_logs.find({}, {"_id": 0}).sort("searched_at", -1).limit(20))