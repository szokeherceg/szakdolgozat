import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import DatePicker from "react-datepicker";
import { toast } from "react-toastify";
import classNames from "classnames";

import { FormSetUp, Input, Button, Header } from "../components";
import { DataNameModel } from "../models";

import "react-datepicker/dist/react-datepicker.css";
import "./registration/registration.css";

const apiUrl = import.meta.env.VITE_BASE_URL;

const getCurrentDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const measurementSchema = yup.object({
  measured_at: yup.string().required("required"),
  height: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue == null ? null : value,
    )
    .typeError("invalid_measurement")
    .nullable()
    .optional()
    .min(50, "height_range")
    .max(175, "height_range"),
  weight: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue == null ? null : value,
    )
    .typeError("invalid_measurement")
    .nullable()
    .optional()
    .min(25, "weight_range")
    .max(900, "weight_range"),
  girth: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue == null ? null : value,
    )
    .typeError("invalid_measurement")
    .nullable()
    .optional()
    .min(40, "girth_range")
    .max(230, "girth_range"),
  cannon_girth: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue == null ? null : value,
    )
    .typeError("invalid_measurement")
    .nullable()
    .optional()
    .min(6, "cannon_girth_range")
    .max(32, "cannon_girth_range"),
  image: yup
    .mixed<FileList>()
    .test("required", "file_required", (value) => {
      return value instanceof FileList && value.length > 0;
    })
    .test("fileType", "invalid_file_type", (value) => {
      if (!value || value.length === 0) return true;
      return ["image/jpeg", "image/png"].includes(value[0].type);
    })
    .test("fileSize", "file_too_large", (value) => {
      if (!value || value.length === 0) return true;
      return value[0].size <= 5 * 1024 * 1024;
    }),
});

type MeasurementFormData = yup.InferType<typeof measurementSchema>;

export const AddMeasurement = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [horseBirthDate, setHorseBirthDate] = useState<string | null>(null);
  const [horseLoaded, setHorseLoaded] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<MeasurementFormData>({
    resolver: yupResolver(measurementSchema),
    defaultValues: {
      measured_at: getCurrentDate(),
      height: null,
      weight: null,
      girth: null,
      cannon_girth: null,
    },
  });

  const measuredAt = watch("measured_at");

  useEffect(() => {
    const fetchHorse = async () => {
      setHorseLoaded(false);

      const token = localStorage.getItem(DataNameModel.ACCESS_TOKEN);

      if (!token || !id) {
        toast.error(t("could_not_load"));
        return;
      }

      try {
        const response = await axios.get(`${apiUrl}/horse-data/${id}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

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
      const token = localStorage.getItem(DataNameModel.ACCESS_TOKEN);

      if (!token) {
        toast.error(t("missing_token"));
        return;
      }

      const formData = new FormData();

      formData.append(
        "measured_at",
        new Date(`${data.measured_at}T00:00:00`).toISOString(),
      );

      const numericFields = [
        "height",
        "weight",
        "girth",
        "cannon_girth",
      ] as const;

      numericFields.forEach((key) => {
        const value = data[key];

        if (value !== undefined && value !== null && !Number.isNaN(value)) {
          formData.append(key, String(value));
        }
      });

      if (data.image instanceof FileList && data.image.length > 0) {
        formData.append("image", data.image[0]);
      }

      await axios.post(`${apiUrl}/horse-data/${id}/measurements/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
    <>
      <Header
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <FormSetUp
        onSubmit={handleSubmit(onSubmit)}
        className={classNames("ai-form", {
          "form-shifted": isSidebarOpen,
          "form-centered": !isSidebarOpen,
        })}
      >
        <h2>{t("add_measurement")}</h2>

        <div className="input-group">
          <label htmlFor="measured_at">{t("measurement_date")} *</label>
          <DatePicker
            id="measured_at"
            selected={
              measuredAt
                ? new Date(`${measuredAt.slice(0, 10)}T00:00:00`)
                : null
            }
            onChange={(date: Date | null) => {
              setValue("measured_at", date ? formatDate(date) : "", {
                shouldValidate: true,
                shouldDirty: true,
              });
              clearErrors("measured_at");
            }}
            dateFormat="yyyy-MM-dd"
            placeholderText={t("datetimeformat")}
            className="date-picker-input"
            autoComplete="off"
          />
          <input type="hidden" {...register("measured_at")} />
          {errors.measured_at && (
            <p className="errors">{t(errors.measured_at.message ?? "")}</p>
          )}
        </div>

        <div className="input-group">
          <label htmlFor="height">{t("height")}</label>
          <Input
            id="height"
            type="number"
            step="any"
            min="50"
            max="175"
            placeholder={t("height")}
            {...register("height")}
          />
          {errors.height && (
            <p className="errors">{t(errors.height.message ?? "")}</p>
          )}
        </div>

        <div className="input-group">
          <label htmlFor="weight">{t("weight")}</label>
          <Input
            id="weight"
            type="number"
            step="any"
            min="25"
            max="900"
            placeholder={t("weight")}
            {...register("weight")}
          />
          {errors.weight && (
            <p className="errors">{t(errors.weight.message ?? "")}</p>
          )}
        </div>

        <div className="input-group">
          <label htmlFor="girth">{t("girth")}</label>
          <Input
            id="girth"
            type="number"
            step="any"
            min="40"
            max="230"
            placeholder={t("girth")}
            {...register("girth")}
          />
          {errors.girth && (
            <p className="errors">{t(errors.girth.message ?? "")}</p>
          )}
        </div>

        <div className="input-group">
          <label htmlFor="cannon_girth">{t("cannon_girth")}</label>
          <Input
            id="cannon_girth"
            type="number"
            step="any"
            min="6"
            max="32"
            placeholder={t("cannon_girth")}
            {...register("cannon_girth")}
          />
          {errors.cannon_girth && (
            <p className="errors">{t(errors.cannon_girth.message ?? "")}</p>
          )}
        </div>

        <div className="input-group">
          <p className="measurement-image-hint">
            {t("measurement_image_hint")}
          </p>

          <label htmlFor="image">{t("measurement_image")}</label>
          <Input
            id="image"
            type="file"
            accept="image/jpeg,image/png"
            className="draganddrop"
            {...register("image")}
          />
          {errors.image && (
            <p className="errors">{t(errors.image.message ?? "")}</p>
          )}
        </div>

        <div className="edit-horse-buttons">
          <Button type="button" onClick={() => navigate(`/HorseDetail/${id}`)}>
            {t("back")}
          </Button>
          <Button type="submit" disabled={loading || !horseLoaded}>
            {t("save")}
          </Button>
        </div>
      </FormSetUp>
    </>
  );
};
