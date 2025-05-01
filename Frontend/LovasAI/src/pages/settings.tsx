import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input, Button, FormSetUp } from "../components";
import { useTranslation } from "react-i18next";

import Show from "./../assets/show-password.svg";
import Hide from "./../assets/hide-password.svg";

import "./pages.css";
import axios from "axios";

interface SettingsProps {
  onClose: () => void;
  onUpdated?: () => void;
}

export const Settings = ({ onClose, onUpdated }: SettingsProps) => {
  const { t, i18n } = useTranslation();
  const [lang, setLang] = useState(i18n.language);

  const { register, handleSubmit, setValue } = useForm({
    defaultValues: {
      email: "",
      password: "",
      name: "",
      language: i18n.language,
    },
  });

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const response = await axios.get(
          "http://127.0.0.1:8080/user/user_details/",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const userData = response.data;

        setValue("email", userData.email);
        setValue("name", userData.name);
        setValue("language", userData.language);
      } catch (error) {
        console.error("Error while fetching user details:", error);
      }
    };

    loadUserData();
  }, [i18n.language, setValue]);

  const handleLanguageChange = (language: string) => {
    setLang(language);
  };

  const onSubmit = async (data: {
    email?: string | null;
    password?: string | null;
    language: string | null;
    name?: string;
  }) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      await axios.patch(
        "http://127.0.0.1:8080/user/user_details/",
        {
          ...(data.email && { email: data.email }),
          ...(data.password && { password: data.password }),
          ...(lang && { lang: lang }),
          ...(data.name && { name: data.name }),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      i18n.changeLanguage(lang);
      onClose();
      onUpdated?.();
    } catch (error) {
      console.error("Error while updating user details:", error);
    }
  };

  return (
    <FormSetUp
      onSubmit={handleSubmit(onSubmit)}
      className="settings"
      hasModal={false}
    >
      <h2 className="settings-header">{t("settings")}</h2>

      <label className="block text-sm font-medium text-gray-600">
        {t("email")}
      </label>
      <Input type="email" {...register("email")} placeholder={t("email")} />

      <label className="block text-sm font-medium text-gray-600">
        {t("name")}
      </label>
      <Input type="string" {...register("name")} placeholder={t("name")} />

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
          <option value="de">{t("german")}</option>
          <option value="ja">{t("japanese")}</option>
        </select>
      </div>

      <div className="settings-buttons">
        <Button type="button" onClick={onClose}>
          {t("back")}
        </Button>
        <Button type="submit">{t("save")}</Button>
      </div>
    </FormSetUp>
  );
};
