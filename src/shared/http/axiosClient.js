import axios from 'axios';

// Vite lee la URL de Azure desde el archivo .env. 
// Si por algún motivo el archivo .env no existe, intentará usar el localhost.
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5100';

let unauthorizedHandler = null;
let isHandlingUnauthorized = false;

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

export const axiosClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('grotix_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url ?? '';
    const isAuthRequest =
      url.includes('/auth/sign-in') || url.includes('/auth/register');

    if (status === 401 && !isAuthRequest && !isHandlingUnauthorized) {
      isHandlingUnauthorized = true;
      unauthorizedHandler?.();
      setTimeout(() => {
        isHandlingUnauthorized = false;
      }, 2000);
    }

    return Promise.reject(error);
  },
);