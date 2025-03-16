import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { FormSetUp, Input, Button } from "../components";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

import "./pages.css";

const horseSchema = yup.object().shape({
  name: yup.string().required("A név megadása kötelező!"),
  weight: yup
    .number()
    .typeError("A súlynak számnak kell lennie!")
    .required("A súly megadása kötelező!")
    .min(1, "A súlynak legalább 1-nek kell lennie!"),
  age: yup
    .number()
    .typeError("Az életkornak számnak kell lennie!")
    .required("Az életkor megadása kötelező!")
    .min(0, "Az életkornak legalább 0-nak kell lennie!"),
  height: yup
    .number()
    .typeError("A magasságnak számnak kell lennie!")
    .required("A magasság megadása kötelező!")
    .min(50, "A magasságnak legalább 50 cm-nek kell lennie!"),
  image: yup
    .mixed()
    .test("fileRequired", "A kép feltöltése kötelező!", (value) => {
      return value instanceof FileList && value.length > 0;
    })
    .test("fileType", "Csak képfájlok engedélyezettek! (jpg, png)", (value) => {
      return (
        value instanceof FileList &&
        value.length > 0 &&
        ["image/jpeg", "image/png"].includes(value[0].type)
      );
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
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
        {t("enter_data")}
      </h2>
      <div className="mb-4">
        <label className="block text-gray-700 font-semibold">
          {t("horse_name")}:
        </label>
        <Input
          type="text"
          placeholder={t("horse_name")}
          {...register("name")}
        />
        {errors.name && <p className="text-red-500">{errors.name.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-gray-700 font-semibold">
            {t("weight")}:
          </label>
          <Input
            type="number"
            placeholder={t("weight")}
            {...register("weight")}
          />
          {errors.weight && (
            <p className="text-red-500">{errors.weight.message}</p>
          )}
        </div>

        <div>
          <label className="block text-gray-700 font-semibold">
            {t("age")}:
          </label>
          <Input type="number" placeholder={t("age")} {...register("age")} />
          {errors.age && <p className="text-red-500">{errors.age.message}</p>}
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-semibold">
          {t("height")}:
        </label>
        <Input
          type="number"
          placeholder={t("height")}
          {...register("height")}
        />
        {errors.height && (
          <p className="text-red-500">{errors.height.message}</p>
        )}
      </div>

      <div className="mb-4">
        <Input
          isFileInput
          {...register("image")}
          className="draganddrop"
          placeholder={t("upload_hint")}
        />
        {errors.image && <p className="text-red-500">{errors.image.message}</p>}
      </div>

      <Button type="submit">{t("save")}</Button>
    </FormSetUp>
  );
};
