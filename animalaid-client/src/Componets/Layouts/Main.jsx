// import { Outlet } from 'react-router-dom';
// import Navbar from '../Shared/Navbar/Navbar';
// import Footer from '../Shared/Footer/Footer';
// import CategoryPanel from '../Home/CategoryPanel/CategoryPanel';

// const Main = () => {
//     return (
//         <div className="min-h-screen flex flex-col">
//             <Navbar />
//             <div className="flex flex-grow lg:flex-row">
//                 <div className="hidden lg:block w-1/4 bg-gray-100 overflow-y-auto h-[calc(100vh-theme(spacing.header)-theme(spacing.footer))]">
//                     <div className="p-4 sticky top-0">
//                         <CategoryPanel />
//                     </div>
//                 </div>
//                 <main className="flex-grow overflow-y-auto h-[calc(100vh-theme(spacing.header)-theme(spacing.footer))]">
//                     <Outlet />
//                 </main>
//             </div>
//             <Footer />
//         </div>
//     );
// };

// export default Main;


import { Outlet } from 'react-router-dom';
import Navbar from '../Shared/Navbar/Navbar';
import Footer from '../Shared/Footer/Footer';
import CategoryPanel from '../Home/CategoryPanel/CategoryPanel';

const Main = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <div className="flex lg:flex-row flex-grow">
                {/* Fixed Scrollable Sidebar */}
                <div className="hidden lg:block w-1/4 bg-gray-100 p-4 overflow-y-auto h-[calc(100vh-64px-64px)] sticky top-[4px]">
                    {/* Adjust top-[64px] based on Navbar height */}
                    <CategoryPanel />
                </div>

                {/* Scrollable Main Content */}
                <main className="flex-grow overflow-y-auto w-3/4">
                    <Outlet />
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default Main;
