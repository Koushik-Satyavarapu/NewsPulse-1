// frontend/src/services/api.ts
import axios from 'axios';

// Point directly to your live Render backend URL
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
  const response = await api.get('/news/search', { params: query }); 
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

// --- CORRECTED PROFILE PATHS ---
export const getProfile = async () => {
  const response = await api.get('/profile'); // Fixed: Removed /users
  return response.data;
};

export const updateProfile = async (data: any) => {
  const response = await api.put('/profile/update', data); // Fixed: Added /update
  return response.data;
};

// --- CORRECTED PREFERENCES PATHS ---
export const getPreferences = async () => {
  const response = await api.get('/preferences'); // Fixed: Removed /users
  return response.data;
};

export const updatePreferences = async (data: any) => {
  const response = await api.put('/preferences', data); // Fixed: Removed /users
  return response.data;
};

// --- CORRECTED BOOKMARKS PATHS ---
export const getBookmarks = async () => {
  const response = await api.get('/bookmarks/user'); // Fixed: Pointed to /bookmarks/user
  return response.data;
};

export const saveBookmark = async (article: any) => {
  const response = await api.post('/bookmarks/add', article); // Fixed: Pointed to /bookmarks/add
  return response.data;
};

export const removeBookmark = async (url: string) => {
  // Fixed: Passed url as a query param or request configuration to match backend delete endpoint
  const response = await api.delete('/bookmarks/remove', { params: { url } }); 
  return response.data;
};

// --- CORRECTED RECENT ACTIVITY HISTORY PATH ---
export const getHistory = async () => {
  const response = await api.get('/news/history'); // Fixed: Prefixed with /news to match news.py
  return response.data;
};