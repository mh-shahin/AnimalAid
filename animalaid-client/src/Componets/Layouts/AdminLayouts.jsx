import { Outlet, NavLink, Link } from 'react-router-dom';
import { useState, useEffect, useCallback, memo } from 'react';
import {
    Home,
    Pill,
    ShoppingBag,
    MessageCircle,
    FileText,
    Menu,
    ChevronRight,
    Bell,
    Settings,
    LogOut,
    User,
    Search,
    Calendar,
    BarChart3,
    Users
} from 'lucide-react';

// Memoized components for better performance
const MemoizedNavLink = memo(({ to, collapsed, icon, label }) => {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `flex items-center p-3 ${collapsed ? 'justify-center' : 'space-x-3'} rounded-lg ${isActive
                    ? 'bg-white text-blue-700 font-medium shadow-md'
                    : 'text-white hover:bg-blue-500/30'
                }`
            }
        >
            {icon}
            {!collapsed && <span>{label}</span>}
        </NavLink>
    );
});

const StatCard = memo(({ stat }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex items-center transition-all duration-300 hover:shadow-md">
        <div className={`${stat.color} p-3 rounded-lg mr-4`}>
            {stat.icon}
        </div>
        <div>
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-xl font-bold text-gray-800">{stat.value}</p>
        </div>
    </div>
));

const AdminLayout = () => {
    // State management with initial values from localStorage where appropriate
    const [collapsed, setCollapsed] = useState(() => {
        return localStorage.getItem('sidebarCollapsed') === 'true' || false;
    });
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Update time every minute with proper cleanup
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    // Save preferences to localStorage when they change
    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', collapsed);
    }, [collapsed]);

    // Click outside handler for menus
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

    // Memoized handlers for better performance
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


    // // Format current time
    // const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    // const formattedDate = currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });

    // Navigation items - defined once to avoid recreating in render
    const navigationItems = [
        { to: '/admin/admindashboard', icon: <Home size={20} />, label: 'Dashboard' },
        { to: '/admin/adminmedicine', icon: <Pill size={20} />, label: 'Medicine' },
        { to: '/admin/adminfeed', icon: <ShoppingBag size={20} />, label: 'Feed' },
        { to: '/admin/adminconsultation', icon: <MessageCircle size={20} />, label: 'Consultation' },
        { to: '/admin/adminblog', icon: <FileText size={20} />, label: 'Blog' },
    ];

    return (
        <div className="flex min-h-screen bg-gray-100 text-gray-800">
            {/* Sidebar */}
            <aside
                className={`${collapsed ? 'w-20' : 'w-72'} ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} 
        md:relative inset-y-0 left-0 z-20 transition-all duration-300 ease-in-out sticky top-0 h-screen
        bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 text-white shadow-xl`}
            >
                <div className="flex items-center justify-between p-4 border-b border-blue-500/30">
                    {!collapsed && (
                        <Link to="/" className="flex items-center space-x-2">
                            <span className="text-2xl font-bold">
                                <span className="text-white">Animal</span>
                                <span className="text-yellow-300">Aid</span>
                            </span>
                        </Link>
                    )}
                    {collapsed && (
                        <Link to="/" className="mx-auto">
                            <span className="text-2xl font-bold text-yellow-300">A</span>
                        </Link>
                    )}
                    <button
                        onClick={toggleSidebar}
                        className={`rounded-full p-1 hover:bg-blue-500/30 text-white ${collapsed ? 'mx-auto' : ''} transition-colors`}
                        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {collapsed ? <ChevronRight size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <div className={`${collapsed ? 'py-3 px-2' : 'p-4'}`}>
                    {!collapsed && (
                        <div className="flex items-center mb-6 mt-2 bg-blue-500/30 rounded-lg p-2 backdrop-blur-sm hover:bg-blue-500/40 transition-colors">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <User size={18} />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium">Admin User</p>
                                <p className="text-xs opacity-70">System Administrator</p>
                            </div>
                        </div>
                    )}

                    <nav className={`${collapsed ? 'space-y-6' : 'space-y-1'} mt-4`}>
                        {navigationItems.map((item) => (
                            <MemoizedNavLink
                                key={item.to}
                                to={item.to}
                                collapsed={collapsed}
                                icon={item.icon}
                                label={item.label}
                            />
                        ))}
                    </nav>
                </div>

                {!collapsed && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-500/30">
                        <div className="flex items-center justify-between">
                            <div className="text-xs text-white/70">
                                Version 2.4.1
                            </div>
                            <Link to="/logout" className="p-2 rounded-lg hover:bg-blue-500/30 text-white transition-colors" aria-label="Log out">
                                <LogOut size={18} />
                            </Link>
                        </div>
                    </div>
                )}
            </aside>

            {/* Mobile overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-10 md:hidden backdrop-blur-sm"
                    onClick={toggleMobileMenu}
                    aria-hidden="true"
                ></div>
            )}

            {/* Main Content */}
            <div className={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 ease-in-out ${collapsed ? 'md:ml-10' : 'md:ml-10'}`}>
                {/* Header */}
                <header className="bg-white border-gray-200 border-b shadow-sm sticky top-0 z-10">
                    <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center space-x-3">
                            <button
                                className="p-2 rounded-lg md:hidden flex items-center justify-center hover:bg-gray-100 transition-colors"
                                onClick={toggleMobileMenu}
                                aria-label="Toggle mobile menu"
                            >
                                <Menu size={20} />
                            </button>

                            <h1 className="text-xl font-semibold text-gray-800">
                                Admin Pages
                            </h1>
                        </div>

                        <div className="flex items-center space-x-1 md:space-x-4">
                            <div className="hidden md:flex items-center px-3 py-2 rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-blue-500">
                                <Search size={16} className="text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="ml-2 outline-none border-none bg-transparent text-gray-800 w-40"
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    aria-label="Search"
                                />
                            </div>

                            <button
                                className="p-2 rounded-full hover:bg-gray-100 relative transition-colors"
                                aria-label="Notifications"
                            >
                                <Bell size={20} className="text-gray-600" />
                                <span className="absolute top-1 right-1 bg-red-500 rounded-full w-2 h-2 animate-pulse"></span>
                            </button>

                            <div className="relative profile-menu">
                                <button
                                    onClick={toggleProfileMenu}
                                    className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
                                    aria-label="User menu"
                                    aria-expanded={showProfileMenu}
                                    aria-haspopup="true"
                                >
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center text-white shadow-md hover:shadow-lg transition-shadow">
                                        <User size={18} />
                                    </div>
                                </button>

                                {showProfileMenu && (
                                    <div className="absolute right-0 mt-2 w-60 bg-white border-gray-200 rounded-lg shadow-lg py-1 z-20 border transition-all duration-200 animate-fadeIn">
                                        <div className="px-4 py-3 border-b border-gray-200">
                                            <p className="text-sm font-medium text-gray-800">Admin User</p>
                                            <p className="text-xs text-gray-500">admin@animalaid.com</p>
                                        </div>
                                        <Link to="/admin/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                                            <User size={16} className="mr-2" />
                                            Your Profile
                                        </Link>
                                        <Link to="/admin/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                                            <Settings size={16} className="mr-2" />
                                            Settings
                                        </Link>
                                        <Link to="/admin/calendar" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                                            <Calendar size={16} className="mr-2" />
                                            Calendar
                                        </Link>
                                        <div className="border-t border-gray-200 mt-1 pt-1">
                                            <Link to="/logout" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                                                <LogOut size={16} className="mr-2" />
                                                Sign out
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 flex-1 overflow-y-auto ">
                    <Outlet />
                </main>

            </div>
        </div>
    );
};

// Add some global keyframe animations
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.2s ease-out forwards;
  }
`;
document.head.appendChild(style);

export default AdminLayout;