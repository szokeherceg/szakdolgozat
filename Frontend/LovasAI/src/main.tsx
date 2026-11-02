import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import { ToastContainer } from "react-toastify";
import "./styles/index.css";
import App from "./app/App.tsx";
import i18n from "./i18n";
import { setupAuth } from "./utils/auth";

setupAuth();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <I18nextProvider i18n={i18n}>
        <App />
        <ToastContainer position="top-right" autoClose={3000} />
      </I18nextProvider>
    </BrowserRouter>
  </StrictMode>,
);
