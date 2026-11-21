import { useTranslation } from "react-i18next";
import axios from "axios";
import { useEffect } from "react";
import { Button, PageLayout } from "../../components";
import { apiUrl } from "../../utils/api";

import "../../styles/pages.css";

export const MainPage = () => {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${apiUrl}/user_details/`);
        await i18n.changeLanguage(response.data.lang);
      } catch (error) {
        console.error("Felhasználói adatok lekérése sikertelen", error);
      }
    };

    fetchUserData();
  }, [i18n]);

  return (
    <PageLayout className="page-layout main-page">
      <div className="main-content">
        <section className="home-card home-welcome">
          <h2>{t("welcome")}</h2>
          <p>{t("welcome_desc")}</p>
        </section>

        <section className="home-card home-marker">
          <img
            src="/aruco_jelolo.svg"
            alt="ArUco"
            className="home-marker-image"
          />
          <div className="home-marker-text">
            <h2>{t("marker_title")}</h2>
            <p>{t("marker_desc")}</p>
            <Button
              type="button"
              onClick={() => window.open("/aruco_jelolo_20cm.pdf", "_blank")}
            >
              {t("marker_download")}
            </Button>
          </div>
        </section>

        <section className="home-card">
          <h2>{t("first_steps")}</h2>
          <ol className="home-steps">
            <li>{t("step_add_horse")}</li>
            <li>{t("step_photo")}</li>
            <li>{t("step_add_measurement")}</li>
            <li>{t("step_run_ai")}</li>
          </ol>
        </section>
      </div>
    </PageLayout>
  );
};
