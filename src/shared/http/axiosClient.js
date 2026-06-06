import axios from 'axios';

// Vite lee la URL de Azure desde el archivo .env. 
// Si por algún motivo el archivo .env no existe, intentará usar el localhost.
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5100';

export const axiosClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
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