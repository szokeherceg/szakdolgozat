import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

import { Button, PageLayout } from "../../components";
import {
  AIResponseModel,
  DataNameModel,
  HorseModel,
  MeasurementModel,
} from "../../models";
import { apiUrl, getMediaUrl } from "../../utils/api";


export const AI = () => {
  const [horse, setHorse] = useState<HorseModel | null>(null);
  const [measurement, setMeasurement] = useState<MeasurementModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

      setIsLoading(true);

      try {
        const [horseResponse, measurementResponse] = await Promise.all([
          axios.get<HorseModel>(`${apiUrl}/horse-data/${id}/`),
          axios.get<MeasurementModel>(`${apiUrl}/measurements/${measurementId}/`),
        ]);

        const loadedHorse = horseResponse.data;
        const loadedMeasurement = measurementResponse.data;

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

    if (!measurement.image) {
      toast.error(t("update_failed"));
      return;
    }

    setIsLoading(true);

    try {
      const { data } = await axios.post<AIResponseModel>(
        `${apiUrl}/measurements/${measurementId}/ai/`,
        {},
      );

      if (!data.success) {
        toast.error(t("update_failed"));
        return;
      }

      setMeasurement((previous) =>
        previous
          ? {
              ...previous,
              height: data.height ?? previous.height,
              ai_image: data.image ?? previous.ai_image,
            }
          : previous,
      );

      setHorse((previous) =>
        previous
          ? { ...previous, height: data.height ?? previous.height }
          : previous,
      );

      toast.success(t("data_saved_successfully"));
    } catch (error) {
      console.error("Error while running AI analysis:", error);
      toast.error(t("update_failed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageLayout className="page-layout horse-detail-page" isLoading={isLoading}>
      {horse && measurement ? (
        <div className="horse-details">
          <div className="horse-info">
            <img
              src={getMediaUrl(measurement.ai_image || measurement.image)}
              alt={horse.name}
              className="modal-image"
            />

            <section className="info-details">
              <h2 className="horse-name">{horse.name}</h2>

              <p>
                <strong>{t("page_measurements")}:</strong>{" "}
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
              disabled={isLoading || !measurement.image}
            >
              {t("save")}
            </Button>
          </div>
        </div>
      ) : (
        <Button type="button" onClick={handleBack}>
          {t("back")}
        </Button>
      )}
    </PageLayout>
  );
};
