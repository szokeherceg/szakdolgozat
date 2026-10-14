import { useState, useEffect } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { Input, Button, FormSetUp } from "../components";
import { useTranslation } from "react-i18next";
import { SettingsFormData, SettingsModel } from "../models";
import { toast } from "react-toastify";

import Show from "./../assets/show-password.svg";
import Hide from "./../assets/hide-password.svg";

import "./pages.css";

const apiUrl = import.meta.env.VITE_BASE_URL;

export const Settings = ({ onClose, onUpdated }: SettingsModel) => {
  const { t, i18n } = useTranslation();
  const [lang, setLang] = useState(i18n.language);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<SettingsFormData>({
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

        const response = await axios.get(`${apiUrl}/user_details/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userData = response.data;

        setValue("email", userData.email ?? "");
        setValue("name", userData.name ?? "");
        setValue("language", userData.lang ?? i18n.language);
        setLang(userData.lang ?? i18n.language);
      } catch (error) {
        console.error("Error while fetching user details:", error);
      }
    };

    loadUserData();
  }, [i18n.language, setValue]);

  const handleLanguageChange = (language: string) => {
    setLang(language);
  };

  const onSubmit = async (data: SettingsFormData) => {
    clearErrors("password");

    if (data.password) {
      if (data.password.length < 15) {
        setError("password", {
          type: "manual",
          message: t("password_too_short"),
        });
        toast.error(t("password_too_short"));
        return;
      }

      const weakPasswords = ["jelszo", "password", "qwerty", "admin"];

      if (
        weakPasswords.some((weakPassword) =>
          data.password.toLowerCase().includes(weakPassword),
        )
      ) {
        setError("password", {
          type: "manual",
          message: t("weak_password"),
        });
        toast.error(t("weak_password"));
        return;
      }
    }

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      await axios.patch(
        `${apiUrl}/user_details/`,
        {
          ...(data.email && { email: data.email }),
          ...(data.password && { password: data.password }),
          ...(lang && { lang: lang }),
          ...(data.name && { name: data.name }),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      i18n.changeLanguage(lang);
      onClose();
      onUpdated?.();
    } catch (error) {
      console.error("Error while updating user details:", error);

      if (axios.isAxiosError(error)) {
        const responseError = error.response?.data?.error;
        const passwordError = error.response?.data?.password;

        if (responseError || passwordError) {
          toast.error(
            String(responseError ?? passwordError),
          );
          return;
        }
      }

      toast.error(t("could_not_save"));
    }
  };

  return (
    <FormSetUp onSubmit={handleSubmit(onSubmit)} className="settings">
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
