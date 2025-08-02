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

export const EditHorse = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const horseSchema = yup.object().shape({
    image: yup.mixed<FileList>().optional(),
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

        setValue(DataNameModel.HORSE_NAME, horse.name || "");
        setValue(
          DataNameModel.HORSE_WEIGHT,
          horse.weight !== null ? horse.weight : null
        );
        setValue(
          DataNameModel.HORSE_AGE,
          horse.age !== null ? horse.age : null
        );
        setValue(DataNameModel.HORSE_DESC, horse.desc || "");
      } catch (error) {
        console.error("Failed to fetch horse data", error);
      }
    };

    fetchHorse();
  }, [id, setValue]);

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
      if (data.image && data.image.length > 0) {
        formData.append(DataNameModel.HORSE_IMAGE, data.image[0]);
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
        <h2>{t("enter_data")}</h2>

        <div className="input-group">
          <label htmlFor="name">{t("horse_name")}:</label>
          <Input
            id="name"
            type="text"
            placeholder={t("horse_name")}
            {...register("name")}
          />
          {errors.name && <p className="errors">{errors.name.message}</p>}
        </div>

        <div className="input-group">
          <label htmlFor="image">{t("upload_hint")}:</label>
          <Input
            id="image"
            type="file"
            {...register("image")}
            className="draganddrop"
          />
          {errors.image && <p className="errors">{errors.image.message}</p>}
        </div>
        <Button type="submit" className="save">
          {t("save")}
        </Button>

        <div className="input-group">
          <label htmlFor="weight">{t("weight")}:</label>
          <Input
            id="weight"
            type="number"
            placeholder={t("weight")}
            {...register("weight")}
          />
          {errors.weight && <p className="errors">{errors.weight.message}</p>}
        </div>

        <div className="input-group">
          <label htmlFor="age">{t("age")}:</label>
          <Input
            id="age"
            type="number"
            placeholder={t("age")}
            {...register("age")}
          />
          {errors.age && <p className="errors">{errors.age.message}</p>}
        </div>

        <div className="input-group">
          <label htmlFor="desc">{t("enter_description")}:</label>
          <Input
            id="desc"
            type="text"
            placeholder={t("enter_description")}
            {...register("desc")}
          />
          {errors.desc && <p className="errors">{errors.desc.message}</p>}
        </div>

        <div className="settings-buttons">
          <Button type="submit" onClick={() => navigate("/HorsesList")}>
            {t("back")}
          </Button>
          <Button type="submit">{t("save")}</Button>
        </div>
      </FormSetUp>
    </>
  );
};
