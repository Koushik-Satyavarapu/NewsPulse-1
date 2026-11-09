import os
from google import genai
from app.core.config import settings

api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY")
client = genai.Client(api_key=api_key) if api_key else None

def generate_article_summary(title: str, description: str) -> str:
    if not client:
        return f"Brief: {description or title}"
    try:
        prompt = (
            f"You are a concise financial and news intelligence analyst. Provide a 2-3 bullet point summary "
            f"of the key facts, impact, and takeaways for the following news item:\n\n"
            f"Headline: {title}\n"
            f"Context: {description}\n\n"
            f"Keep it under 60 words. No intro fluff, just clean bullets."
        )
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        return response.text.strip()
    except Exception as e:
        return f"Unable to generate summary: {str(e)}"

def answer_article_question(title: str, description: str, question: str) -> str:
    if not client:
        return "AI analysis engine offline. Please set GEMINI_API_KEY."
    try:
        prompt = (
            f"You are NewsPulse AI Assistant. Answer the user's specific question strictly using the provided news context. "
            f"If the answer cannot be determined from the context, state that clearly and provide the closest logical insight.\n\n"
            f"Article Headline: {title}\n"
            f"Article Description: {description}\n\n"
            f"User Question: {question}\n\n"
            f"Answer concisely in 1-3 sentences:"
        )
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        return response.text.strip()
    except Exception as e:
        return f"Error analyzing question: {str(e)}"