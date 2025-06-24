import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./router/App.tsx";
import "./i18n";
import i18n from "./i18n";
import { I18nextProvider } from "react-i18next";
import { ToastContainer } from "react-toastify";
import axios from "axios";
import { DataNameModel } from "./models/data-name.model.ts";

const navigateToSignIn = () => {
  window.location.href = "/SignIn";
};

const apiUrl = import.meta.env.VITE_BASE_URL;

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem(DataNameModel.REFRESH_TOKEN);
      if (!refreshToken) {
        localStorage.removeItem(DataNameModel.ACCESS_TOKEN);
        localStorage.removeItem(DataNameModel.REFRESH_TOKEN);
        navigateToSignIn();
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${apiUrl}/api/token/refresh/`, {
          refresh: refreshToken,
        });
        localStorage.setItem(DataNameModel.ACCESS_TOKEN, data.access);
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${data.access}`;
        originalRequest.headers["Authorization"] = `Bearer ${data.access}`;
        return axios(originalRequest);
      } catch {
        localStorage.removeItem(DataNameModel.ACCESS_TOKEN);
        localStorage.removeItem(DataNameModel.REFRESH_TOKEN);

        navigateToSignIn();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <I18nextProvider i18n={i18n}>
        <App />
        <ToastContainer />
      </I18nextProvider>
    </BrowserRouter>
  </StrictMode>
);
