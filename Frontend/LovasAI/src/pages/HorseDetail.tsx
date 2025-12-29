import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
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
      <>
        <div className="loader-container">
          <img src={Load} alt="Loading..." className="loading-image" />
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <FormSetUp className={isSidebarOpen ? "form-shifted" : "form-centered"}>
        <div className="horse-info">
          <section>
            {horse.image && (
              <img
                src={`${apiUrl}${horse.image}`}
                alt={horse.name}
                className="modal-image"
              />
            )}
          </section>
          <section>
            <h2 className="horse-name">{horse.name}</h2>
            <p>
              {t(DataNameModel.HORSE_GENDER)}: {t(horse.gender)}
            </p>
            <p>
              {t(DataNameModel.HORSE_BREED)}: {horse.breed}
            </p>
            <p>
              {t(DataNameModel.HORSE_AGE)}: {horse.age}
            </p>
            <p>
              {t(DataNameModel.HORSE_WEIGHT)}: {horse.weight}
            </p>
            <p>
              {t(DataNameModel.HORSE_DESC)}: {horse.desc}
            </p>
          </section>
        </div>
        <Button onClick={handleBack}>{t("back")}</Button>
      </FormSetUp>
    </>
  );
};
