import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Search,
    User,
    LogOut,
    Settings,
    Heart,
    ShoppingCart,
    ChevronDown,
    X,
    Bell
} from "lucide-react";

const Navbar = () => {
    // Get user data from localStorage or your auth context
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);
    const [suggestions, setSuggestions] = useState([]);

    const userMenuRef = useRef(null);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    // Check if user is logged in on component mount and auth state changes
    useEffect(() => {
        // Check for user authentication status
        // This could be from localStorage, cookies, or your auth context
        const checkAuthStatus = () => {
            const token = localStorage.getItem('authToken');
            if (token) {
                setIsLoggedIn(true);
            } else {
                setIsLoggedIn(false);
            }
        };

        checkAuthStatus();

        // Listen for storage events (in case user logs in/out in another tab)
        window.addEventListener('storage', checkAuthStatus);

        return () => {
            window.removeEventListener('storage', checkAuthStatus);
        };
    }, []);

    // User data - in a real app, get this from your auth context or API
    const user = isLoggedIn ? {
        name: localStorage.getItem('userName') || "User",
        email: localStorage.getItem('userEmail') || "user@example.com",
        avatarUrl: localStorage.getItem('userAvatar') || "/api/placeholder/40/40"
    } : null;

    // Sample search suggestions - replace with actual API call
    const sampleSuggestions = [
        { id: 1, type: "medicine", name: "Amoxicillin for Pets" },
        { id: 2, type: "equipment", name: "Automatic Feeder" },
        { id: 3, type: "feed", name: "Premium Dog Food" },
        { id: 4, type: "medicine", name: "Heartworm Prevention" }
    ];

    // Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }

            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setSearchFocused(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Search suggestions handler
    useEffect(() => {
        if (searchQuery.length > 1) {
            // In a real app, you'd make an API call here
            // For now, we'll filter the sample data
            const filtered = sampleSuggestions.filter(item =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setSuggestions(filtered);
        } else {
            setSuggestions([]);
        }
    }, [searchQuery]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
            setSearchFocused(false);
        }
    };

    const handleLogout = () => {
        // Clear auth data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userAvatar');

        // Update state
        setIsLoggedIn(false);
        setShowUserMenu(false);

        // Navigate to home (optional)
        navigate('/');
    };

    // Navigate to login page
    const goToLogin = () => {
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Left: Logo & Brand */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2">
                            <span className="text-2xl font-bold">
                                <span className="text-blue-600">Animal</span>
                                <span className="text-gray-800">Aid</span>
                            </span>
                        </Link>
                    </div>

                    {/* Middle: Search Bar */}
                    <div className="flex-1 max-w-lg mx-6" ref={searchRef}>
                        <div className="relative">
                            <form onSubmit={handleSearch} className="relative">
                                <div className="flex items-center relative">
                                    <div className="absolute left-3 text-gray-400">
                                        <Search className="h-7 w-7" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search medicines, equipment, feed..."
                                        className={`w-full py-2 pl-12 pr-4 rounded-full font-normal text-xl bg-gray-100 border ${searchFocused
                                                ? "border-blue-500 ring-2 ring-blue-100"
                                                : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                            } text-sm transition-all duration-200`}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onFocus={() => setSearchFocused(true)}
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            className="absolute right-3 text-gray-400 hover:text-gray-600"
                                            onClick={() => setSearchQuery("")}
                                        >
                                            <X className="h-7 w-7" />
                                        </button>
                                    )}
                                </div>
                            </form>

                            {/* Search suggestions */}
                            {searchFocused && suggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg border border-gray-200 py-2 z-10">
                                    {suggestions.map((item) => (
                                        <Link
                                            key={item.id}
                                            to={`/search?q=${encodeURIComponent(item.name)}`}
                                            className="flex items-center px-4 py-2 hover:bg-gray-50"
                                            onClick={() => setSearchFocused(false)}
                                        >
                                            <div className="flex-1">
                                                <span className="text-sm text-gray-800">{item.name}</span>
                                                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${item.type === "medicine" ? "bg-red-100 text-red-800" :
                                                        item.type === "equipment" ? "bg-green-100 text-green-800" :
                                                            "bg-yellow-100 text-yellow-800"
                                                    }`}>
                                                    {item.type}
                                                </span>
                                            </div>
                                            <Search className="h-4 w-4 text-gray-400" />
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: User Controls */}
                    <div className="flex items-center space-x-4">
                        {/* Notification Bell - Only show when logged in */}
                        {isLoggedIn && (
                            <button className="relative p-1 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <Bell className="h-6 w-6" />
                                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                            </button>
                        )}

                        {/* Cart - Always visible */}
                        <Link to="/cart" className="relative p-1 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <ShoppingCart className="h-6 w-6" />
                            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">3</span>
                        </Link>

                        {/* Wishlist - Only show when logged in */}
                        {isLoggedIn && (
                            <Link to="/wishlist" className="p-1 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 hidden md:block">
                                <Heart className="h-6 w-6" />
                            </Link>
                        )}

                        {/* User Menu / Login Button */}
                        <div className="relative" ref={userMenuRef}>
                            {isLoggedIn ? (
                                <>
                                    <button
                                        className="flex items-center space-x-1 focus:outline-none"
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                    >
                                        <img
                                            src={user.avatarUrl}
                                            alt="User profile"
                                            className="h-8 w-8 rounded-full object-cover border-2 border-blue-600"
                                        />
                                        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : 'rotate-0'}`} />
                                    </button>

                                    {/* User Dropdown Menu */}
                                    {showUserMenu && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                                            <div className="px-4 py-3 border-b border-gray-100">
                                                <p className="text-sm font-medium text-gray-800">{user.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                            </div>

                                            <Link
                                                to="/profile"
                                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={() => setShowUserMenu(false)}
                                            >
                                                <User className="h-4 w-4 mr-3 text-gray-500" />
                                                Your Profile
                                            </Link>

                                            <Link
                                                to="/settings"
                                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={() => setShowUserMenu(false)}
                                            >
                                                <Settings className="h-4 w-4 mr-3 text-gray-500" />
                                                Account Settings
                                            </Link>

                                            <hr className="my-1 border-gray-100" />

                                            <button
                                                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={handleLogout}
                                            >
                                                <LogOut className="h-4 w-4 mr-3 text-gray-500" />
                                                Sign out
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <button
                                    onClick={goToLogin}
                                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-full text-sm font-medium transition-colors duration-300"
                                >
                                    <User className="h-4 w-4" />
                                    <span>Login</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;