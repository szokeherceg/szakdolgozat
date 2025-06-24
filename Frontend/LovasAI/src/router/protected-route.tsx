import { Navigate, Outlet } from "react-router-dom";
import { DataNameModel } from "../models";

const isAuthenticated = () => {
  return (
    !!localStorage.getItem(DataNameModel.ACCESS_TOKEN) &&
    !!localStorage.getItem(DataNameModel.REFRESH_TOKEN)
  );
};

export const ProtectedRoute = () => {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/" />;
};
