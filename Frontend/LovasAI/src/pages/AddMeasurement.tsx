import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import classNames from "classnames";
import { toast } from "react-toastify";
import { FormSetUp, Input, Button, Header } from "../components";
import { DataNameModel } from "../models";

import "./registration/registration.css";

const apiUrl = import.meta.env.VITE_BASE_URL;

const measurementSchema = yup.object({
  measured_at: yup.string().required("required"),
  height: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === undefined ? null : value,
    )
    .nullable()
    .optional()
    .min(0, "invalid_measurement"),
  weight: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === undefined ? null : value,
    )
    .nullable()
    .optional()
    .min(0, "invalid_measurement"),
  girth: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === undefined ? null : value,
    )
    .nullable()
    .optional()
    .min(0, "invalid_measurement"),
  cannon_girth: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === undefined ? null : value,
    )
    .nullable()
    .optional()
    .min(0, "invalid_measurement"),
  image: yup
    .mixed<FileList>()
    .optional()
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

const getCurrentDateTime = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
};

export const AddMeasurement = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MeasurementFormData>({
    resolver: yupResolver(measurementSchema),
    defaultValues: {
      measured_at: getCurrentDateTime(),
      height: null,
      weight: null,
      girth: null,
      cannon_girth: null,
    },
  });

  const onSubmit = async (data: MeasurementFormData) => {
    if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
      toast.error(t("could_not_save"));
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

      formData.append("measured_at", new Date(data.measured_at).toISOString());

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
      toast.error(t("could_not_save"));
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
          <Input
            id="measured_at"
            type="datetime-local"
            {...register("measured_at")}
          />
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
            min="0"
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
            min="0"
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
            min="0"
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
            min="0"
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
          <Button type="submit" disabled={loading}>
            {loading ? t("saving") : t("save")}
          </Button>
        </div>
      </FormSetUp>
    </>
  );
};
