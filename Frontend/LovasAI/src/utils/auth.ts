import axios from "axios";
import { DataNameModel } from "../models";
import { apiUrl } from "./api";

let refreshPromise: Promise<string> | null = null;
let logoutTimer: ReturnType<typeof setTimeout> | null = null;
let isLoggingOut = false;

const getTokenExpiry = (token: string): number | null => {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const tokenData = JSON.parse(
      atob(payload.padEnd(Math.ceil(payload.length / 4) * 4, "=")),
    );

    return typeof tokenData.exp === "number" ? tokenData.exp * 1000 : null;
  } catch {
    return null;
  }
};

export const clearSession = () => {
  localStorage.removeItem(DataNameModel.ACCESS_TOKEN);
  localStorage.removeItem(DataNameModel.REFRESH_TOKEN);
  localStorage.removeItem(DataNameModel.SESSION_EXPIRY);
};

const navigateToSignIn = () => {
  if (isLoggingOut) return;
  isLoggingOut = true;

  if (logoutTimer) clearTimeout(logoutTimer);

  clearSession();
  window.location.href = "/SignIn";
};

const scheduleLogout = () => {
  if (logoutTimer) clearTimeout(logoutTimer);

  const expiry = Number(localStorage.getItem(DataNameModel.SESSION_EXPIRY));
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

  localStorage.setItem(DataNameModel.SESSION_EXPIRY, String(expiry));
  scheduleLogout();
};

const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem(DataNameModel.REFRESH_TOKEN);
  const expiry = Number(localStorage.getItem(DataNameModel.SESSION_EXPIRY));

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

export const setupAuth = () => {
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
    },
  );

  const savedRefreshToken = localStorage.getItem(DataNameModel.REFRESH_TOKEN);

  if (
    savedRefreshToken &&
    !localStorage.getItem(DataNameModel.SESSION_EXPIRY)
  ) {
    const expiry = getTokenExpiry(savedRefreshToken);

    if (expiry) {
      localStorage.setItem(DataNameModel.SESSION_EXPIRY, String(expiry));
    }
  }

  scheduleLogout();
};
