
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

const apiUrl = import.meta.env.VITE_BASE_URL;
const sessionExpiryKey = "session_expiry";

let refreshPromise: Promise<string> | null = null;
let logoutTimer: ReturnType<typeof setTimeout> | null = null;
let isLoggingOut = false;

const getTokenExpiry = (token: string): number | null => {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const tokenData = JSON.parse(
      atob(payload.padEnd(Math.ceil(payload.length / 4) * 4, "="))
    );

    return typeof tokenData.exp === "number" ? tokenData.exp * 1000 : null;
  } catch {
    return null;
  }
};

const navigateToSignIn = () => {
  if (isLoggingOut) return;
  isLoggingOut = true;

  if (logoutTimer) clearTimeout(logoutTimer);

  localStorage.removeItem(DataNameModel.ACCESS_TOKEN);
  localStorage.removeItem(DataNameModel.REFRESH_TOKEN);
  localStorage.removeItem(sessionExpiryKey);

  window.location.href = "/SignIn";
};

const scheduleLogout = () => {
  if (logoutTimer) clearTimeout(logoutTimer);

  const expiry = Number(localStorage.getItem(sessionExpiryKey));
  if (!expiry) return;

  const remaining = expiry - Date.now();

  if (remaining <= 0) {
    navigateToSignIn();
    return;
  }

  logoutTimer = setTimeout(navigateToSignIn, remaining);
};

export const startSessionExpiry = (refreshToken: string) => {
  const expiry = getTokenExpiry(refreshToken);
  if (!expiry) return;

  localStorage.setItem(sessionExpiryKey, String(expiry));
  scheduleLogout();
};

const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem(DataNameModel.REFRESH_TOKEN);
  const expiry = Number(localStorage.getItem(sessionExpiryKey));

  if (!refreshToken || (expiry && Date.now() >= expiry)) {
    navigateToSignIn();
    throw new Error("A munkamenet lejárt.");
  }

  const { data } = await axios.post(`${apiUrl}/api/token/refresh/`, {
    refresh: refreshToken,
  });

  if (!data.access) throw new Error("A tokenfrissítés sikertelen.");

  localStorage.setItem(DataNameModel.ACCESS_TOKEN, data.access);

  if (data.refresh) {
    localStorage.setItem(DataNameModel.REFRESH_TOKEN, data.refresh);
  }

  return data.access as string;
};

axios.interceptors.request.use((config) => {
  if (config.url?.includes("/api/token/refresh/")) return config;

  const token = localStorage.getItem(DataNameModel.ACCESS_TOKEN);

  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  } else {
    config.headers.delete("Authorization");
  }

  return config;
});

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      originalRequest.url?.includes("/api/token/refresh/")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      const accessToken = await refreshPromise;

      originalRequest.headers.set("Authorization", `Bearer ${accessToken}`);
      return axios(originalRequest);
    } catch (error) {
      navigateToSignIn();
      return Promise.reject(error);
    }
  }
);

const savedRefreshToken = localStorage.getItem(DataNameModel.REFRESH_TOKEN);

if (savedRefreshToken && !localStorage.getItem(sessionExpiryKey)) {
  const expiry = getTokenExpiry(savedRefreshToken);

  if (expiry) {
    localStorage.setItem(sessionExpiryKey, String(expiry));
  }
}

scheduleLogout();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <I18nextProvider i18n={i18n}>
        <App />
        <ToastContainer position="top-right" autoClose={3000} />
      </I18nextProvider>
    </BrowserRouter>
  </StrictMode>
);
