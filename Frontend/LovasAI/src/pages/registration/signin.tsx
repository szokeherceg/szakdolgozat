import axios from "axios";
import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { toast } from "react-toastify";

import { FormSetUp, Image, Input, Button } from "../../components";

import SZE from "./../../assets/SZE.png";
import Show from "./../../assets/show-password.svg";
import Hide from "./../../assets/hide-password.svg";

import "./registration.css";

const apiUrl = import.meta.env.VITE_BASE_URL;

export const SignIn = () => {
  const { t, i18n } = useTranslation();

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
      .post(`${apiUrl}/user/login/`, data)
      .then((response) => {
        const { access, refresh } = response.data;

        localStorage.setItem("accessToken", access);
        localStorage.setItem("refreshToken", refresh);

        toast.success(t("login_successful"));
        navigate("/MainPage");
        axios.defaults.headers.common["Authorization"] = `Bearer ${access}`;
      })
      .catch((error) => {
        if (error.response && error.response.data === 401) {
          toast.error(t("login_failed"));
        } else {
          toast.error(t("login_failed"));
        }
      });
  };

  useEffect(() => {
    i18n.changeLanguage("en");
  }, [i18n.language]);

  return (
    <FormSetUp
      onSubmit={handleSubmit(onSubmit)}
      hasModal={false}
      className="container"
    >
      <div className="logo">
        {" "}
        <Image src={SZE} />
      </div>
      <div className="page-name">LovasAI</div>
      <div className="registration-type">{t("login")}</div>
      <div className="form-group">
        <Input type="email" placeholder={t("email")} {...register("email")} />
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
  );
};
