import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const location = useLocation();
    const isAuthenticated = authService.isAuthenticated();
    const user = authService.getCurrentUser();

    if (!isAuthenticated) {
        // Redirect to login while saving the attempted URL
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
        // Role mismatch - redirect to home or unauthorized page
        return <Navigate to="/" replace />;
    }

    return children;
};
