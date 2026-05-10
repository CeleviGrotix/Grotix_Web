import axios from 'axios';

// Usamos el puerto 5100 que vi en tu captura de Swagger
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5101';

export const axiosClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor limpio
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