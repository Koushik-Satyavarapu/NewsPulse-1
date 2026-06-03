import axios from 'axios';

const API_BASE_URL = 'https://newspulse-1-ane6.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('news_pulse_session');

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ---------------- NEWS ----------------

export const searchNews = async (query: any) => {
  const response = await api.get('/news/search', {
    params: query,
  });

  return response.data;
};

export const getHistory = async () => {
  const response = await api.get('/news/history');

  return response.data;
};

// ---------------- AUTH ----------------

export const loginUser = async (credentials: any) => {
  const response = await api.post('/auth/login', credentials);

  return response.data;
};

export const registerUser = async (credentials: any) => {
  const response = await api.post('/auth/register', credentials);

  return response.data;
};

// ---------------- PROFILE ----------------

export const getProfile = async () => {
  const response = await api.get('/users/profile');

  return response.data;
};

export const updateProfile = async (data: any) => {
  const response = await api.put('/users/profile', data);

  return response.data;
};

// ---------------- PREFERENCES ----------------

export const getPreferences = async () => {
  const response = await api.get('/users/preferences');

  return response.data;
};

export const updatePreferences = async (data: any) => {
  const response = await api.put('/users/preferences', data);

  return response.data;
};

// ---------------- BOOKMARKS ----------------

export const getBookmarks = async () => {
  const response = await api.get('/bookmarks/user');

  return response.data;
};

export const saveBookmark = async (article: any) => {

  const cleanedPayload = {
    title: article.title || 'Untitled',
    description: article.description || 'No description available',
    url: article.url,
    publishedAt: article.publishedAt || new Date().toISOString(),
    source:
      typeof article.source === 'object'
        ? article.source?.name || 'Unknown'
        : article.source || 'Unknown',
    sentiment: article.sentiment || 'Neutral',
  };

  const response = await api.post(
    '/bookmarks/add',
    cleanedPayload
  );

  return response.data;
};

export const removeBookmark = async (url: string) => {
  const response = await api.delete(
    '/bookmarks/remove',
    {
      params: { url },
    }
  );

  return response.data;
};

export default api;