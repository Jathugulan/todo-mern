import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Auth token automatically
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized (expired/invalid JWT)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear stale token if unauthorized
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default API;
