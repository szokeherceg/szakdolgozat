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

const navigateToSignIn = () => {
  window.location.href = "/SignIn";
};

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        navigateToSignIn();
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(
          "http://127.0.0.1:8080/user/api/token/refresh/",
          { refresh: refreshToken }
        );
        localStorage.setItem("accessToken", data.access);
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${data.access}`;
        originalRequest.headers["Authorization"] = `Bearer ${data.access}`;
        return axios(originalRequest);
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

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
