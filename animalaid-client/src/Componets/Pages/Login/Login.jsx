// src/components/Login.jsx
import { useState } from "react";
import { Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import api from "../../../Authentication/api.js";
import { saveAuth } from "../../../Authentication/auth.js";
import toast from "react-hot-toast";

export default function Login() {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const validateEmail = (email) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};
        if (!formData.email) newErrors.email = "Email is required";
        else if (!validateEmail(formData.email))
            newErrors.email = "Invalid email format";

        if (!formData.password) newErrors.password = "Password is required";

        if (Object.keys(newErrors).length) return setErrors(newErrors);

        setLoading(true);

        try {
            const res = await api.post("/accounts/login/", formData);
            const data = res.data;

            // Save tokens + role
            saveAuth(data.access, data.refresh, data.role);

            // Toast success message
            toast.success("Login successful! Redirecting...");

            // Redirect after short delay
            setTimeout(() => {
                if (data.role === "admin") navigate("/admin-dashboard");
                else navigate("/");
            }, 1000);

        } catch (err) {
            console.error(err);

            if (err.response?.data?.detail) {
                toast.error(err.response.data.detail);
            } else {
                toast.error("Login failed. Please try again.");
            }

            setErrors({ general: err.response?.data?.detail || "Login failed" });

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-8 bg-white shadow-xl rounded-2xl border border-gray-100">
            <h2 className="text-3xl font-bold text-center text-gray-800">Sign In</h2>
            <p className="text-center text-gray-500 mt-2">
                Access your Animal Aid account
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">

                {/* Email */}
                <div>
                    <label className="block text-gray-700 font-medium mb-1">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full p-3 rounded-lg border focus:ring-2 focus:outline-none ${
                            errors.email
                                ? "border-red-500 focus:ring-red-400"
                                : "border-gray-300 focus:ring-blue-400"
                        }`}
                        placeholder="example@mail.com"
                    />
                    {errors.email && (
                        <p className="text-red-500 text-sm flex items-center mt-1">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {errors.email}
                        </p>
                    )}
                </div>

                {/* Password */}
                <div>
                    <label className="block text-gray-700 font-medium mb-1">Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`w-full p-3 rounded-lg border focus:ring-2 focus:outline-none ${
                                errors.password
                                    ? "border-red-500 focus:ring-red-400"
                                    : "border-gray-300 focus:ring-blue-400"
                            }`}
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-red-500 text-sm flex items-center mt-1">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {errors.password}
                        </p>
                    )}
                </div>

                {/* General Error */}
                {errors.general && (
                    <p className="text-red-600 text-center font-medium">
                        {errors.general}
                    </p>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold flex justify-center items-center transition"
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin h-5 w-5 mr-2" />
                            Signing in...
                        </>
                    ) : (
                        "Sign In"
                    )}
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
                Don’t have an account?{" "}
                <NavLink to="/signup" className="text-blue-600 hover:underline font-medium">
                    Sign Up
                </NavLink>
            </p>
        </div>
    );
}
