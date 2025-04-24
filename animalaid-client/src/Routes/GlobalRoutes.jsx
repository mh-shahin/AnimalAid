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

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Main />,
        children: [
            {
                index: true, // same as path: "/" but cleaner
                element: <HomePage />
            },
            {
                path: "/medicin",
                element: <Medicin></Medicin>
            },
            {
                path: "medicin/category/:categoryName",
                element: <CategoryProductsPage></CategoryProductsPage>
            },
            {
                path: "/consultations",
                element: <Consultants></Consultants>
            },
            {
                path: "/equipment",
                element: <Equiepments></Equiepments>
            },
            {
                path: "/feed",
                element: <Feed></Feed>
            },
            {
                path: "/feed/category/:categoryName",
                element: <FeedCategoryProductsPage></FeedCategoryProductsPage>
            }

        ]
    },
    {
        path: "/login",
        element: <Login></Login>
    },
    {
        path: "/signup",
        element: <Signup></Signup>
    },
]);
