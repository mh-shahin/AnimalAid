import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, User, LogOut, Settings, ShoppingCart, ChevronDown, X, Package } from "lucide-react";
import { useCart } from "../../../Context/CartContext";
import { isAuthenticated } from "../../../Authentication/auth";
import toast from "react-hot-toast";

const Navbar = () => {
  const [userData, setUserData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showCartDropdown, setShowCartDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  const userMenuRef = useRef(null);
  const searchRef = useRef(null);
  const cartRef = useRef(null);

  const navigate = useNavigate();
  const { cartItems, getCount, removeFromCart } = useCart();

  const sampleSuggestions = [
    { id: 1, name: "Antibiotics for Dogs", type: "medicine", category: "Medicine" },
    { id: 2, name: "Cattle Feed Premium", type: "feed", category: "Feed" },
    { id: 3, name: "Veterinary Stethoscope", type: "equipment", category: "Equipment" },
    { id: 4, name: "Poultry Vaccine", type: "medicine", category: "Medicine" },
    { id: 5, name: "Animal Thermometer", type: "equipment", category: "Equipment" }
  ];

  // ✅ Fetch user data from backend
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");

      console.log("🔍 Token check:", token ? "Token exists" : "No token");

      if (!token) {
        setIsLoggedIn(false);
        setUserData(null);
        setLoading(false);
        return;
      }

      const response = await fetch("http://127.0.0.1:8000/api/accounts/user/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("🔍 Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ User data received:", data);
        
        const userData = data.user || data;
        setUserData(userData);
        setIsLoggedIn(true);
      } else {
        console.log("❌ Invalid token, clearing auth");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user_role");
        setIsLoggedIn(false);
        setUserData(null);
      }
    } catch (error) {
      console.error("❌ Error fetching user data:", error);
      setIsLoggedIn(false);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Single useEffect with proper event handling
  useEffect(() => {
    // Initial fetch
    fetchUserData();

    const handleLoginSuccess = () => {
      console.log("✅ Login event detected!");
      setTimeout(() => fetchUserData(), 100);
    };

    const handleLogoutSuccess = () => {
      console.log("✅ Logout event detected!");
      setIsLoggedIn(false);
      setUserData(null);
    };

    // Listen for login/logout events
    window.addEventListener('loginSuccess', handleLoginSuccess);
    window.addEventListener('logoutSuccess', handleLogoutSuccess);

    return () => {
      window.removeEventListener('loginSuccess', handleLoginSuccess);
      window.removeEventListener('logoutSuccess', handleLogoutSuccess);
    };
  }, []); // Empty dependency - runs once on mount

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchFocused(false);
      }
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setShowCartDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search suggestions
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
      setSearchQuery("");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_role");
    
    setIsLoggedIn(false);
    setUserData(null);
    setShowUserMenu(false);
    
    toast.success('Logged out successfully');
    window.dispatchEvent(new Event('logoutSuccess'));
    
    navigate('/');
  };

  const goToLogin = () => {
    navigate('/login');
  };

  const getUserInitials = () => {
    if (!userData) return "U";
    const firstName = userData.first_name || "";
    const lastName = userData.last_name || "";
    const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
    return initials || userData.email?.charAt(0).toUpperCase() || "U";
  };

  const getDisplayName = () => {
    if (!userData) return "User";
    return userData.first_name || userData.email?.split('@')[0] || "User";
  };

  const getCartTotal = () => {
    return cartItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
  };

  return (
    <>
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">

            {/* Logo */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <span className="text-white font-black text-2xl">A</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <div className="text-2xl font-black leading-none">
                    <span className="text-blue-600">Animal</span>
                    <span className="text-gray-900">Aid</span>
                  </div>
                  <div className="text-[10px] text-gray-500 font-semibold tracking-wider uppercase">
                    Veterinary Supplies
                  </div>
                </div>
              </Link>
            </div>

            {/* Search Bar */}
            <div className="hidden lg:flex flex-1 max-w-2xl mx-8" ref={searchRef}>
              <form onSubmit={handleSearch} className="relative w-full">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search for medicines, equipment, feed..."
                    className="w-full h-12 pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      <X className="h-4 w-4 text-gray-500" />
                    </button>
                  )}
                </div>

                {searchFocused && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                    <div className="py-2">
                      {suggestions.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setSearchQuery(item.name);
                            setSearchFocused(false);
                            navigate(`/search?q=${encodeURIComponent(item.name)}`);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left"
                        >
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Search className="h-4 w-4 text-gray-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{item.category}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0
                            ${item.type === "medicine" ? "bg-red-50 text-red-600" :
                              item.type === "equipment" ? "bg-green-50 text-green-600" :
                                "bg-amber-50 text-amber-600"
                            }`}>
                            {item.category}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">

              {/* Mobile Search */}
              <button
                onClick={() => setSearchFocused(true)}
                className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <Search className="h-5 w-5 text-gray-700" />
              </button>

              {/* Cart */}
              <div className="relative" ref={cartRef}>
                <button
                  onClick={() => setShowCartDropdown(!showCartDropdown)}
                  className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  <ShoppingCart className="h-5 w-5 text-gray-700" />
                  {getCount() > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {getCount()}
                    </span>
                  )}
                </button>

                {showCartDropdown && (
                  <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
                      <div>
                        <h3 className="font-bold text-gray-900">Shopping Cart</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{getCount()} {getCount() === 1 ? 'item' : 'items'}</p>
                      </div>
                      <button
                        onClick={() => setShowCartDropdown(false)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                      >
                        <X className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                      {cartItems.length === 0 ? (
                        <div className="py-16 px-6 text-center">
                          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShoppingCart className="h-10 w-10 text-gray-300" />
                          </div>
                          <p className="text-sm font-medium text-gray-900">Your cart is empty</p>
                          <p className="text-xs text-gray-500 mt-1">Add products to get started</p>
                        </div>
                      ) : (
                        <div className="divide-y">
                          {cartItems.map(item => (
                            <div key={item.id} className="flex gap-4 p-4 hover:bg-gray-50 transition-colors">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-20 h-20 object-cover rounded-xl bg-gray-100"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-gray-900 mb-1 truncate">{item.name}</h4>
                                <p className="text-xs text-gray-500 mb-2">Quantity: {item.quantity}</p>
                                <p className="text-base font-bold text-blue-600">
                                  ৳{(Number(item.price) * item.quantity).toFixed(2)}
                                </p>
                              </div>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {cartItems.length > 0 && (
                      <div className="p-6 border-t bg-gray-50">
                        <div className="flex justify-between items-center mb-4">
                          <span className="font-semibold text-gray-700">Subtotal</span>
                          <span className="text-2xl font-bold text-gray-900">৳{getCartTotal().toFixed(2)}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Link
                            to="/cart"
                            onClick={() => setShowCartDropdown(false)}
                            className="h-11 flex items-center justify-center border-2 border-blue-600 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
                          >
                            View Cart
                          </Link>
                          <Link
                            to="/checkout"
                            onClick={() => setShowCartDropdown(false)}
                            className="h-11 flex items-center justify-center bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30"
                          >
                            Checkout
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="relative ml-2" ref={userMenuRef}>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
                    <div className="hidden md:block w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ) : isLoggedIn ? (
                  <>
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 h-10 pl-1 pr-3 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold shadow-md">
                        {getUserInitials()}
                      </div>
                      <div className="hidden md:block text-left">
                        <p className="text-sm font-bold text-gray-900 leading-tight">
                          {getDisplayName()}
                        </p>
                      </div>
                      <ChevronDown className={`hidden md:block h-4 w-4 text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                        <div className="p-6 bg-gradient-to-br from-blue-500 to-blue-700">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-xl shadow-lg">
                              {getUserInitials()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-white text-lg truncate">
                                {userData?.first_name && userData?.last_name
                                  ? `${userData.first_name} ${userData.last_name}`
                                  : getDisplayName()}
                              </p>
                              <p className="text-xs text-white/80 truncate">{userData?.email}</p>
                            </div>
                          </div>
                        </div>

                        <div className="p-2">
                          <Link
                            to="/profile"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                          >
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-600" />
                            </div>
                            <span className="font-semibold text-gray-700">My Profile</span>
                          </Link>

                          <Link
                            to="/orders"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                          >
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Package className="h-5 w-5 text-gray-600" />
                            </div>
                            <span className="font-semibold text-gray-700">My Orders</span>
                          </Link>

                          <Link
                            to="/settings"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                          >
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Settings className="h-5 w-5 text-gray-600" />
                            </div>
                            <span className="font-semibold text-gray-700">Settings</span>
                          </Link>
                        </div>

                        <div className="p-2 border-t">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 transition-colors"
                          >
                            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                              <LogOut className="h-5 w-5 text-red-600" />
                            </div>
                            <span className="font-semibold text-red-600">Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <button
                    onClick={goToLogin}
                    className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition-colors shadow-lg shadow-blue-600/30 flex items-center gap-2"
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

      {/* Mobile Search Overlay */}
      {searchFocused && (
        <div className="lg:hidden fixed inset-0 bg-white z-50 animate-fadeIn">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => {
                  setSearchFocused(false);
                  setSearchQuery("");
                }}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                <X className="h-6 w-6" />
              </button>
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full h-12 pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                </div>
              </form>
            </div>

            {suggestions.length > 0 && (
              <div className="space-y-2">
                {suggestions.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSearchQuery(item.name);
                      setSearchFocused(false);
                      navigate(`/search?q=${encodeURIComponent(item.name)}`);
                    }}
                    className="w-full flex items-center gap-3 p-4 bg-white hover:bg-gray-50 rounded-2xl transition-colors border border-gray-100"
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                      <Search className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.category}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;