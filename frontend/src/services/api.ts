import axios from 'axios';

// 1. CHANGE THIS LINE: Replace localhost with your actual live Render Web Service URL!
// It usually looks like: https://your-service-name.onrender.com
const API_BASE_URL = 'https://newspulse-backend.onrender.com'; 

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject your token into cloud requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('news_pulse_session');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ... rest of your existing API functions continue exactly the same below ...
export const searchNews = async (query: any) => {
  const response = await api.post('/api/news/search', query);
  return response.data;
};

export const loginUser = async (credentials: any) => {
  const response = await api.post('/api/auth/login', credentials);
  return response.data;
};

export const registerUser = async (credentials: any) => {
  const response = await api.post('/api/auth/register', credentials);
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get('/api/users/profile');
  return response.data;
};

export const updateProfile = async (data: any) => {
  const response = await api.put('/api/users/profile', data);
  return response.data;
};

export const getPreferences = async () => {
  const response = await api.get('/api/users/preferences');
  return response.data;
};

export const updatePreferences = async (data: any) => {
  const response = await api.put('/api/users/preferences', data);
  return response.data;
};

export const getBookmarks = async () => {
  const response = await api.get('/api/bookmarks');
  return response.data;
};

export const saveBookmark = async (article: any) => {
  const response = await api.post('/api/bookmarks', article);
  return response.data;
};

export const removeBookmark = async (url: string) => {
  const response = await api.delete('/api/bookmarks', { data: { url } });
  return response.data;
};

export const getHistory = async () => {
  const response = await api.get('/api/history');
  return response.data;
};