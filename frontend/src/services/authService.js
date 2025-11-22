import { apiClient } from './api';

export const authService = {
    // Login
    login: async (username, password) => {
        const response = await apiClient.post('/auth/login', { username, password });
        if (response.data.ok) {
            localStorage.setItem('auth_token', response.data.token);
            localStorage.setItem('user_role', response.data.user.role);
            localStorage.setItem('user_data', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    // Logout
    logout: async () => {
        try {
            await apiClient.post('/auth/logout');
        } catch (e) {
            console.error('Logout error', e);
        } finally {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_role');
            localStorage.removeItem('user_data');
            window.location.href = '/login';
        }
    },

    // Get current user
    getCurrentUser: () => {
        const userStr = localStorage.getItem('user_data');
        return userStr ? JSON.parse(userStr) : null;
    },

    // Check if authenticated
    isAuthenticated: () => {
        return !!localStorage.getItem('auth_token');
    }
};
