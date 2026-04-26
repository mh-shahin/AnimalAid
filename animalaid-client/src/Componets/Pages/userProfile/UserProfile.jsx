import React, { useEffect, useState } from "react";

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // ✅ Fetch user data from API
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem("access_token");

                const response = await fetch("http://127.0.0.1:8000/api/accounts/user/", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch user data");
                }

                const data = await response.json();
                console.log("✅ User Data:", data);

                // IMPORTANT: your API returns { isAuthenticated, user }
                setUser(data.user);

            } catch (error) {
                console.error("❌ Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    // ✅ Loading state
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen text-lg">
                Loading profile...
            </div>
        );
    }

    // ✅ No user
    if (!user) {
        return (
            <div className="flex justify-center items-center h-screen text-red-500">
                User not found. Please login again.
            </div>
        );
    }

    // ✅ UI
    return (
        <div className="min-h-screen bg-gradient-to-r from-blue-100 to-indigo-100 flex justify-center items-center p-6">
            <div className="bg-white shadow-2xl rounded-2xl w-full max-w-md p-6">

                {/* Avatar */}
                <div className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                        {user.first_name?.charAt(0)}
                    </div>

                    <h2 className="mt-4 text-2xl font-bold text-gray-800">
                        {user.first_name} {user.last_name}
                    </h2>

                    <p className="text-gray-500">{user.email}</p>
                </div>

                {/* Info Section */}
                <div className="mt-6 space-y-3">

                    <div className="flex justify-between bg-gray-50 p-3 rounded-lg">
                        <span>User ID</span>
                        <span className="font-semibold">{user.id}</span>
                    </div>

                    <div className="flex justify-between bg-gray-50 p-3 rounded-lg">
                        <span>First Name</span>
                        <span className="font-semibold">{user.first_name}</span>
                    </div>

                    <div className="flex justify-between bg-gray-50 p-3 rounded-lg">
                        <span>Last Name</span>
                        <span className="font-semibold">{user.last_name}</span>
                    </div>

                    <div className="flex justify-between bg-gray-50 p-3 rounded-lg">
                        <span>Email</span>
                        <span className="font-semibold">{user.email}</span>
                    </div>

                    <div className="flex justify-between bg-gray-50 p-3 rounded-lg">
                        <span>Account Type</span>
                        <span className="font-semibold text-blue-600">
                            {user.is_superuser
                                ? "Admin"
                                : user.is_staff
                                    ? "Staff"
                                    : "General User"}
                        </span>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default UserProfile;