import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { DataNameModel } from "../../models";
import { Button, Dropdown, FormSetUp, Input, Image } from "../../components";

import SZE from "./../../assets/SZE.png";
import Show from "./../../assets/show-password.svg";
import Hide from "./../../assets/hide-password.svg";

import "./registration.css";

const apiUrl = import.meta.env.VITE_BASE_URL;

export const SignUp = () => {
  const { t, i18n } = useTranslation();

  const getInitialLang = () => {
    const lng = i18n.language || navigator.language.split("-")[0];
    return [
      DataNameModel.HUNGARIAN,
      DataNameModel.ENGLISH,
      DataNameModel.GERMAN,
      DataNameModel.JAPANESE,
    ].includes(lng as DataNameModel)
      ? lng.split("-")[0]
      : DataNameModel.HUNGARIAN;
  };

  const [lang, setLang] = useState(getInitialLang());

  useEffect(() => {
    i18n.changeLanguage(lang);
  }, [lang, i18n]);

  const schema = yup.object().shape({
    email: yup.string().email(t("invalid_email")).required(t("required_field")),
    name: yup.string().required(t("required_name")),
    password: yup
      .string()
      .min(6, t("password_too_short"))
      .required(t("required_field")),
    password2: yup
      .string()
      .oneOf([yup.ref("password")], t("passwords_do_not_match"))
      .required(t("required_field")),
    lang: yup.string().required(),
  });

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      lang: lang,
    },
  });

  const handleLanguageChange = (language: string) => {
    setLang(language);
    setValue("lang", language);
  };

  const onSubmit = async (data: {
    email: string;
    name: string;
    password: string;
    password2: string;
    lang: string;
  }) => {
    try {
      await axios.post(`${apiUrl}/register/`, data);
      toast.success(t("registration_successful"));
      navigate("/SignIn");
    } catch (error: any) {
      if (error.response && error.response.status === 400) {
        toast.error(error.response.data?.error || t("registration_failed"));
      } else {
        toast.error(t("registration_failed"));
      }
    }
  };

  return (
    <div className="signin-container">
      <div className="language">
        <Dropdown
          buttonLabel={lang}
          items={[
            {
              label: t("hungarian"),
              onClick: () => handleLanguageChange(DataNameModel.HUNGARIAN),
            },
            {
              label: t("english"),
              onClick: () => handleLanguageChange(DataNameModel.ENGLISH),
            },
            {
              label: t("german"),
              onClick: () => handleLanguageChange(DataNameModel.GERMAN),
            },
            {
              label: t("japanese"),
              onClick: () => handleLanguageChange(DataNameModel.JAPANESE),
            },
          ]}
        />
      </div>

      <FormSetUp onSubmit={handleSubmit(onSubmit)} className="container">
        <div className="logo">
          <Image src={SZE} />
        </div>
        <div className="page-name">LovasAI</div>
        <div className="registration-type">{t("signup")}</div>

        <div className="login-input">
          <Input type="email" placeholder={t("email")} {...register("email")} />
          {errors.email && <p className="errors">{errors.email.message}</p>}

          <Input type="text" placeholder={t("name")} {...register("name")} />
          {errors.name && <p className="errors">{errors.name.message}</p>}

          <Input
            type="password"
            placeholder={t("password")}
            {...register("password")}
            srcShow={Show}
            srcHide={Hide}
          />
          {errors.password && (
            <p className="errors">{errors.password.message}</p>
          )}

          <Input
            type="password"
            placeholder={t("password2")}
            {...register("password2")}
            srcShow={Show}
            srcHide={Hide}
          />
          {errors.password2 && (
            <p className="errors">{errors.password2.message}</p>
          )}
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
