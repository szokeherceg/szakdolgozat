import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

import { Button, FormSetUp, Header } from "../components";
import { DataNameModel } from "../models";
import Load from "./../assets/load.svg";

import "./list.css";

export const AI = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [horse, setHorse] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnalysis, setHasAnalysis] = useState(false);

  const { id } = useParams<{ id: string }>();
  const apiUrl = import.meta.env.VITE_BASE_URL;
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/HorsesList");
  };

  const fetchHorse = async () => {
    try {
      const token = localStorage.getItem(DataNameModel.ACCESS_TOKEN);

      const response = await axios.get(`${apiUrl}/horse-data/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setHorse(response.data);
    } catch (error) {
      console.error("Failed to fetch horse data", error);
      toast.error(t("failed_to_load_data"));
    }
  };

  useEffect(() => {
    fetchHorse();
  }, [id]);

  const handleAnalysis = async () => {
    try {
      const token = localStorage.getItem(DataNameModel.ACCESS_TOKEN);

      if (!token) return;

      setIsAnalyzing(true);

      const response = await axios.get(`${apiUrl}/ai/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.data.success) {
        toast.error(t("update_failed"));
        return;
      }

      setHorse((prev: any) => ({
        ...prev,
        height: response.data.height,
        ai_image: response.data.image,
      }));

      setHasAnalysis(true);
      toast.success(t("data_saved_successfully"));
    } catch (error) {
      console.error("Error while running AI analysis:", error);
      toast.error(t("update_failed"));
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!horse) {
    return (
      <div className="loader-container">
        <img src={Load} alt="Loading..." className="loading-image" />
      </div>
    );
  }

  const imageUrl = horse.ai_image || horse.image;

  return (
    <>
      <Header
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <FormSetUp
        className={`page-layout horse-detail-page ${
          isSidebarOpen ? "form-shifted" : "form-centered"
        }`}
      >
        <div className="horse-details">
          <div className="horse-info">
            {imageUrl && (
              <img
                src={`${apiUrl}${imageUrl}`}
                alt={horse.name}
                className="modal-image"
              />
            )}

            <section className="info-details">
              <h2 className="horse-name">{horse.name}</h2>

              {horse.gender && (
                <p>
                  {t(DataNameModel.HORSE_GENDER)}: {t(horse.gender)}
                </p>
              )}

              {horse.breed && (
                <p>
                  {t(DataNameModel.HORSE_BREED)}: {horse.breed}
                </p>
              )}

              {horse.age != null && (
                <p>
                  {t(DataNameModel.HORSE_AGE)}: {horse.age}
                </p>
              )}

              {horse.height != null && (
                <p>
                  {t(DataNameModel.HORSE_HEIGHT)}: {horse.height} cm
                </p>
              )}

              {horse.weight != null && (
                <p>
                  {t(DataNameModel.HORSE_WEIGHT)}: {horse.weight} kg
                </p>
              )}

              {horse.desc && (
                <p className="description-text">
                  {t(DataNameModel.HORSE_DESC)}: {horse.desc}
                </p>
              )}
            </section>
          </div>

          <div className="details-button">
            <Button type="button" onClick={handleBack}>
              {t("back")}
            </Button>

            {!hasAnalysis && (
              <Button
                type="button"
                onClick={handleAnalysis}
                disabled={isAnalyzing}
              >
                {t("save")}
              </Button>
            )}
          </div>
        </div>
      </FormSetUp>
    </>
  );
};
