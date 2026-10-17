import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import classNames from "classnames";

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
    .min(50, "invalid_measurement")
    .max(175, "invalid_measurement"),
  weight: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === undefined ? null : value,
    )
    .nullable()
    .optional()
    .min(25, "invalid_measurement")
    .max(900, "invalid_measurement"),
  girth: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === undefined ? null : value,
    )
    .nullable()
    .optional()
    .min(40, "invalid_measurement")
    .max(230, "invalid_measurement"),
  cannon_girth: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === undefined ? null : value,
    )
    .nullable()
    .optional()
    .min(6, "invalid_measurement")
    .max(32, "invalid_measurement"),
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

export const EditMeasurement = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<MeasurementFormData>({
    resolver: yupResolver(measurementSchema),
    defaultValues: {
      measured_at: "",
      height: null,
      weight: null,
      girth: null,
      cannon_girth: null,
    },
  });

  useEffect(() => {
    const fetchMeasurement = async () => {
      try {
        const token = localStorage.getItem(DataNameModel.ACCESS_TOKEN);

        if (!token || !id) {
          toast.error(t("could_not_save"));
          return;
        }

        const response = await axios.get(`${apiUrl}/measurements/${id}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const measurement = response.data;

        setValue(
          "measured_at",
          measurement.measured_at ? measurement.measured_at.slice(0, 10) : "",
        );
        setValue("height", measurement.height ?? null);
        setValue("weight", measurement.weight ?? null);
        setValue("girth", measurement.girth ?? null);
        setValue("cannon_girth", measurement.cannon_girth ?? null);
      } catch (error) {
        console.error("Failed to fetch measurement:", error);
        toast.error(t("could_not_save"));
      }
    };

    fetchMeasurement();
  }, [id, setValue, t]);

  const onSubmit = async (data: MeasurementFormData) => {
    if (!id) return;

    setLoading(true);

    try {
      const token = localStorage.getItem(DataNameModel.ACCESS_TOKEN);

      if (!token) {
        toast.error(t("missing_token"));
        return;
      }

      const formData = new FormData();

      formData.append("measured_at", data.measured_at);

      const numericFields = [
        "height",
        "weight",
        "girth",
        "cannon_girth",
      ] as const;

      numericFields.forEach((key) => {
        const value = data[key];
        formData.append(key, value == null ? "" : String(value));
      });

      if (data.image?.length) {
        formData.append("image", data.image[0]);
      }

      await axios.patch(`${apiUrl}/measurements/${id}/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success(t("data_saved_successfully"));
      navigate(-1);
    } catch (error) {
      console.error("Error while updating measurement:", error);
      toast.error(t("update_failed"));
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
        <h2>{t("edit_data")}</h2>

        <div className="input-group">
          <label htmlFor="measured_at">{t("measurement_date")}</label>
          <Input id="measured_at" type="date" {...register("measured_at")} />
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
            {...register("cannon_girth")}
          />
          {errors.cannon_girth && (
            <p className="errors">{t(errors.cannon_girth.message ?? "")}</p>
          )}
        </div>

        <div className="input-group">
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
          <Button type="button" onClick={() => navigate(-1)}>
            {t("back")}
          </Button>
          <Button type="submit" disabled={loading}>
            {t("save")}
          </Button>
        </div>
      </FormSetUp>
    </>
  );
};
