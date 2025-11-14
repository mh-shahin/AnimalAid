import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, User, LogOut, Settings, Heart, ShoppingCart, ChevronDown, X, Bell } from "lucide-react";
import { useCart } from "../../../Context/CartContext";

const Navbar = () => {
    // Get user data from localStorage or your auth context
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [showCartDropdown, setShowCartDropdown] = useState([]);

    const userMenuRef = useRef(null);
    const searchRef = useRef(null);
    const cartRef = useRef(null);

    const navigate = useNavigate();
    const { cartItems, getCount, removeFromCart } = useCart();

    // Check if user is logged in on component mount and auth state changes
    useEffect(() => {
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

    useEffect(() => {
        setShowCartDropdown(false);
    }, []);

    // Search suggestions handler
    useEffect(() => {
        if (searchQuery.length > 1) {
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
                        <Link to="/cart" className="relative p-1 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none hidden md:block">
                            <ShoppingCart className="h-6 w-6" />
                            {getCount() > 0 && (
                                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                                    {getCount()}
                                </span>
                            )}
                        </Link>
                        <div className="relative" ref={cartRef}>
                            <button onClick={() => setShowCartDropdown((prev) => !prev)} className="p-1 rounded-full text-gray-500 hover:bg-gray-100 md:hidden">
                                <ShoppingCart className="h-6 w-6" />
                                {getCount() > 0 && <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">{getCount()}</span>}
                            </button>
                            {showCartDropdown && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-2 z-50 border border-gray-200">
                                    <div className="px-3 py-2 border-b text-sm font-medium">Cart ({getCount()})</div>
                                    <div className="max-h-60 overflow-auto">
                                        {cartItems.length === 0 ? (
                                            <div className="p-4 text-center text-sm text-gray-600">Your cart is empty</div>
                                        ) : cartItems.map(item => (
                                            <div key={item.id} className="flex items-center gap-3 px-3 py-2 border-b">
                                                <img src={item.image} alt={item.name} className="h-10 w-10 object-contain rounded" />
                                                <div className="flex-1 text-sm">
                                                    <div className="font-medium text-gray-800">{item.name}</div>
                                                    <div className="text-gray-500">৳{Number(item.price).toFixed(2)} × {item.quantity}</div>
                                                </div>
                                                <button onClick={() => removeFromCart(item.id)} className="text-red-500 text-sm">Remove</button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="px-3 py-2 flex items-center justify-between">
                                        <Link to="/cart" onClick={() => setShowCartDropdown(false)} className="text-blue-600 text-sm font-medium">View Cart</Link>
                                        <Link to="/checkout" onClick={() => setShowCartDropdown(false)} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Checkout</Link>
                                    </div>
                                </div>
                            )}
                        </div>

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