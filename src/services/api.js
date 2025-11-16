import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.can2025-fanops.com';

const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === 'true';


export const apiClient = axios.create({
  baseURL: MOCK_MODE ? '' : API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock interceptor
if (MOCK_MODE) {
  apiClient.interceptors.request.use((config) => {
    console.log('🔶 MOCK MODE - Request intercepted:', config.url);
    return Promise.reject({ mock: true, config });
  });
}



// Intercepteur pour ajouter le token JWT
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Rediriger vers login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);