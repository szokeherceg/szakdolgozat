import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { FormSetUp, Input, Button } from "../components";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

import "./pages.css";

type HorseDataType = {
  name: string;
  weight?: number;
  age?: number;
  image: FileList;
};

export const AI = () => {
  const { t, i18n } = useTranslation();

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
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<HorseDataType>({
    resolver: yupResolver(horseSchema),
  });

  const onSubmit = (data: HorseDataType) => {
    console.log("Beküldött ló adatok:", data);
    reset();
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
      </div>

      <div>
        <Input
          isFileInput
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
