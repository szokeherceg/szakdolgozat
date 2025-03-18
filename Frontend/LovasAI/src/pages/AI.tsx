import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { FormSetUp, Input, Button } from "../components";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

import "./pages.css";

const horseSchema = yup.object().shape({
  name: yup.string().required("A név megadása kötelező!"),
  weight: yup.number().min(0, "A súly nem lehet negatív!").optional(),
  age: yup.number().min(0, "Az életkor nem lehet negatív!").optional(),
  image: yup
    .mixed()
    .required("Kép feltöltése kötelező")
    .test("fileType", "Csak képfájlok engedélyezettek! (jpg, png)", (value) => {
      if (!value || !(value instanceof FileList) || value.length === 0) {
        return true;
      }
      return ["image/jpeg", "image/png"].includes(value[0].type);
    })
    .test("fileSize", "A fájl mérete nem lehet nagyobb 5MB-nál!", (value) => {
      if (!value || !(value instanceof FileList) || value.length === 0) {
        return true;
      }
      return value[0].size <= 5 * 1024 * 1024;
    }),
});

type HorseFormData = yup.InferType<typeof horseSchema>;

export const AI = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<HorseFormData>({
    resolver: yupResolver(horseSchema),
  });

  const { t, i18n } = useTranslation();

  useEffect(() => {}, [i18n.language]);

  const onSubmit = (data: HorseFormData) => {
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
