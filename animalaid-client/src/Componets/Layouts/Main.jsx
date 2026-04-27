import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

import Navbar from '../Shared/Navbar/Navbar';
import Footer from '../Shared/Footer/Footer';
import CategoryPanel from '../Home/CategoryPanel/CategoryPanel';

const Main = () => {
    const [showSidebar, setShowSidebar] = useState(false);

    return (
        <div className="min-h-screen flex flex-col">

            {/* Navbar */}
            <Navbar />

            {/* Mobile Category Button */}
            <div className="lg:hidden flex justify-between items-center px-4 py-2 bg-gray-100 border-b">
                <button
                    onClick={() => setShowSidebar(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                    <Menu size={18} />
                    Categories
                </button>
            </div>

            <div className="flex flex-grow">

                {/* Desktop Sidebar */}
                <div className="hidden lg:block w-1/4 bg-gray-100 p-4 overflow-y-auto sticky top-20 h-[calc(100vh-80px)]">
                    <CategoryPanel />
                </div>

                {/* Main Content */}
                <main className="flex-grow w-full lg:w-3/4 p-4">
                    <Outlet />
                </main>
            </div>

            {/* Mobile Sidebar Drawer */}
            {showSidebar && (
                <div className="fixed inset-0 z-50 flex">

                    {/* Overlay */}
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setShowSidebar(false)}
                    ></div>

                    {/* Sidebar */}
                    <div className="relative w-3/4 max-w-xs bg-white h-full shadow-lg p-4 overflow-y-auto">

                        {/* Close Button */}
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold">Categories</h2>
                            <button onClick={() => setShowSidebar(false)}>
                                <X />
                            </button>
                        </div>

                        <CategoryPanel />
                    </div>
                </div>
            )}

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default Main;