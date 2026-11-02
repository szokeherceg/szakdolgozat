import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

import { Button, MeasurementFields, PageLayout } from "../../components";
import { MeasurementFormData, MeasurementModel } from "../../models";
import { apiUrl } from "../../utils/api";
import { createMeasurementSchema } from "../../utils/validation";

import "react-datepicker/dist/react-datepicker.css";

const measurementSchema = createMeasurementSchema(true);

const numericFields = ["height", "weight", "girth", "cannon_girth"] as const;

export const EditMeasurement = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [horseBirthDate, setHorseBirthDate] = useState<string | null>(null);
  const [measurementLoaded, setMeasurementLoaded] = useState(false);

  const form = useForm<MeasurementFormData>({
    resolver: yupResolver(measurementSchema),
    defaultValues: {
      measured_at: "",
      height: null,
      weight: null,
      girth: null,
      cannon_girth: null,
    },
  });
  const { setValue, setError, clearErrors } = form;

  useEffect(() => {
    const fetchMeasurement = async () => {
      setMeasurementLoaded(false);

      if (!id) {
        toast.error(t("could_not_save"));
        return;
      }

      try {
        const { data: measurement } = await axios.get<MeasurementModel>(
          `${apiUrl}/measurements/${id}/`,
        );

        setValue("measured_at", measurement.measured_at?.slice(0, 10) ?? "");
        numericFields.forEach((key) => {
          setValue(key, measurement[key] ?? null);
        });

        if (measurement.horse) {
          const horseResponse = await axios.get(
            `${apiUrl}/horse-data/${measurement.horse}/`,
          );

          setHorseBirthDate(horseResponse.data.birth_date || null);
        } else {
          setHorseBirthDate(null);
        }

        setMeasurementLoaded(true);
      } catch (error) {
        console.error("Failed to fetch measurement:", error);
        toast.error(t("could_not_save"));
      }
    };

    fetchMeasurement();
  }, [id, setValue, t]);

  const onSubmit = async (data: MeasurementFormData) => {
    if (!id) return;

    clearErrors("measured_at");

    if (!measurementLoaded) {
      toast.error(t("could_not_save"));
      return;
    }

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
        formData.append(key, value == null ? "" : String(value));
      });

      if (data.image?.length) {
        formData.append("image", data.image[0]);
      }

      await axios.patch(`${apiUrl}/measurements/${id}/`, formData);

      toast.success(t("data_saved_successfully"));
      navigate(-1);
    } catch (error) {
      console.error("Error while updating measurement:", error);

      if (axios.isAxiosError(error) && error.response?.data?.measured_at) {
        const serverError = error.response.data.measured_at[0];

        setError("measured_at", {
          type: "server",
          message:
            serverError === "measurement_before_birth"
              ? "measurement_before_birth"
              : "update_failed",
        });
      } else {
        toast.error(t("update_failed"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout className="ai-form" onSubmit={form.handleSubmit(onSubmit)}>
      <h2>{t("edit_data")}</h2>

      <MeasurementFields form={form} isEdit />

      <div className="edit-horse-buttons">
        <Button type="button" onClick={() => navigate(-1)}>
          {t("back")}
        </Button>
        <Button type="submit" disabled={loading || !measurementLoaded}>
          {loading ? t("saving") : t("save")}
        </Button>
      </div>
    </PageLayout>
  );
};
