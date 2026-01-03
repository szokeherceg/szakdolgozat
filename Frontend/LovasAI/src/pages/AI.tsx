import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import classNames from "classnames";

import { FormSetUp, Input, Button, Header } from "../components";
import { HorseDataModel, DataNameModel } from "../models";

import "./registration/registration.css";

const apiUrl = import.meta.env.VITE_BASE_URL;

export const AI = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentHorse, setCurrentHorse] = useState<any>(null);

  const horseSchema = yup.object().shape({
    name: yup.string().optional(),
    weight: yup.number().nullable().optional(),
    age: yup.number().nullable().optional(),
    desc: yup.string().optional(),
    image: yup.mixed<FileList>().optional(),
    video: yup.mixed<FileList>().optional(),
    breed: yup.string().nullable().optional(),
    gender: yup.string().nullable().optional(),
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<HorseDataModel>({
    resolver: yupResolver(horseSchema),
  });

  useEffect(() => {
    const fetchHorse = async () => {
      try {
        const token = localStorage.getItem(DataNameModel.ACCESS_TOKEN);
        const response = await axios.get(`${apiUrl}/horse-data/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const horse = response.data;

        setCurrentHorse(horse);

        setValue(DataNameModel.HORSE_NAME as any, horse.name || "");
        setValue(DataNameModel.HORSE_WEIGHT as any, horse.weight);
        setValue(DataNameModel.HORSE_AGE as any, horse.age);
        setValue(DataNameModel.HORSE_DESC as any, horse.desc || "");
        setValue(DataNameModel.HORSE_BREED as any, horse.breed || "");
        setValue(DataNameModel.HORSE_GENDER as any, horse.gender || "");
      } catch (error) {
        console.error("Failed to fetch horse data", error);
        toast.error(t("failed_to_load_data"));
      }
    };
    fetchHorse();
  }, [id, setValue, t]);

  const onSubmit = async (data: HorseDataModel) => {
    try {
      const token = localStorage.getItem(DataNameModel.ACCESS_TOKEN);
      if (!token) return;

      const formData = new FormData();

      if (data.name) formData.append(DataNameModel.HORSE_NAME, data.name);
      if (data.weight !== undefined && data.weight !== null) {
        formData.append(DataNameModel.HORSE_WEIGHT, data.weight.toString());
      }
      if (data.age !== undefined && data.age !== null) {
        formData.append(DataNameModel.HORSE_AGE, data.age.toString());
      }
      if (data.desc) formData.append(DataNameModel.HORSE_DESC, data.desc);
      if (data.breed) formData.append(DataNameModel.HORSE_BREED, data.breed);
      if (data.gender) formData.append(DataNameModel.HORSE_GENDER, data.gender);

      if (data.image && data.image.length > 0) {
        formData.append(DataNameModel.HORSE_IMAGE, data.image[0]);
      }

      if (data.video && data.video.length > 0) {
        formData.append(DataNameModel.HORSE_VIDEO, data.video[0]);
      }

      await axios.patch(`${apiUrl}/horse-data/${id}/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(t("data_saved_successfully"));
      navigate("/HorsesList");
    } catch (error) {
      console.error("Error while updating horse data:", error);
      toast.error(t("update_failed"));
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
        <h1>
          <strong>{t("ai_analysis")}</strong>
        </h1>

        {currentHorse && (
          <div className="horse-info-ai">
            <section className="image-preview-section">
              {currentHorse.image && (
                <img
                  src={`${apiUrl}${currentHorse.image}`}
                  alt={currentHorse.name}
                  className="modal-image"
                />
              )}
            </section>
            <section className="details-section">
              {currentHorse.name && (
                <p>
                  {t("horse_name")}: {currentHorse.name}
                </p>
              )}

              {currentHorse.gender && (
                <p>
                  {t("gender")}: {t(currentHorse.gender)}
                </p>
              )}

              {currentHorse.breed && (
                <p>
                  {t("breed")}: {currentHorse.breed}
                </p>
              )}

              {currentHorse.age && (
                <p>
                  {t("age")}: {currentHorse.age}
                </p>
              )}

              {currentHorse.weight && (
                <p>
                  {t("weight")}: {currentHorse.weight} kg
                </p>
              )}

              {currentHorse.desc && (
                <p>
                  {t("desc")}: {currentHorse.desc}
                </p>
              )}
            </section>
          </div>
        )}

        <p>
          <strong>{t("ai_analysis_hint")}</strong>
        </p>
        <div className="input-group">
          <label htmlFor="video">{t("upload_hint_video")}:</label>
          <Input
            id="video"
            type="file"
            accept="video/*"
            {...register("video")}
            className="draganddrop"
          />
          {errors.video && <p className="errors">{errors.video.message}</p>}
        </div>

        <div className="settings-buttons">
          <Button type="button" onClick={() => navigate("/HorsesList")}>
            {t("back")}
          </Button>
          <Button type="submit">{t("save")}</Button>
        </div>
      </FormSetUp>
    </>
  );
};
