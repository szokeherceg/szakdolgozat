import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { FormSetUp, Input, Button, Header } from "../components";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { useEffect } from "react";

import "./registration/registration.css";

type HorseDataType = {
  name?: string;
  weight?: number | null;
  age?: number | null;
  desc?: string;
  image?: FileList;
};

export const EditHorse = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const horseSchema = yup.object().shape({
    image: yup
      .mixed<FileList>()
      .optional()
      .test("fileType", t("invalid_file_type"), (value) => {
        if (!value || !(value instanceof FileList) || value.length === 0) {
          return true;
        }
        return ["image/jpeg", "image/png"].includes(value[0].type);
      })
      .test("fileSize", t("file_too_large"), (value) => {
        if (!value || !(value instanceof FileList) || value.length === 0) {
          return true;
        }
        return value[0].size <= 5 * 1024 * 1024;
      }),
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<HorseDataType>({
    resolver: yupResolver(horseSchema),
  });

  useEffect(() => {
    const fetchHorse = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(
          `http://127.0.0.1:8080/user/horse-data/${id}/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const horse = response.data;

        setValue("name", horse.name || "");
        setValue("weight", horse.weight !== null ? horse.weight : null);
        setValue("age", horse.age !== null ? horse.age : null);
        setValue("desc", horse.desc || "");
      } catch (error) {
        console.error("Failed to fetch horse data", error);
      }
    };

    fetchHorse();
  }, [id, setValue]);

  const onSubmit = async (data: HorseDataType) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const formData = new FormData();

      if (data.name) formData.append("name", data.name);
      if (data.weight !== undefined && data.weight !== null) {
        formData.append("weight", data.weight.toString());
      }
      if (data.age !== undefined && data.age !== null) {
        formData.append("age", data.age.toString());
      }
      if (data.desc) formData.append("desc", data.desc);

      await axios.patch(
        `http://127.0.0.1:8080/user/horse-data/${id}/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success(t("data_saved_successfully"));
      navigate("/HorsesList");
    } catch (error) {
      console.error("Error while updating horse data:", error);
      toast.error(t("update_failed"));
    }
  };

  return (
    <>
      <Header />
      <FormSetUp onSubmit={handleSubmit(onSubmit)} hasModal className="ai-form">
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
