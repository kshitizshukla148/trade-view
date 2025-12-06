import axios from 'axios';

// Vite uses import.meta.env instead of process.env
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data)
};

// Stocks API
export const stocksAPI = {
  getAll: () => api.get('/stocks'),
  getOne: (symbol) => api.get(`/stocks/${symbol}`),
  getHistory: (symbol, interval = '1d', range = '1mo') => 
    api.get(`/stocks/${symbol}/history`, { params: { interval, range } }),
  analyze: (symbol, timeframe = '1m') => 
    api.get(`/stocks/${symbol}/analyze`, { params: { timeframe } })
};

// Portfolio API
export const portfolioAPI = {
  getAll: () => api.get('/portfolio'),
  buy: (data) => api.post('/portfolio/buy', data),
  sell: (data) => api.post('/portfolio/sell', data),
  getSummary: () => api.get('/portfolio/summary'),
  analyze: () => api.get('/portfolio/analyze')
};

// User API
export const userAPI = {
  getProfile: () => api.get('/user/profile')
};

export default api;

