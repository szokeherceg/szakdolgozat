import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { DataNameModel } from "../../models";

import { toast } from "react-toastify";

import { FormSetUp, Image, Input, Button, Dropdown } from "../../components";

import SZE from "./../../assets/SZE.png";
import Show from "./../../assets/show-password.svg";
import Hide from "./../../assets/hide-password.svg";

import "./registration.css";

const apiUrl = import.meta.env.VITE_BASE_URL;

export const SignIn = () => {
  const { t, i18n } = useTranslation();
  const [lang, setLang] = useState(i18n.language);

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
    setLang(language);
  };

  const schema = yup.object().shape({
    email: yup.string().email(t("invalid_email")).required(t("required_field")),
    password: yup
      .string()
      .min(6, t("password_too_short"))
      .required(t("required_field")),
  });

  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = (data: { email: string; password: string }) => {
    axios
      .post(`${apiUrl}/login/`, data)
      .then((response) => {
        const { access, refresh } = response.data;

        localStorage.setItem(DataNameModel.ACCESS_TOKEN, access);
        localStorage.setItem(DataNameModel.REFRESH_TOKEN, refresh);

        toast.success(t("login_successful"));
        navigate("/MainPage");
        axios.defaults.headers.common["Authorization"] = `Bearer ${access}`;
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          toast.error(t("login_failed"));
        } else {
          toast.error(t("login_failed"));
        }
      });
  };

  useEffect(() => {
    i18n.changeLanguage(lang);
  }, [lang, i18n]);

  return (
    <>
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
          <div className="registration-type">{t("login")}</div>
          <div className="login-input">
            <Input
              type="email"
              placeholder={t("email")}
              {...register("email")}
            />
            {errors.email && <p className="errors">{errors.email.message}</p>}

            <Input
              type="password"
              placeholder={t("password")}
              {...register("password")}
              srcShow={Show}
              srcHide={Hide}
            />
          </div>
          <Button type="submit" className="button">
            {t("login")}
          </Button>
          <div className="nav">
            <div>{t("noprofile")}</div>
            <div>
              <Link to="/">{t("signup")}</Link>
            </div>
          </div>
        </FormSetUp>
      </div>
    </>
  );
};
