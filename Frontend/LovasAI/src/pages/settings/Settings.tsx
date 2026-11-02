import { useState, useEffect } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { Input, Button, FieldError, FormSetUp, Select } from "../../components";
import { SettingsFormData, SettingsProps } from "../../models";
import { apiUrl } from "../../utils/api";
import {
  isValidEmail,
  isWeakPassword,
  MAX_USER_NAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  serverMessage,
} from "../../utils/validation";

import Show from "./../../assets/show-password.svg";
import Hide from "./../../assets/hide-password.svg";

import "../../styles/pages.css";

export const Settings = ({ onClose, onUpdated }: SettingsProps) => {
  const { t, i18n } = useTranslation();
  const [lang, setLang] = useState(i18n.language);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    setFocus,
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

  const languageOptions = [
    { value: "hu", label: t("hungarian") },
    { value: "en", label: t("english") },
  ];

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: userData } = await axios.get(`${apiUrl}/user_details/`);

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
    setValue("language", language);
  };

  const getFieldErrors = (data: SettingsFormData) => {
    const fieldErrors: Partial<Record<keyof SettingsFormData, string>> = {};
    const email = data.email.trim();

    if (!email) {
      fieldErrors.email = "required_field";
    } else if (!isValidEmail(email)) {
      fieldErrors.email = "invalid_email";
    }

    if (data.name.trim().length > MAX_USER_NAME_LENGTH) {
      fieldErrors.name = "name_too_long";
    }

    if (data.password) {
      if (data.password.length < MIN_PASSWORD_LENGTH) {
        fieldErrors.password = "password_too_short";
      } else if (isWeakPassword(data.password)) {
        fieldErrors.password = "weak_password";
      }
    }

    return fieldErrors;
  };

  const onSubmit = async (data: SettingsFormData) => {
    clearErrors();

    const fieldErrors = Object.entries(getFieldErrors(data)) as [
      keyof SettingsFormData,
      string,
    ][];

    if (fieldErrors.length > 0) {
      fieldErrors.forEach(([field, message]) =>
        setError(field, { type: "manual", message }),
      );
      setFocus(fieldErrors[0][0]);
      return;
    }

    try {
      await axios.patch(`${apiUrl}/user_details/`, {
        ...(data.email && { email: data.email.trim() }),
        ...(data.password && { password: data.password }),
        ...(lang && { lang }),
        ...(data.name.trim() && { name: data.name.trim() }),
      });

      i18n.changeLanguage(lang);
      onClose();
      onUpdated?.();
    } catch (error) {
      console.error("Error while updating user details:", error);

      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data;
        const passwordError = responseData?.error ?? responseData?.password;

        if (responseData?.email) {
          setError("email", { type: "server", message: "email_already_exists" });
          setFocus("email");
          return;
        }

        if (responseData?.name) {
          setError("name", { type: "server", message: "name_too_long" });
          setFocus("name");
          return;
        }

        if (passwordError) {
          setError("password", {
            type: "server",
            message: serverMessage(passwordError),
          });
          setFocus("password");
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
      <FieldError message={errors.email?.message} />

      <label className="block text-sm font-medium text-gray-600">
        {t("name")}
      </label>
      <Input type="text" {...register("name")} placeholder={t("name")} />
      <FieldError message={errors.name?.message} />

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
      <FieldError message={errors.password?.message} />

      <div className="lang">
        <label
          htmlFor="language"
          className="block text-sm font-medium text-gray-600 mb-2"
        >
          {t("language")}
        </label>
        <div className="settings-select">
          <Select
            inputId="language"
            options={languageOptions}
            value={lang}
            onChange={handleLanguageChange}
            placeholder={t("language")}
            isClearable={false}
            isSearchable={false}
          />
        </div>
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
