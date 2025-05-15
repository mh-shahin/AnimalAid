import { useState, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../Shared/AdminShared/AdminSidebar';
import AdminHeader from '../Shared/AdminShared/AdminHeader';

const AdminLayout = () => {
    const [collapsed, setCollapsed] = useState(() => {
        return localStorage.getItem('sidebarCollapsed') === 'true' || false;
    });
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Save sidebar state
    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', collapsed);
    }, [collapsed]);

    // Close profile menu on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showProfileMenu && !event.target.closest('.profile-menu')) {
                setShowProfileMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showProfileMenu]);

    const toggleSidebar = useCallback(() => {
        setCollapsed(prev => !prev);
    }, []);

    const toggleProfileMenu = useCallback(() => {
        setShowProfileMenu(prev => !prev);
        if (mobileMenuOpen) setMobileMenuOpen(false);
    }, [mobileMenuOpen]);

    const toggleMobileMenu = useCallback(() => {
        setMobileMenuOpen(prev => !prev);
        if (showProfileMenu) setShowProfileMenu(false);
    }, [showProfileMenu]);

    const handleSearchChange = useCallback((e) => {
        setSearchTerm(e.target.value);
    }, []);

    return (
        <div className="flex h-screen bg-gray-100 text-gray-800 overflow-hidden">
            {/* Sidebar */}
            <div
                className={`
                    fixed z-30 md:relative transition-transform duration-300 ease-in-out 
                    h-full top-0 
                    ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
                    md:translate-x-0 md:flex-shrink-0 
                    ${collapsed ? 'w-20' : 'w-72'}
                `}
            >
                <AdminSidebar
                    collapsed={collapsed}
                    toggleSidebar={toggleSidebar}
                    mobileMenuOpen={mobileMenuOpen}
                />
            </div>

            {/* Overlay for mobile menu */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    onClick={toggleMobileMenu}
                    aria-hidden="true"
                />
            )}

            {/* Main Content Area */}
            <div className="flex flex-col flex-1 h-full overflow-hidden">
                {/* Header */}
                <AdminHeader
                    searchTerm={searchTerm}
                    handleSearchChange={handleSearchChange}
                    toggleMobileMenu={toggleMobileMenu}
                    toggleProfileMenu={toggleProfileMenu}
                    showProfileMenu={showProfileMenu}
                />

                {/* Scrollable page content */}
                <main className="flex-1 overflow-y-auto p-4">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
