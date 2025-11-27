import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Toaster } from "react-hot-toast";

function App() {
    return (
        <>
            <Toaster position="top-center" reverseOrder={false} />
            <YourRoutes />
            <ToastContainer position="top-right" autoClose={3000} />
        </>
    );
}

export default App;