// frontend/src/services/api.ts
import axios from 'axios';

// Update this line to point to your brand new live backend URL!
const API_BASE_URL = 'https://newspulse-1-ane6.onrender.com'; 

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

export const searchNews = async (query: any) => {
  // Removed /api -> Now matches backend news router prefix
  const response = await api.post('/news/search', query); 
  return response.data;
};

export const loginUser = async (credentials: any) => {
  // Removed /api -> Now matches backend /auth/login
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const registerUser = async (credentials: any) => {
  // Removed /api -> Now matches backend /auth/register
  const response = await api.post('/auth/register', credentials);
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

export const updateProfile = async (data: any) => {
  const response = await api.put('/users/profile', data);
  return response.data;
};

export const getPreferences = async () => {
  const response = await api.get('/users/preferences');
  return response.data;
};

export const updatePreferences = async (data: any) => {
  const response = await api.put('/users/preferences', data);
  return response.data;
};

export const getBookmarks = async () => {
  const response = await api.get('/bookmarks');
  return response.data;
};

export const saveBookmark = async (article: any) => {
  const response = await api.post('/bookmarks', article);
  return response.data;
};

export const removeBookmark = async (url: string) => {
  const response = await api.delete('/bookmarks', { data: { url } });
  return response.data;
};

export const getHistory = async () => {
  const response = await api.get('/history');
  return response.data;
};