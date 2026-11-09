import axios from 'axios';

const API_BASE_URL = 'https://newspulse-1-ane6.onrender.com'; 

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('news_pulse_session');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const searchNews = async (query: any) => {
  const response = await api.get('/news/search', { params: query }); 
  return response.data;
};

// --- LLM ENDPOINTS ---
export const summarizeArticle = async (title: string, description: string) => {
  const response = await api.post('/news/summarize', { title, description });
  return response.data;
};

export const askArticleQuestion = async (title: string, description: string, question: string) => {
  const response = await api.post('/news/ask', { title, description, question });
  return response.data;
};

export const loginUser = async (credentials: any) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const registerUser = async (credentials: any) => {
  const response = await api.post('/auth/register', credentials);
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get('/profile'); 
  return response.data;
};

export const updateProfile = async (data: any) => {
  const response = await api.put('/profile/update', data); 
  return response.data;
};

export const getPreferences = async () => {
  const response = await api.get('/preferences'); 
  return response.data;
};

export const updatePreferences = async (data: any) => {
  const response = await api.put('/preferences', data); 
  return response.data;
};

export const getBookmarks = async () => {
  const response = await api.get('/bookmarks/user'); 
  return response.data;
};

export const saveBookmark = async (article: any) => {
  const cleanedPayload = {
    title: article.title || 'Untitled Reference',
    description: article.description || 'No description available.',
    url: article.url,
    publishedAt: article.publishedAt || new Date().toISOString(),
    source: typeof article.source === 'object' ? (article.source?.name || 'Unknown Hub') : String(article.source || 'Unknown Hub'),
    sentiment: article.sentiment || 'Neutral'
  };

  const response = await api.post('/bookmarks/add', cleanedPayload); 
  return response.data;
};

export const removeBookmark = async (url: string) => {
  const response = await api.delete('/bookmarks/remove', { params: { url } }); 
  return response.data;
};

export const getHistory = async () => {
  const response = await api.get('/news/history'); 
  return response.data;
};