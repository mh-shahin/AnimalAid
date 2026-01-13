// Save authentication data
export const saveAuth = (accessToken, refreshToken, role) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('user_role', role);

    // Force immediate update
    window.dispatchEvent(new Event("loginSuccess"));
};

// Check if user is authenticated
export const isAuthenticated = () => {
    return !!localStorage.getItem('access_token');
};

// Check if user is admin
export const isAdmin = () => {
    return localStorage.getItem('user_role') === 'admin';
};

// Get user role
export const getUserRole = () => {
    return localStorage.getItem('user_role');
};

// Clear authentication
export const clearAuth = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');

    window.dispatchEvent(new Event("logoutSuccess"));
};

// Logout function
export const logout = () => {
    clearAuth();
    window.location.href = '/login';
};