import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { FormSetUp, Input, Button } from "../components";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "./pages.css";
import { toast } from "react-toastify";

type HorseDataType = {
  name: string;
  weight?: number;
  age?: number;
  desc?: string;
  image: FileList;
};

export const AI = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {}, [i18n.language]);

  const horseSchema = yup.object().shape({
    name: yup.string().required(t("required_name")),
    weight: yup.number().min(0, t("invalid_weight")).optional(),
    age: yup.number().min(0, t("invalid_age")).optional(),
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
  } = useForm<HorseDataType>({
    resolver: yupResolver(horseSchema),
  });

  const onSubmit = (data: HorseDataType) => {
    const formData = new FormData();

    formData.append("name", data.name);
    if (data.weight) formData.append("weight", data.weight.toString());
    if (data.age) formData.append("age", data.age.toString());
    if (data.image && data.image.length > 0) {
      formData.append("image", data.image[0]);
    }
    formData.append("desc", data.desc?.trim() || "Ez egy ló");

    fetch("http://127.0.0.1:8080/user/horse-data/", {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((error) => {
            console.error("Server responded with error:", error);
            throw new Error("Failed to save horse data");
          });
        }
        return response.json();
      })
      .then((data) => {
        console.log("Horse data saved successfully:", data);
        toast.success(t("data_saved_successfully"));
        navigate("/HorsesList");
      })
      .catch((error) => {
        console.error("Hiba a mentés során:", error);
      });
  };

  return (
    <FormSetUp onSubmit={handleSubmit(onSubmit)} hasModal>
      <h2>{t("enter_data")}</h2>
      <div>
        <div>
          <label>{t("horse_name")}:</label>
          <Input
            type="text"
            placeholder={t("horse_name")}
            {...register("name")}
          />
          {errors.name && <p className="errors">{errors.name.message}</p>}
        </div>
        <label>{t("weight")}:</label>
        <Input
          type="number"
          placeholder={t("weight")}
          {...register("weight")}
        />
        <div className="mb-4">
          <label>{t("age")}:</label>
          <Input type="number" placeholder={t("age")} {...register("age")} />
        </div>
        <label>{t("enter_description")}:</label>
        <Input
          type="string"
          placeholder={t("enter_description")}
          {...register("desc")}
        />
      </div>
      <div>
        <Input
          type="file"
          {...register("image")}
          className="draganddrop"
          placeholder={t("upload_hint")}
        />
        {errors.image && <p className="errors">{errors.image.message}</p>}
      </div>

      <Button type="submit">{t("save")}</Button>
    </FormSetUp>
  );
};
