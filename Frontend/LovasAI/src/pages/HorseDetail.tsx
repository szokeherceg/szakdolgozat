import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, FormSetUp, Header } from "../components";
import axios from "axios";
import { DataNameModel } from "../models";
import Load from "./../assets/load.svg";

export const HorseDetail = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [horse, setHorse] = useState<any>(null);
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
    }
  };

  useEffect(() => {
    fetchHorse();
  }, [id]);

  if (!horse) {
    return (
      <div className="loader-container">
        <img src={Load} alt="Loading..." className="loading-image" />
      </div>
    );
  }

  return (
    <>
      <Header
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <FormSetUp className={isSidebarOpen ? "form-shifted" : "form-centered"}>
        <div className="horse-details" >
          <div className="horse-info">
            <img
              src={`${apiUrl}${horse.image}`}
              alt={horse.name}
              className="modal-image"
            />

            <section className="info-details">
              <h2 className="horse-name">{horse.name}</h2>
              
              {horse.gender && (
                <p>
                  <strong>{t(DataNameModel.HORSE_GENDER)}:</strong> {horse.gender}
                </p>
              )}
              
              {horse.breed && (
                <p>
                  <strong>{t(DataNameModel.HORSE_BREED)}:</strong> {horse.breed}
                </p>
              )}

              {horse.age !== null && (
                <p>
                  <strong>{t(DataNameModel.HORSE_AGE)}:</strong> {horse.age}
                </p>
              )}

              {horse.weight !== null && (
                <p>
                  <strong>{t(DataNameModel.HORSE_WEIGHT)} (kg):</strong> {horse.weight}
                </p>
              )}

              {horse.desc && (
                <p className="description-text">
                  <strong>{t(DataNameModel.HORSE_DESC)}:</strong> {horse.desc}
                </p>
              )}
            </section>
          </div>

          <div style={{ clear: "both", display: "flex", justifyContent: "center", marginTop: "20px" }}>
            <Button onClick={handleBack}>
              {t("back")}
            </Button>
          </div>
        </div>
      </FormSetUp>
    </>
  );
};