import { useTranslation } from "react-i18next";
import { FormSetUp } from "../components";
import "./pages.css";
import { useEffect } from "react";

export const MainPage = () => {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    console.log("Nyelv változott:", i18n.language);
  }, [i18n.language]);

  return (
    <FormSetUp hasModal>
      <div className="main-content">
        <h2>📌 {t("what_is_this")}</h2>
        <p>{t("what_is_this_desc")}</p>

        <h2>🎯 {t("goal")}</h2>
        <p>{t("goal_desc")}</p>

        <h2>🐴 {t("who_is_it_for")}</h2>
        <ul>
          <li>🛡️ {t("farmers")}</li>
          <li>👩‍⚕️ {t("veterinarians")}</li>
          <li>🏆 {t("breeders")}</li>
        </ul>

        <h2>⚙️ {t("how_it_works")}</h2>
        <ol>
          <li>📸 {t("step_upload")}</li>
          <li>🤖 {t("step_analysis")}</li>
          <li>📊 {t("step_results")}</li>
        </ol>

        <h2>🚀 {t("why_use_it")}</h2>
        <ul>
          <li>✅ {t("fast_accurate")}</li>
          <li>✅ {t("user_friendly")}</li>
          <li>✅ {t("ai_processing")}</li>
        </ul>
      </div>
    </FormSetUp>
  );
};
