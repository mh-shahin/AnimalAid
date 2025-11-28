import { Link } from 'react-router-dom';
import { memo } from 'react';
import { Home, Pill, ShoppingBag, MessageCircle, FileText, Menu, ChevronRight, LogOut, User } from 'lucide-react';
import AdminNavLink from './AdminNavlink';


const AdminSidebar = memo(({ collapsed, toggleSidebar, mobileMenuOpen }) => {
    const navigationItems = [
        { to: '/admin/admindashboard', icon: <Home size={20} />, label: 'Dashboard' },
        { to: '/admin/adminmedicine', icon: <Pill size={20} />, label: 'Medicine' },
        { to: '/admin/adminfeed', icon: <ShoppingBag size={20} />, label: 'Feed' },
        { to: '/admin/adminconsultation', icon: <MessageCircle size={20} />, label: 'Consultation' },
        { to: '/admin/adminblog', icon: <FileText size={20} />, label: 'Blog' },
        { to: '/admin/stockupdate', icon: <ShoppingBag size={20} />, label: 'Stock Update' },
    ];

    return (
        <aside
            className={`${collapsed ? 'w-20' : 'w-72'} ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} 
        md:relative inset-y-0 left-0 z-20 transition-all duration-300 ease-in-out sticky top-0 h-screen
        bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 text-white shadow-xl`}
        >
            <div className="flex items-center justify-between p-4 border-b border-blue-500/30">
                {!collapsed ? (
                    <Link to="/" className="flex items-center space-x-2">
                        <span className="text-2xl font-bold">
                            <span className="text-white">Animal</span>
                            <span className="text-yellow-300">Aid</span>
                        </span>
                    </Link>
                ) : (
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
                        <AdminNavLink
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
    );
});

export default AdminSidebar;