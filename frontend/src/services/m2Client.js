import axios from 'axios';

// M2 Security (AWS) - Production API
const M2_API_URL = 'https://3cfc8hn4xa.execute-api.eu-west-1.amazonaws.com/dev';

// Local development URL
const M2_LOCAL_URL = 'http://localhost:3000/dev';

// Use production URL by default, can override with env variable
const API_URL = import.meta.env.VITE_M2_API_URL || M2_API_URL;

export const m2Client = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add JWT token to requests
m2Client.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle authentication errors
m2Client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear auth and redirect to login
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_role');
            localStorage.removeItem('user_data');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default m2Client;
