import { Navigate } from 'react-router-dom';
import { isAuthenticated, isAdmin } from '../Authentication/auth';

const AdminRoute = ({ children }) => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    // Check if user is admin
    if (!isAdmin()) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default AdminRoute;