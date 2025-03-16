import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Input, Button, FormSetUp } from "../components";
import { useTranslation } from "react-i18next";

import Show from "./../assets/show-password.svg";
import Hide from "./../assets/hide-password.svg";

import "./pages.css";

const schema = yup.object().shape({
  email: yup
    .string()
    .email("Érvényes e-mail címet adj meg!")
    .required("Az e-mail megadása kötelező!"),
  password: yup
    .string()
    .min(6, "Minimum 6 karakter hosszú legyen!")
    .required("A jelszó megadása kötelező!"),
  language: yup.string().required("Válassz egy nyelvet!"),
});

export const Settings = () => {
  const { t, i18n } = useTranslation();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { language: i18n.language },
  });

  useEffect(() => {
    setValue("language", i18n.language);
  }, [i18n.language, setValue]);

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
    setValue("language", language);
  };

  const onSubmit = (data: {
    email: string;
    password: string;
    language: string;
  }) => {
    console.log("Form data:", data);
    alert("Form sikeresen elküldve!");
  };

  return (
    <FormSetUp onSubmit={handleSubmit(onSubmit)} className="settings" hasModal>
      <h2 className="text-2xl font-semibold text-center text-gray-700">
        {t("settings")}
      </h2>

      <div>
        <label className="block text-sm font-medium text-gray-600">
          {t("email")}
        </label>
        <Input type="email" {...register("email")} placeholder={t("email")} />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}

        <label className="block text-sm font-medium text-gray-600">
          {t("password")}
        </label>
        <Input
          type="password"
          placeholder={t("password")}
          {...register("password")}
          srcShow={Show}
          srcHide={Hide}
        />
        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
        )}

        <div className="lang">
          <label className="block text-sm font-medium text-gray-600 mb-2">
            {t("language")}
          </label>
          <select
            {...register("language")}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="block w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-blue-200"
          >
            <option value="hu">{t("hungarian")}</option>
            <option value="en">{t("english")}</option>
          </select>
          {errors.language && (
            <p className="text-red-500 text-sm mt-1">
              {errors.language.message}
            </p>
          )}
        </div>

        {errors.language && (
          <p className="text-red-500 text-sm mt-1">{errors.language.message}</p>
        )}
      </div>

      <Button type="submit">{t("submit")}</Button>
    </FormSetUp>
  );
};
