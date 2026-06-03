# NewsPulse — AI-Powered News Trend Analyzer

NewsPulse is a modern full-stack AI-powered news analytics platform that allows users to explore real-time news, analyze sentiment trends, save bookmarks, personalize preferences, and monitor trending topics through an interactive dashboard.

Built using **React + Vite + TypeScript** on the frontend and **FastAPI + MongoDB Atlas** on the backend.

---

# Live Deployment

### Frontend

https://news-pulse-1-liard.vercel.app

### Backend

https://newspulse-1-ane6.onrender.com

---

# Features

## Authentication & User System

* Secure user registration and login
* Session-based authentication
* User profile management
* Personalized preferences
* Persistent sessions

---

## AI News Analytics

* Real-time news search
* Sentiment analysis using NLTK VADER
* Trending keyword extraction
* High-density token analysis
* NLP-powered news insights

---

## User Personalization

* Save and remove bookmarks
* Personalized search history
* User-specific activity tracking
* Custom news preferences

---

## Modern Responsive UI

* Responsive laptop and mobile layouts
* Floating collapsible sidebar
* Text-focused analytics cards
* Interactive dashboard interface
* Smooth responsive transitions

---

# Tech Stack

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Axios
* Lucide React

## Backend

* FastAPI
* MongoDB Atlas
* PyMongo
* bcrypt
* HTTPX
* NLTK

## Deployment

* Vercel (Frontend)
* Render (Backend)

---

# Project Structure

```text
NewsPulse/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   └── main.py
│   │
│   └── requirements.txt
│
├── frontend/
│   └── src/
│       ├── components/
│       ├── services/
│       └── App.tsx
│
├── README.md
├── LICENSE
└── .env.example
```

---

# Environment Variables

## Frontend (`frontend/.env`)

```env
VITE_API_URL=https://newspulse-1-ane6.onrender.com
```

---

## Backend (`backend/.env`)

```env
MONGO_URI=YOUR_MONGODB_ATLAS_URI
MONGO_DB=NewsPulseDB
GNEWS_API_KEY=YOUR_GNEWS_API_KEY
```

---

# API Endpoints

## Authentication

* `POST /auth/register`
* `POST /auth/login`

---

## News

* `GET /news/search`
* `GET /news/history`

---

## Bookmarks

* `POST /bookmarks/add`
* `GET /bookmarks/user`
* `DELETE /bookmarks/remove`

---

## Profile

* `GET /profile`
* `PUT /profile/update`

---

## Preferences

* `GET /preferences`
* `PUT /preferences`

---

# Local Development

## Clone Repository

```bash
git clone https://github.com/your-username/newspulse.git
cd newspulse
```

---

## Backend Setup

```bash
cd backend

pip install -r requirements.txt

uvicorn app.main:app --reload
```

Backend runs on:

```text
http://127.0.0.1:8000
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

# Future Improvements

* JWT Authentication
* AI Summarization
* Infinite Scroll
* Advanced Analytics Charts
* Recommendation Engine
* Dark/Light Theme Toggle
* Real-time News Streaming

---

# License

This project is licensed under the MIT License.

---

# Author

Koushik Satyavarapu
