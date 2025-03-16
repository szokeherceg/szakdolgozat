import i18n from "i18next";
import I18nextBrowserLanguageDetector from "i18next-browser-languagedetector";
import I18NextHttpBackend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

i18n
  .use(I18NextHttpBackend)
  .use(I18nextBrowserLanguageDetector)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },
    load: "languageOnly",
    supportedLngs: ["en", "hu"],
    fallbackLng: "hu",
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: true,
    },
    detection: {
      caches: ["localStorage"],
    },
  });

export default i18n;
