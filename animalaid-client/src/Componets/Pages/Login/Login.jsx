import { useState } from 'react';
import { Eye, EyeOff, CheckCircle, AlertCircle, LogIn } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Clear errors when typing
        if (formErrors[name]) {
            setFormErrors({ ...formErrors, [name]: null });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate form
        const errors = {};

        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            errors.password = 'Password is required';
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        // Simulate login process
        setIsLoading(true);

        // Here you would typically send data to your backend
        console.log('Login attempt:', formData);

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            // For demo purposes, let's assume login is successful
            console.log('Login successful');
        }, 1000);
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg m-10">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mt-4">Welcome Back</h2>
                <p className="text-gray-600 mt-2">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none ${formErrors.email ? 'border-red-500' : 'border-gray-300'
                            }`}
                        placeholder="your.email@example.com"
                    />
                    {formErrors.email && (
                        <p className="mt-1 text-sm text-red-500 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {formErrors.email}
                        </p>
                    )}
                </div>

                <div className="mb-6">
                    <div className="flex items-center justify-between mb-1">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <a href="#" className="text-sm text-blue-600 hover:text-blue-800">
                            Forgot password?
                        </a>
                    </div>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none ${formErrors.password ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                            ) : (
                                <Eye className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                    {formErrors.password && (
                        <p className="mt-1 text-sm text-red-500 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {formErrors.password}
                        </p>
                    )}
                </div>

                <div className="flex items-center mb-6">
                    <input
                        type="checkbox"
                        id="remember"
                        checked={rememberMe}
                        onChange={() => setRememberMe(!rememberMe)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                        Remember me
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex justify-center items-center ${isLoading ? 'opacity-75 cursor-not-allowed' : ''
                        }`}
                >
                    {isLoading ? (
                        <>
                            <span className="animate-pulse mr-2">●</span>
                            Signing in...
                        </>
                    ) : (
                        'Sign in'
                    )}
                </button>
            </form>

            <div className="mt-6 text-center text-sm">
                <p className="text-gray-600">
                    Don't have an account?{' '}
                    <NavLink to='/signup' className="text-blue-600 hover:text-blue-800 font-medium">
                        Create account
                    </NavLink>
                </p>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-center text-xs text-gray-500">
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
    );
}