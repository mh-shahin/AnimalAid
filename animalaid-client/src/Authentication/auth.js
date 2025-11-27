export const saveAuth = (access, refresh, role) => {
    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);
    localStorage.setItem("userRole", role);
    
    // dispatch login event
    window.dispatchEvent(new Event("loginSuccess"));
};
