import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import classNames from "classnames";

import { FormSetUp, Input, Button, Header } from "../components";
import { DataNameModel, HorseDataTypeModel } from "../models";

import "./registration/registration.css";

const apiUrl = import.meta.env.VITE_BASE_URL;

export const AddHorse = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
      localStorage.getItem(DataNameModel.ACCESS_TOKEN) ||
      localStorage.getItem(DataNameModel.REFRESH_TOKEN);

    const postHorseData = async () => {
      const formData = new FormData();
      formData.append(DataNameModel.HORSE_NAME, data.name);
      if (data.weight)
        formData.append(DataNameModel.HORSE_WEIGHT, data.weight.toString());
      if (data.age)
        formData.append(DataNameModel.HORSE_AGE, data.age.toString());
      if (data.image && data.image.length > 0) {
        formData.append(DataNameModel.HORSE_IMAGE, data.image[0]);
      }
      formData.append(DataNameModel.HORSE_DESC, data.desc?.trim() || "");

      try {
        const response = await axios.post(`${apiUrl}/horse-data/`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const horseId = response.data.id;
        console.log("Horse data uploaded successfully, horseId:", horseId);

        if (horseId) {
          await createUserHorseConnection(horseId);
        }
      } catch (error: any) {
        console.error("Hiba a ló adatainak feltöltésekor:", error);
      }
    };

    const createUserHorseConnection = async (horseId: number) => {
      try {
        const payload = { horse_id: horseId };

        await axios.post(`${apiUrl}/user-horses/`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        navigate("/HorsesList");
      } catch (error: any) {
        console.error("Hiba a kapcsolat létrehozásakor:", error);
      }
    };

    await postHorseData();
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

        <Button type="submit">{t("save")}</Button>
      </FormSetUp>
    </>
  );
};
