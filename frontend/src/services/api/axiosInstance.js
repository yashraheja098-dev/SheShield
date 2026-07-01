/**
 * Axios instance — pre-configured for the real backend.
 *
 * In MVP: the mockApi module bypasses this.
 * When real backend is ready:
 *   1. Set VITE_API_BASE_URL in .env
 *   2. Replace mockApi calls in hooks with real service functions
 *   3. Add auth token injection to the request interceptor below
 */
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12_000,
  headers: {
    'Content-Type': 'application/json',
    Accept:         'application/json',
  },
});

/* ── Request Interceptor — inject auth token when available ── */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ss_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ── Response Interceptor — centralised error handling ── */
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Future: trigger logout flow
      console.warn('[SheShield] Unauthorized — clearing session');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
