import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("news_pulse_session");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const searchNews = async (params: any) => {
  const res = await api.get("/news/search", { params });
  return res.data;
};

export const getHistory = async () => {
  const res = await api.get("/news/history");
  return res.data;
};

export const registerUser = async (data: any) => {
  const res = await api.post("/auth/register", data);
  return res.data;
};

export const loginUser = async (data: any) => {
  const res = await api.post("/auth/login", data);
  return res.data;
};

export const getProfile = async () => {
  const res = await api.get("/profile");
  return res.data;
};

export const updateProfile = async (data: any) => {
  const res = await api.put("/profile/update", data);
  return res.data;
};

export const getPreferences = async () => {
  const res = await api.get("/preferences");
  return res.data;
};

export const updatePreferences = async (data: any) => {
  const res = await api.put("/preferences", data);
  return res.data;
};

export const getBookmarks = async () => {
  const res = await api.get("/bookmarks/user");
  return res.data;
};

export const saveBookmark = async (article: any) => {
  const res = await api.post("/bookmarks/add", article);
  return res.data;
};

export const removeBookmark = async (url: string) => {
  const res = await api.delete("/bookmarks/remove", { params: { url } });
  return res.data;
};