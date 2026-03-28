import { BrowserRouter, Route, Routes } from "react-router-dom";
import AuthRoutes from "./auth-routes";
import MainRoutes from "./main-routes";

const RootRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/*" element={<MainRoutes />} />
                <Route path="/auth/*" element={<AuthRoutes />} />
            </Routes>
        </BrowserRouter>
    );
};

export default RootRoutes;
