import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../Authentication/auth';

const ProtectedRoute = ({ children }) => {
    const location = useLocation();

    if (!isAuthenticated()) {
        // Save the current location to redirect back after login
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    return children;
};

export default ProtectedRoute;