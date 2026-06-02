import axios from 'axios';

// Apuntamos estrictamente al API Gateway (5100) sin la ruta extra
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5100';

export const axiosClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor de Token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('grotix_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);