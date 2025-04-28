import { Navigate, Outlet } from "react-router-dom";

const isAuthenticated = () => {
  return (
    !!localStorage.getItem("accessToken") &&
    !!localStorage.getItem("refreshToken")
  );
};

export const ProtectedRoute: React.FC = () => {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/" />;
};
