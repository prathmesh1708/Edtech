import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '../../config/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — inject auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sw_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // A 401 from a sign-in request means wrong credentials, not an expired session:
    // let the form show the error instead of reloading the login page.
    const isAuthAttempt = /\/auth\/(login|register|verify-otp)$/.test(error.config?.url || '');
    if (error.response?.status === 401 && !isAuthAttempt) {
      let isAdmin = false;
      try {
        const storedUser = localStorage.getItem('sw_user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          if (parsed.role === 'admin') isAdmin = true;
        }
      } catch (e) {
        // ignore JSON parse error
      }
      
      const currentPath = window.location.pathname;
      const isAdminRoute = currentPath.startsWith('/admin') || currentPath.startsWith('/login/admin') || isAdmin;

      localStorage.removeItem('sw_token');
      localStorage.removeItem('sw_user');
      
      if (isAdminRoute) {
        window.location.href = '/login/admin';
      } else {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
