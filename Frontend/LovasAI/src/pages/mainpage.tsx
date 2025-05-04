import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import axios from "axios";
import { FormSetUp, Header } from "../components";

import "./pages.css";

const apiUrl = import.meta.env.VITE_BASE_URL;

export const MainPage = () => {
  const { t, i18n } = useTranslation();
  const [userLanguage, setUserLanguage] = useState<string>("");

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      try {
        const response = await axios.get(`${apiUrl}/user/user_details/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userLang = response.data.lang;
        console.log(userLang);
        await i18n.changeLanguage(userLang);
        setUserLanguage(userLang);
      } catch (error) {
        console.error("Felhasználói adatok lekérése sikertelen", error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <>
      <Header />
      <FormSetUp hasModal>
        <div className="main-content">
          <h2>{t("what_is_this")}</h2>
          <p>{t("what_is_this_desc")}</p>

          <h2>{t("goal")}</h2>
          <p>{t("goal_desc")}</p>

          <h2>{t("who_is_it_for")}</h2>
          <ul>
            <li>{t("farmers")}</li>
            <li>{t("veterinarians")}</li>
            <li>{t("breeders")}</li>
          </ul>

          <h2>{t("how_it_works")}</h2>
          <ol>
            <li>{t("step_upload")}</li>
            <li>{t("step_analysis")}</li>
            <li>{t("step_results")}</li>
          </ol>

          <h2>{t("why_use_it")}</h2>
          <ul>
            <li>{t("fast_accurate")}</li>
            <li>{t("user_friendly")}</li>
            <li>{t("ai_processing")}</li>
          </ul>
        </div>
      </FormSetUp>
    </>
  );
};
