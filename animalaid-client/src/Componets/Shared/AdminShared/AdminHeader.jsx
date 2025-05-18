import { useState, memo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell, User, Settings, Calendar, LogOut, Menu } from 'lucide-react';

const AdminHeader = memo(({ searchTerm, handleSearchChange, toggleMobileMenu, toggleProfileMenu, showProfileMenu }) => {
    return (
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
    );
});

export default AdminHeader;