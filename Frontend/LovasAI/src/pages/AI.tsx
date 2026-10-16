import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

import { Button, FormSetUp, Header } from "../components";
import { DataNameModel } from "../models";
import Load from "./../assets/load.svg";
import NotFound from "../assets/notfound.png";

import "./list.css";

interface Horse {
  id: number;
  name: string;
  gender?: string;
  breed?: string | null;
  age?: number | null;
  height?: number | null;
  weight?: number | null;
  desc?: string | null;
}

interface HorseMeasurement {
  id: number;
  horse: number;
  measured_at: string;
  height?: number | null;
  weight?: number | null;
  image?: string | null;
  ai_image?: string | null;
}

interface AIResponse {
  success: boolean;
  height?: number | null;
  image?: string | null;
  error?: string;
}

const apiUrl = import.meta.env.VITE_BASE_URL;

const getMediaUrl = (path?: string | null) => {
  if (!path) return NotFound;

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${apiUrl}${path.startsWith("/") ? path : `/${path}`}`;
};

export const AI = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [horse, setHorse] = useState<Horse | null>(null);
  const [measurement, setMeasurement] = useState<HorseMeasurement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const measurementId = searchParams.get("measurementId");

  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(`/HorseDetail/${id}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !measurementId) {
        toast.error(t("failed_to_load_data"));
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem(DataNameModel.ACCESS_TOKEN);

      if (!token) {
        toast.error(t("failed_to_load_data"));
        setIsLoading(false);
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      setIsLoading(true);

      try {
        const [horseResponse, measurementResponse] = await Promise.all([
          axios.get(`${apiUrl}/horse-data/${id}/`, config),
          axios.get(`${apiUrl}/measurements/${measurementId}/`, config),
        ]);

        const loadedHorse: Horse = horseResponse.data;
        const loadedMeasurement: HorseMeasurement = measurementResponse.data;

        if (String(loadedMeasurement.horse) !== String(loadedHorse.id)) {
          toast.error(t("failed_to_load_data"));
          setHorse(null);
          setMeasurement(null);
          return;
        }

        setHorse(loadedHorse);
        setMeasurement(loadedMeasurement);
      } catch (error) {
        console.error("Failed to load measurement data:", error);
        toast.error(t("failed_to_load_data"));
        setHorse(null);
        setMeasurement(null);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchData();
  }, [id, measurementId, t]);

  const handleAnalysis = async () => {
    if (!measurement || !measurementId) {
      toast.error(t("failed_to_load_data"));
      return;
    }

    const token = localStorage.getItem(DataNameModel.ACCESS_TOKEN);

    if (!token) {
      toast.error(t("failed_to_load_data"));
      return;
    }

    if (!measurement.image) {
      toast.error(t("update_failed"));
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await axios.post<AIResponse>(
        `${apiUrl}/measurements/${measurementId}/ai/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.data.success) {
        toast.error(t("update_failed"));
        return;
      }

      setMeasurement((previous) =>
        previous
          ? {
              ...previous,
              height: response.data.height ?? previous.height,
              ai_image: response.data.image ?? previous.ai_image,
            }
          : previous,
      );

      setHorse((previous) =>
        previous
          ? {
              ...previous,
              height: response.data.height ?? previous.height,
            }
          : previous,
      );

      toast.success(t("data_saved_successfully"));
    } catch (error) {
      console.error("Error while running AI analysis:", error);
      toast.error(t("update_failed"));
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
        <div className="loader-container">
          <img src={Load} alt="Loading..." className="loading-image" />
        </div>
      </>
    );
  }

  if (!horse || !measurement) {
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
          <Button type="button" onClick={handleBack}>
            {t("back")}
          </Button>
        </FormSetUp>
      </>
    );
  }

  const imageUrl = measurement.ai_image || measurement.image;

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
            <img
              src={getMediaUrl(imageUrl)}
              alt={horse.name}
              className="modal-image"
            />

            <section className="info-details">
              <h2 className="horse-name">{horse.name}</h2>

              <p>
                <strong>{t("measurements")}:</strong>{" "}
                {new Date(measurement.measured_at).toLocaleDateString()}
              </p>

              {horse.gender && (
                <p>
                  {t(DataNameModel.HORSE_GENDER)}: {t(horse.gender)}
                </p>
              )}

              {horse.breed && (
                <p>
                  {t(DataNameModel.HORSE_BREED)}: {t(horse.breed)}
                </p>
              )}

              {horse.age != null && (
                <p>
                  {t(DataNameModel.HORSE_AGE)}: {horse.age}
                </p>
              )}

              {measurement.height != null && (
                <p>
                  {t(DataNameModel.HORSE_HEIGHT)}: {measurement.height} cm
                </p>
              )}

              {measurement.weight != null && (
                <p>
                  {t(DataNameModel.HORSE_WEIGHT)}: {measurement.weight} kg
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

            <Button
              type="button"
              onClick={handleAnalysis}
              disabled={isAnalyzing || !measurement.image}
            >
              {isAnalyzing ? t("loading") : t("save")}
            </Button>
          </div>
        </div>
      </FormSetUp>
    </>
  );
};
