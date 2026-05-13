import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

// Attach JWT from localStorage
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("kisansathi_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Chat API
export const chatAPI = {
  send: (messages: any[], language: string = "english") =>
    api.post("/api/chat/", { messages, language }),
  getHistory: () => api.get("/api/chat/history"),
  clearHistory: () => api.delete("/api/chat/history"),
};

// Disease API
export const diseaseAPI = {
  analyze: (formData: FormData) =>
    api.post("/api/disease/analyze", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getReports: () => api.get("/api/disease/reports"),
  getReport: (id: string) => api.get(`/api/disease/reports/${id}`),
};

// Weather API
export const weatherAPI = {
  getCurrent: (city: string, language: string = "english") =>
    api.post("/api/weather/current", { city, language }),
  getForecast: (city: string) =>
    api.get(`/api/weather/forecast?city=${city}`),
};

// Fertilizer API
export const fertilizerAPI = {
  recommend: (data: any) => api.post("/api/fertilizer/recommend", data),
  getHistory: () => api.get("/api/fertilizer/history"),
};

// Profile API (MongoDB backend)
export const profileAPI = {
  get:    ()          => api.get("/api/profile/me"),
  update: (data: any) => api.put("/api/profile/me", data),
};

// Crop API
export const cropAPI = {
  recommend: (data: any) => api.post("/api/crop/recommend", data),
  predictYield: (data: any) => api.post("/api/crop/yield-predict", data),
  getHistory: () => api.get("/api/crop/history"),
};

// Soil API
export const soilAPI = {
  analyze: (formData: FormData) =>
    api.post("/api/soil/analyze", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getRecommendations: (data: any) => api.post("/api/soil/recommend", data),
  getHistory: () => api.get("/api/soil/history"),
};

// Admin API
export const adminAPI = {
  getStats: () => api.get("/api/admin/stats"),
  getUsers: (limit?: number, offset?: number) =>
    api.get(`/api/admin/users?limit=${limit || 50}&offset=${offset || 0}`),
  getDiseaseAnalytics: () => api.get("/api/admin/disease-analytics"),
  getActivity: () => api.get("/api/admin/activity"),
};

// Mandi Price API
export const mandiAPI = {
  getPrices: (params: { state?: string; commodity?: string; district?: string; limit?: number }) =>
    api.get("/api/mandi/prices", { params }),
  getStates: () => api.get("/api/mandi/states"),
  getCommodities: () => api.get("/api/mandi/commodities"),
};

