import React from 'react';
import { Link } from 'react-router-dom';
import animalaidicon from '../../../../public/vite.svg';

const Footer = () => {
    return (
        <footer className="bg-gray-100 text-gray-700 mt-10">

            <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

                {/* Logo & About */}
                <div>
                    <img src={animalaidicon} alt="AnimalAid Logo" className="w-32 mb-4" />
                    <h2 className="text-xl font-bold text-blue-600">AnimalAid</h2>
                    <p className="text-sm mt-2">
                        Smart veterinary platform providing medicines, feed, and AI-powered disease detection for animals.
                    </p>
                    <p className="text-xs mt-3 text-gray-500">
                        © 2026 AnimalAid. All rights reserved.
                    </p>
                </div>

                {/* Services */}
                <div>
                    <h6 className="font-semibold text-gray-900 mb-3">Our Services</h6>
                    <ul className="space-y-2 text-sm">
                        <li><Link to="/medicin" className="hover:text-blue-600">Veterinary Medicines</Link></li>
                        <li><Link to="/feed" className="hover:text-blue-600">Animal Feed</Link></li>
                        <li><Link to="/consultations" className="hover:text-blue-600">Online Consultation</Link></li>
                    </ul>
                </div>

                {/* Company */}
                <div>
                    <h6 className="font-semibold text-gray-900 mb-3">Company</h6>
                    <ul className="space-y-2 text-sm">
                        <li><Link to="/" className="hover:text-blue-600">About Us</Link></li>
                        <li><Link to="/" className="hover:text-blue-600">Contact</Link></li>
                        <li><Link to="/" className="hover:text-blue-600">Blog & Tips</Link></li>
                        <li><Link to="/" className="hover:text-blue-600">Careers</Link></li>
                    </ul>
                </div>

                {/* Support / Legal */}
                <div>
                    <h6 className="font-semibold text-gray-900 mb-3">Support</h6>
                    <ul className="space-y-2 text-sm">
                        <li><Link to="/" className="hover:text-blue-600">FAQ</Link></li>
                        <li><Link to="/" className="hover:text-blue-600">Terms & Conditions</Link></li>
                        <li><Link to="/" className="hover:text-blue-600">Privacy Policy</Link></li>
                        <li><Link to="/" className="hover:text-blue-600">Return Policy</Link></li>
                    </ul>
                </div>

            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-300 py-4 text-center text-sm text-gray-500">
                Built By Md. Shahin Hossain for animal healthcare
            </div>

        </footer>
    );
};

export default Footer;