from typing import List, Dict, Tuple
import re
from nltk.sentiment import SentimentIntensityAnalyzer
from sklearn.feature_extraction.text import TfidfVectorizer
from collections import Counter

_sia = SentimentIntensityAnalyzer()

def clean_articles(articles: List[Dict]) -> List[Dict]:
    seen = set()
    cleaned = []
    for a in articles:
        title = (a.get("title") or "").strip()
        url = (a.get("url") or "").strip()
        if not title or not url:
            continue
        key = (title.lower(), url.lower())
        if key in seen:
            continue
        seen.add(key)
        cleaned.append({
            "title": title,
            "description": (a.get("description") or "").strip(),
            "url": url,
            "publishedAt": (a.get("publishedAt") or "")[:10],
            "source": a.get("source", {}).get("name", "General News")
        })
    return cleaned

def analyze_sentiment(articles: List[Dict]) -> Tuple[List[Dict], Dict[str, int]]:
    dist = {"Positive": 0, "Neutral": 0, "Negative": 0}
    enhanced = []
    for a in articles:
        text = f"{a.get('title','')} {a.get('description','')}"
        scores = _sia.polarity_scores(text)
        comp = scores["compound"]
        label = "Positive" if comp >= 0.05 else "Negative" if comp <= -0.05 else "Neutral"
        dist[label] += 1
        
        a2 = dict(a)
        a2["sentiment"] = label
        a2["scores"] = scores
        enhanced.append(a2)
    return enhanced, dist

def extract_trends(texts: List[str], top_k: int = 8) -> List[str]:
    if not texts or len(texts) < 2:
        return ["Global breaking", "Market Trends", "General Updates"]
    try:
        vect = TfidfVectorizer(max_features=1000, stop_words='english', ngram_range=(1, 2))
        X = vect.fit_transform(texts)
        avg = X.mean(axis=0).A1
        feat = vect.get_feature_names_out()
        pairs = sorted(zip(feat, avg), key=lambda x: x[1], reverse=True)
        return [w.title() for w, _ in pairs[:top_k]]
    except Exception:
        return ["News Telemetry"]

def get_keyword_frequency(texts: List[str], top_k: int = 6):
    tokens = []
    for t in texts:
        tokens.extend(re.findall(r'\b[a-zA-Z]{4,}\b', t.lower()))
    stop = {"the","is","and","of","to","in","for","on","at","from","by","with","a","an","as","it","be","are","was","this","that","will","have"}
    cnt = Counter([w for w in tokens if w not in stop])
    return [{"keyword": k.upper(), "frequency": v} for k, v in cnt.most_common(top_k)]