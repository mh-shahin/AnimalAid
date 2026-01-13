// routes/router.jsx or routes/index.jsx

import { createBrowserRouter } from "react-router-dom";
import Main from "../Componets/Layouts/Main";
import HomePage from "../Componets/Home/HomePage/HomePage";
import Feed from "../../src/Componets/Pages/FeedPage/Feed";
import Login from "../Componets/Pages/Login/Login";
import Signup from "../Componets/Pages/Registration/Signup";
import Medicin from "../Componets/Pages/MedicinPage/Medicin";
import Consultants from "../Componets/Pages/ConsultantPage/Consultants";
import Equiepments from "../Componets/Pages/FarmEquiepmetPage/Equiepments";
import CategoryProductsPage from "../Componets/Pages/MedicinPage/CategoryProductsPage";
import FeedCategoryProductsPage from "../Componets/Pages/FeedPage/FeedCategoryProductsPage";
import MedicineAdmin from "../Componets/Admin/MedicineAdmin";
import FeedAdmin from "../Componets/Admin/FeedAdmin";
import ConsultationAdmin from "../Componets/Admin/ConsultationAdmin";
import BlogsAdmin from "../Componets/Admin/BlogsAdmin";
import AdminLayout from "../Componets/Layouts/AdminLayouts";
import DashboardAdmin from "../Componets/Admin/DashboardAdmin";
import MedicineDetailsPage from "../Componets/Pages/DetailsPages/MedicineDetailsPages/MedicineDetailsPage";
import FeedDetailsPage from "../Componets/Pages/DetailsPages/FeedDetailsPages/FeedDetailsPage";
import Cart from "../Componets/Shared/ProductCard/Cart";
import Checkout from "../Componets/Pages/ProductList/Checkout.jsx";
import PaymentSuccess from "../Componets/Pages/ProductList/PaymentSuccess";
import PaymentGateway from "../Componets/Pages/ProductList/PaymentFunction/PaymentGateway";
import PaymentReturn from "../Componets/Pages/ProductList/PaymentFunction/PaymentReturn";
import OrderSummary from "../Componets/Pages/ProductList/PaymentFunction/OrderSummary";
import UserBlogPage from "../Componets/Pages/blogsPage/UserBlogPage.jsx";
import StockManagement from "../Componets/Admin/StockManagement.jsx";
import ProtectedRoute from "../Componets/ProtectedRoute.jsx";
import AdminRoute from "../Componets/AdminRoute.jsx";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Main />,
        children: [
            {
                index: true,
                element: <HomePage />
            },
            {
                path: "/medicin",
                element: <Medicin />
            },
            {
                // PROTECTED: Medicine Details
                path: "/medicin/:id",
                element: (
                    <ProtectedRoute>
                        <MedicineDetailsPage />
                    </ProtectedRoute>
                )
            },
            {
                path: "medicin/category/:categoryName",
                element: <CategoryProductsPage />
            },
            {
                // PROTECTED: Consultations
                path: "/consultations",
                element: <Consultants />
            },
            {
                path: "/equipment",
                element: <Equiepments />
            },
            {
                path: "/feed",
                element: <Feed />
            },
            {
                path: "/blogs",
                element: <UserBlogPage />
            },
            {
                // PROTECTED: Feed Details
                path: "/feed/:id",
                element: (
                    <ProtectedRoute>
                        <FeedDetailsPage />
                    </ProtectedRoute>
                )
            },
            {
                path: "/feed/category/:categoryName",
                element: <FeedCategoryProductsPage />
            },
            {
                // PROTECTED: Cart
                path: "/cart",
                element: (
                    <ProtectedRoute>
                        <Cart />
                    </ProtectedRoute>
                )
            },
            {
                path: "/checkout",
                element: (
                    <ProtectedRoute>
                        <Checkout />
                    </ProtectedRoute>
                )
            },
            {
                path: "/payment/:provider",
                element: (
                    <ProtectedRoute>
                        <PaymentGateway />
                    </ProtectedRoute>
                )
            },
            {
                path: "/payment/return",
                element: (
                    <ProtectedRoute>
                        <PaymentReturn />
                    </ProtectedRoute>
                )
            },
            {
                path: "/checkout/success",
                element: (
                    <ProtectedRoute>
                        <PaymentSuccess />
                    </ProtectedRoute>
                )
            },
            {
                path: "/orders",
                element: (
                    <ProtectedRoute>
                        <OrderSummary />
                    </ProtectedRoute>
                )
            }
        ]
    },
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/signup",
        element: <Signup />
    },
    {
        // ADMIN PROTECTED: All admin routes
        path: "/admin",
        element: (
            <AdminRoute>
                <AdminLayout />
            </AdminRoute>
        ),
        children: [
            {
                index: true,
                element: <DashboardAdmin />
            },
            {
                path: "adminmedicine",
                element: <MedicineAdmin />
            },
            {
                path: "adminfeed",
                element: <FeedAdmin />
            },
            {
                path: "adminconsultation",
                element: <ConsultationAdmin />
            },
            {
                path: "adminblog",
                element: <BlogsAdmin />
            },
            {
                path: "admindashboard",
                element: <DashboardAdmin />
            },
            {
                path: "stockupdate",
                element: <StockManagement />
            }
        ]
    }
]);