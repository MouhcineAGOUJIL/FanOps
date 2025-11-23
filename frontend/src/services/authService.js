import m2Client from './m2Client';

export const authService = {
    // Login - M2 AWS
    login: async (username, password) => {
        try {
            const response = await m2Client.post('/auth/login', { username, password });

            if (response.data.ok) {
                localStorage.setItem('auth_token', response.data.token);
                localStorage.setItem('user_role', response.data.user.role);
                localStorage.setItem('user_data', JSON.stringify(response.data.user));
                return response.data;
            } else {
                throw new Error(response.data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    // Logout - M2 AWS
    logout: async () => {
        try {
            await m2Client.post('/auth/logout');
        } catch (error) {
            console.error('Logout API error:', error);
        } finally {
            // Always clear local storage even if API call fails
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_role');
            localStorage.removeItem('user_data');
            window.location.href = '/login';
        }
    },

    // Get current user from localStorage
    getCurrentUser: () => {
        const userStr = localStorage.getItem('user_data');
        return userStr ? JSON.parse(userStr) : null;
    },

    // Check if user is authenticated
    isAuthenticated: () => {
        return !!localStorage.getItem('auth_token');
    },

    // Get user role
    getUserRole: () => {
        return localStorage.getItem('user_role');
    },

    // Check if user has specific role
    hasRole: (role) => {
        const userRole = localStorage.getItem('user_role');
        return userRole === role;
    }
};
