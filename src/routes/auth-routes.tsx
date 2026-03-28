import { Route, Routes } from 'react-router-dom';
import LoginPage from "../pages/auth/login";


const AuthRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
        </Routes>
    );
};

export default AuthRoutes;
