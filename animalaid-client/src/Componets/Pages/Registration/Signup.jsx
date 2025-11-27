import { useState } from "react";
import { Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import api from "../../../Authentication/api"; // Update path if needed

export default function SignupForm() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        confirm_password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState(null);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        setErrors({ ...errors, [name]: null });
        setServerError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const res = await submitForm();
        if (res) {
            setSubmitted(true);
        }
    };

    const submitForm = async () => {
        try {
            const response = await api.post("accounts/register/", formData);
            console.log("REGISTER SUCCESS:", response.data);
            return true;
        } catch (error) {
            console.error("REGISTER ERROR:", error);

            if (error.response) {
                const data = error.response.data;

                // Backend field errors
                const newErrors = {};
                if (data.email) newErrors.email = data.email[0];
                if (data.first_name) newErrors.first_name = data.first_name[0];
                if (data.last_name) newErrors.last_name = data.last_name[0];
                if (data.password) newErrors.password = data.password[0];
                if (data.confirm_password)
                    newErrors.confirm_password = data.confirm_password[0];

                setErrors(newErrors);
                setServerError(data.detail || "Registration failed.");
            }
            return false;
        }
    };

    if (submitted) {
        return (
            <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg mt-10">
                <div className="text-center">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                    <h2 className="text-2xl font-bold mt-4">Signup Successful!</h2>
                    <p className="text-gray-600 mt-2">
                        Thank you for creating an account.
                    </p>

                    <button
                        onClick={() => navigate("/login")}
                        className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg mt-10">
            <h2 className="text-2xl font-bold text-center mb-6">
                Create Your Account
            </h2>

            <form onSubmit={handleSubmit}>
                {/* First & Last Name */}
                <div className="grid grid-cols-2 gap-4">
                    <InputField
                        label="First Name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        error={errors.first_name}
                        placeholder="John"
                    />
                    <InputField
                        label="Last Name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        error={errors.last_name}
                        placeholder="Doe"
                    />
                </div>

                {/* Email */}
                <InputField
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    placeholder="john@example.com"
                />

                {/* Password */}
                <PasswordField
                    label="Password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                    error={errors.password}
                />

                {/* Confirm Password */}
                <PasswordField
                    label="Confirm Password"
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                    error={errors.confirm_password}
                />

                {serverError && (
                    <p className="text-red-600 text-sm mt-2">{serverError}</p>
                )}

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded-lg mt-4 hover:bg-blue-700"
                >
                    Create Account
                </button>
            </form>

            <p className="text-center text-sm mt-4 text-gray-600">
                Already have an account?{" "}
                <NavLink
                    to="/login"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                >
                    Login
                </NavLink>
            </p>
        </div>
    );
}

// -----------------------------
// Reusable Input Components
// -----------------------------
function InputField({ label, error, ...props }) {
    return (
        <div className="mt-3">
            <label className="block text-sm mb-1">{label}</label>
            <input
                {...props}
                className={`w-full p-2 border rounded-lg focus:ring-2 ${
                    error ? "border-red-500" : "border-gray-300"
                }`}
            />
            {error && (
                <p className="text-red-500 text-xs flex items-center mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {error}
                </p>
            )}
        </div>
    );
}

function PasswordField({
    label,
    name,
    value,
    error,
    onChange,
    showPassword,
    setShowPassword,
}) {
    return (
        <div className="mt-3">
            <label className="block text-sm mb-1">{label}</label>
            <div className="relative">
                <input
                    type={showPassword ? "text" : "password"}
                    name={name}
                    value={value}
                    onChange={onChange}
                    className={`w-full p-2 border rounded-lg focus:ring-2 ${
                        error ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="••••••••"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 text-gray-500"
                >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>

            {error && (
                <p className="text-red-500 text-xs flex items-center mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {error}
                </p>
            )}
        </div>
    );
}
