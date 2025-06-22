import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import authAPI from '../../services/auth';

const ProtectedRoute = ({ children }) => {
    const isAuthenticated = authAPI.isAuthenticated();
    const location = useLocation();

    if (!isAuthenticated) {
        // Redirect them to the /login page, but save the current location they were
        // trying to go to. This allows us to send them along to that page after they login,
        // which is a nicer user experience.
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute; 