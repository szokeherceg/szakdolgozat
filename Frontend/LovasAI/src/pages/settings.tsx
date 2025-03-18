import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input, Button, FormSetUp } from "../components";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import Show from "./../assets/show-password.svg";
import Hide from "./../assets/hide-password.svg";

import "./pages.css";

export const Settings = () => {
  const { t, i18n } = useTranslation();
  const [lang, setLang] = useState(i18n.language);
  const navigate = useNavigate();

  const { register, handleSubmit } = useForm({
    defaultValues: { email: "", password: "", language: i18n.language },
  });

  const handleLanguageChange = (language: string) => {
    setLang(language);
  };

  const onSubmit = (data: {
    email?: string;
    password?: string;
    language: string;
  }) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("i18nextLng", lang);
  };

  const backButton = () => {
    navigate(-1);
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

        <div className="lang">
          <label className="block text-sm font-medium text-gray-600 mb-2">
            {t("language")}
          </label>
          <select
            value={lang}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="block w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-blue-200"
          >
            <option value="hu">{t("hungarian")}</option>
            <option value="en">{t("english")}</option>
          </select>
        </div>
      </div>

      <div className="settings-buttons">
        <Button type="submit">{t("save")}</Button>
        <Button type="submit" onClick={backButton}>
          {t("back")}
        </Button>
      </div>
    </FormSetUp>
  );
};
