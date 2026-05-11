import axios from 'axios';

// ESTE ES AXIOS BTW
// ESTE ES AXIOS BTW 2
// ESTE ES AXIOS BTW 3
// ESTE ES AXIOS BTW 4
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