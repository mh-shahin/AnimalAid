import React from 'react';
import { ChevronRight, ChevronLeft, Pill, Leaf, UserPlus, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
// import { useState } from 'react';
const CategoryPanel = () => {
    return (
        <div className="w-full">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4 bg-blue-600 text-white font-medium">
                    Categories
                </div>

                {/* Category Links */}
                <CategoryLink
                    to="/medicin"
                    icon={<Pill className="w-5 h-5" />}
                    text="Medicine"
                />
                <CategoryLink
                    to="/feed"
                    icon={<ShoppingBag className="w-5 h-5" />}
                    text="Animal Feed"
                />
                <CategoryLink
                    to="/consultations"
                    icon={<UserPlus className="w-5 h-5" />}
                    text="Consultation"
                />
                {/* <CategoryLink
                    to="/farm-equipment"
                    icon={<Leaf className="w-5 h-5" />}
                    text="Farm Equipment"
                /> */}
            </div>

            {/* Special Offers */}
            <div className="mt-6 bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4 bg-green-600 text-white font-medium">
                    Special Offers
                </div>
                <div className="p-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-3">
                        <p className="text-sm font-medium text-yellow-800">20% OFF</p>
                        <p className="text-xs text-yellow-700">On All Pet Vitamins</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                        <p className="text-sm font-medium text-blue-800">Free Delivery</p>
                        <p className="text-xs text-blue-700">On orders above $50</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Category Link Component
const CategoryLink = ({ to, icon, text }) => {
    return (
        <Link
            to={to}
            className="flex items-center gap-3 p-3 border-b border-gray-100 hover:bg-blue-50 transition-colors"
        >
            <span className="text-gray-500">{icon}</span>
            <span className="text-sm text-gray-700">{text}</span>
        </Link>
    );
};

export default CategoryPanel;