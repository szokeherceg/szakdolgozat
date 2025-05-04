import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { FormSetUp, Input, Button, Header } from "../components";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { HorseDataTypeModel } from "../models";

import "./registration/registration.css";

const apiUrl = import.meta.env.VITE_BASE_URL;

export const AddHorse = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {}, [i18n.language]);

  const horseSchema = yup.object().shape({
    name: yup.string().required(t("required_name")),
    weight: yup
      .number()
      .nullable()
      .transform((value, originalValue) =>
        originalValue === "" ? null : value
      )
      .notRequired()
      .test("is-positive", t("invalid_weight"), (value) => {
        if (value === null || value === undefined) return true;
        return value >= 0;
      }),

    age: yup
      .number()
      .nullable()
      .transform((value, originalValue) =>
        originalValue === "" ? null : value
      )
      .notRequired()
      .test("is-positive", t("invalid_age"), (value) => {
        if (value === null || value === undefined) return true;
        return value >= 0;
      }),

    image: yup
      .mixed<FileList>()
      .required(t("file_required"))
      .test("fileType", t("invalid_file_type"), (value) => {
        if (!value || !(value instanceof FileList) || value.length === 0) {
          return false;
        }
        return ["image/jpeg", "image/png"].includes(value[0].type);
      })
      .test("fileSize", t("file_too_large"), (value) => {
        if (!value || !(value instanceof FileList) || value.length === 0) {
          return false;
        }
        return value[0].size <= 5 * 1024 * 1024;
      }),
    desc: yup.string().optional(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HorseDataTypeModel>({
    resolver: yupResolver(horseSchema),
    defaultValues: {
      weight: null,
      age: null,
      desc: "",
    },
  });

  const onSubmit = async (data: HorseDataTypeModel) => {
    const token =
      localStorage.getItem("accessToken") ||
      localStorage.getItem("refreshToken");

    if (!token) {
      toast.error("Nincs érvényes bejelentkezés! Kérlek, jelentkezz be.");
      return;
    }

    const postHorseData = async () => {
      const formData = new FormData();
      formData.append("name", data.name);
      if (data.weight) formData.append("weight", data.weight.toString());
      if (data.age) formData.append("age", data.age.toString());
      if (data.image && data.image.length > 0) {
        formData.append("image", data.image[0]);
      }
      formData.append("desc", data.desc?.trim() || "");

      try {
        const response = await axios.post(
          `${apiUrl}/user/horse-data/`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const horseId = response.data.id;
        console.log("Horse data uploaded successfully, horseId:", horseId);

        if (horseId) {
          await createUserHorseConnection(horseId);
        }
      } catch (error: any) {
        console.error("Hiba a ló adatainak feltöltésekor:", error);
        if (error.response && error.response.status === 401) {
          toast.error("Nem megfelelő hitelesítés. Kérlek, jelentkezz be újra.");
        } else {
          toast.error("Hiba a ló adatainak feltöltésekor.");
        }
      }
    };

    const createUserHorseConnection = async (horseId: number) => {
      try {
        const payload = { horse_id: horseId };
        console.log("Kapcsolat payload:", payload);

        await axios.post(`${apiUrl}/user/user-horses/`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Horse-user kapcsolat létrejött");
        toast.success("Kapcsolat sikeresen létrejött!");
        navigate("/HorsesList");
      } catch (error: any) {
        console.error("Hiba a kapcsolat létrehozásakor:", error);
        if (error.response && error.response.status === 401) {
          toast.error("Nem megfelelő hitelesítés. Kérlek, jelentkezz be újra.");
        } else {
          toast.error("Hiba a kapcsolat létrehozásakor.");
        }
      }
    };

    await postHorseData();
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

        <Button type="submit">{t("save")}</Button>
      </FormSetUp>
    </>
  );
};
