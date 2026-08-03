import axios from 'axios';

// Automatically detect local development vs deployed environment
const getApiBaseUrl = () => {
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (isLocal) {
    return import.meta.env.VITE_LOCAL_API_URL || 'http://localhost:5000/api/v1';
  }
  return import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'https://ticket-booking-backend-2qcd.onrender.com/api/v1';
};

const BASE_URL = getApiBaseUrl();

// ─── Public Axios Instance (no auth) ─────────────────────────────────────────
const axiosPublic = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Private Axios Instance (with token refresh) ──────────────────────────────
const axiosPrivate = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
axiosPrivate.interceptors.request.use(
  (config) => {
    // Token will be attached via HTTP-only cookie (no manual header needed)
    // If using Authorization header instead, uncomment:
    // const token = localStorage.getItem('accessToken');
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
axiosPrivate.interceptors.response.use(
  (response) => response,
  async (error) => {
    const prevRequest = error?.config;
    const url = prevRequest?.url || '';

    // Don't retry for auth endpoints — avoids infinite loop
    const isAuthEndpoint = url.includes('/auth/refresh-token') || url.includes('/auth/me');

    // Handle 401 Unauthorized — attempt token refresh once
    if (error?.response?.status === 401 && !prevRequest?.sent && !isAuthEndpoint) {
      prevRequest.sent = true;
      try {
        await axiosPublic.post('/auth/refresh-token');
        return axiosPrivate(prevRequest);
      } catch (refreshError) {
        // Refresh failed — redirect to login
        if (!window.location.pathname.startsWith('/auth/')) {
          window.location.href = '/auth/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export { axiosPublic, axiosPrivate, BASE_URL as API_BASE_URL };
export default axiosPrivate;
