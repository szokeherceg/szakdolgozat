import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

import { Button, MeasurementFields, PageLayout } from "../../components";
import { MeasurementFormData } from "../../models";
import { apiUrl } from "../../utils/api";
import { formatDate } from "../../utils/date";
import { createMeasurementSchema } from "../../utils/validation";

import "react-datepicker/dist/react-datepicker.css";

const measurementSchema = createMeasurementSchema(false);

const numericFields = ["height", "weight", "girth", "cannon_girth"] as const;

export const AddMeasurement = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(false);
  const [horseBirthDate, setHorseBirthDate] = useState<string | null>(null);
  const [horseLoaded, setHorseLoaded] = useState(false);

  const form = useForm<MeasurementFormData>({
    resolver: yupResolver(measurementSchema),
    defaultValues: {
      measured_at: formatDate(new Date()),
      height: null,
      weight: null,
      girth: null,
      cannon_girth: null,
    },
  });
  const { setError, clearErrors } = form;

  useEffect(() => {
    const fetchHorse = async () => {
      setHorseLoaded(false);

      if (!id) {
        toast.error(t("could_not_load"));
        return;
      }

      try {
        const response = await axios.get(`${apiUrl}/horse-data/${id}/`);

        setHorseBirthDate(response.data.birth_date || null);
        setHorseLoaded(true);
      } catch (error) {
        console.error("Error while fetching horse:", error);
        toast.error(t("could_not_load"));
      }
    };

    fetchHorse();
  }, [id, t]);

  const onSubmit = async (data: MeasurementFormData) => {
    if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
      toast.error(t("could_not_save"));
      return;
    }

    if (!horseLoaded) {
      toast.error(t("could_not_load"));
      return;
    }

    clearErrors("measured_at");

    if (horseBirthDate && data.measured_at < horseBirthDate) {
      setError("measured_at", {
        type: "manual",
        message: "measurement_before_birth",
      });
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append(
        "measured_at",
        new Date(`${data.measured_at}T00:00:00`).toISOString(),
      );

      numericFields.forEach((key) => {
        const value = data[key];

        if (value !== undefined && value !== null && !Number.isNaN(value)) {
          formData.append(key, String(value));
        }
      });

      if (data.image instanceof FileList && data.image.length > 0) {
        formData.append("image", data.image[0]);
      }

      await axios.post(`${apiUrl}/horse-data/${id}/measurements/`, formData);

      toast.success(t("data_saved_successfully"));
      navigate(`/HorseDetail/${id}`);
    } catch (error) {
      console.error("Error while saving measurement:", error);

      if (axios.isAxiosError(error) && error.response?.data?.measured_at) {
        const serverError = error.response.data.measured_at[0];

        setError("measured_at", {
          type: "server",
          message:
            serverError === "measurement_before_birth"
              ? "measurement_before_birth"
              : "could_not_save",
        });
      } else {
        toast.error(t("could_not_save"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout className="ai-form" onSubmit={form.handleSubmit(onSubmit)}>
      <h2>{t("add_measurement")}</h2>

      <MeasurementFields form={form} />

      <div className="edit-horse-buttons">
        <Button type="button" onClick={() => navigate(`/HorseDetail/${id}`)}>
          {t("back")}
        </Button>
        <Button type="submit" disabled={loading || !horseLoaded}>
          {t("save")}
        </Button>
      </div>
    </PageLayout>
  );
};
