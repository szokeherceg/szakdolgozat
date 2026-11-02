import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Button,
  FieldError,
  FormSetUp,
  Input,
  Image,
  LanguageSelector,
} from "../../components";
import { DataNameModel, SignUpFormData } from "../../models";
import { apiUrl } from "../../utils/api";
import {
  isWeakPassword,
  MAX_USER_NAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  serverMessage,
} from "../../utils/validation";

import SZE from "./../../assets/SZE.png";
import Show from "./../../assets/show-password.svg";
import Hide from "./../../assets/hide-password.svg";

import "./auth.css";

const SERVER_FIELDS = ["email", "name", "password"] as const;

const supportedLanguages: string[] = [
  DataNameModel.HUNGARIAN,
  DataNameModel.ENGLISH,
];

export const SignUp = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [lang, setLang] = useState(() => {
    const lng = i18n.language || navigator.language.split("-")[0];
    return supportedLanguages.includes(lng)
      ? lng.split("-")[0]
      : DataNameModel.HUNGARIAN;
  });

  useEffect(() => {
    i18n.changeLanguage(lang);
  }, [lang, i18n]);

  const schema = yup.object().shape({
    email: yup
      .string()
      .trim()
      .email(t("invalid_email"))
      .required(t("required_field")),
    name: yup
      .string()
      .trim()
      .max(MAX_USER_NAME_LENGTH, t("name_too_long"))
      .required(t("required_name")),
    password: yup
      .string()
      .min(MIN_PASSWORD_LENGTH, t("password_too_short"))
      .required(t("required_field"))
      .test(
        "weak_password",
        t("weak_password"),
        (value) => !value || !isWeakPassword(value),
      ),
    password2: yup
      .string()
      .oneOf([yup.ref("password")], t("passwords_do_not_match"))
      .required(t("required_field")),
    lang: yup.string().required(),
  });

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    setFocus,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { lang },
  });

  const handleLanguageChange = (language: string) => {
    setLang(language);
    setValue("lang", language);
  };

  const onSubmit = async (data: SignUpFormData) => {
    try {
      const response = await axios.post(`${apiUrl}/register/`, data);

      if (response.status === 201) {
        toast.success(t("registration_successful"));
        navigate("/SignIn");
      }
    } catch (error) {
      const responseData = axios.isAxiosError(error)
        ? error.response?.data
        : undefined;

      const fieldErrors = SERVER_FIELDS.filter((field) => responseData?.[field]);

      if (fieldErrors.length === 0) {
        toast.error(t("registration_failed"));
        return;
      }

      fieldErrors.forEach((field) =>
        setError(field, {
          type: "server",
          message:
            field === "email"
              ? "email_already_exists"
              : serverMessage(responseData[field]),
        }),
      );
      setFocus(fieldErrors[0]);
    }
  };

  return (
    <div className="signin-container">
      <LanguageSelector value={lang} onChange={handleLanguageChange} />

      <FormSetUp onSubmit={handleSubmit(onSubmit)} className="container">
        <div className="logo">
          <Image src={SZE} />
        </div>
        <div className="page-name">LovasAI</div>
        <div className="registration-type">{t("signup")}</div>

        <div className="login-input">
          <Input type="email" placeholder={t("email")} {...register("email")} />
          <FieldError message={errors.email?.message} />

          <Input type="text" placeholder={t("name")} {...register("name")} />
          <FieldError message={errors.name?.message} />

          <Input
            type="password"
            placeholder={t("password")}
            {...register("password")}
            srcShow={Show}
            srcHide={Hide}
          />
          <FieldError message={errors.password?.message} />

          <Input
            type="password"
            placeholder={t("password2")}
            {...register("password2")}
            srcShow={Show}
            srcHide={Hide}
          />
          <FieldError message={errors.password2?.message} />
        </div>

        <Button type="submit" className="button">
          {t("signup")}
        </Button>

        <div className="nav">
          <div>{t("hasprofile")}</div>
          <div>
            <Link to="/SignIn">{t("login")}</Link>
          </div>
        </div>
      </FormSetUp>
    </div>
  );
};
