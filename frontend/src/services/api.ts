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

export const loginUser = async (credentials: any) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const registerUser = async (credentials: any) => {
  const response = await api.post('/auth/register', credentials);
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get('/users/profile'); // Ensure NO trailing slash here!
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