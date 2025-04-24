import { useState } from 'react';
import { Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function SignupForm() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [formSubmitted, setFormSubmitted] = useState(false);

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const validatePassword = (password) => {
        return password.length >= 8;
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

        if (!formData.firstName.trim()) {
            errors.firstName = 'First name is required';
        }

        if (!formData.lastName.trim()) {
            errors.lastName = 'Last name is required';
        }

        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
            errors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (!validatePassword(formData.password)) {
            errors.password = 'Password must be at least 8 characters';
        }

        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        // Form is valid, show success message
        setFormSubmitted(true);

        // Here you would typically send data to your backend
        console.log('Form submitted:', formData);
    };

    if (formSubmitted) {
        return (
            <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
                <div className="text-center">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Signup Successful!</h2>
                    <p className="text-gray-600 mb-4">
                        Thank you for creating an account, {formData.firstName}!
                    </p>
                    <p className="text-gray-600">
                        A confirmation email has been sent to {formData.email}.
                    </p>
                    <button
                        className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300"
                        onClick={() => setFormSubmitted(false)}
                    >
                        Back to Form
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg m-10">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Create Your Account</h2>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                            First Name
                        </label>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none ${formErrors.firstName ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="John"
                        />
                        {formErrors.firstName && (
                            <p className="mt-1 text-sm text-red-500 flex items-center">
                                <AlertCircle className="h-4 w-4 mr-1" />
                                {formErrors.firstName}
                            </p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name
                        </label>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none ${formErrors.lastName ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Doe"
                        />
                        {formErrors.lastName && (
                            <p className="mt-1 text-sm text-red-500 flex items-center">
                                <AlertCircle className="h-4 w-4 mr-1" />
                                {formErrors.lastName}
                            </p>
                        )}
                    </div>
                </div>

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
                        placeholder="john.doe@example.com"
                    />
                    {formErrors.email && (
                        <p className="mt-1 text-sm text-red-500 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {formErrors.email}
                        </p>
                    )}
                </div>

                <div className="mb-4">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                    </label>
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
                    <p className="mt-1 text-xs text-gray-500">
                        Password must be at least 8 characters
                    </p>
                </div>

                <div className="mb-6">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Password
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none ${formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="••••••••"
                        />
                    </div>
                    {formErrors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-500 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {formErrors.confirmPassword}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                    Create Account
                </button>
            </form>

            <div className="mt-6 text-center text-sm">
                <p className="text-gray-600">
                    Already have an account?{' '}
                    <NavLink to='/login' className="text-blue-600 hover:text-blue-800 font-medium">
                        Sign in
                    </NavLink>
                </p>
            </div>
        </div>
    );
}