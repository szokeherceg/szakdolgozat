import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { toast } from "react-toastify";

import { FormSetUp, Image, Input, Button } from "../../components";

import SZE from "./../../assets/SZE.png";
import Show from "./../../assets/show-password.svg";
import Hide from "./../../assets/hide-password.svg";

import "./registration.css";
import { useTranslation } from "react-i18next";

export const SignIn: React.FC = () => {
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

  const [error, setError] = useState("");

  const onSubmit = async (data: { email: string; password: string }) => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8080/user/login/",
        data
      );
      const token = response.data.token;

      localStorage.setItem("authToken", token);

      toast(t("login_successful"));
      navigate("/MainPage");
    } catch (error: any) {
      if (error.response && error.response.data) {
        setError(error.response.data.error || t("login_failed"));
      } else {
        setError(t("login_failed"));
      }
    }
  };

  useEffect(() => {}, [i18n.language]);

  return (
    <FormSetUp
      onSubmit={handleSubmit(onSubmit)}
      hasModal={false}
      className="container"
    >
      <Image src={SZE} />
      <div className="form-group">
        <Input type="email" placeholder={t("email")} {...register("email")} />
        {errors.email && <p className="errors">{errors.email.message}</p>}
      </div>

      <div className="form-group">
        <Input
          type="password"
          placeholder={t("password")}
          {...register("password")}
          srcShow={Show}
          srcHide={Hide}
        />
        {errors.password && <p className="errors">{errors.password.message}</p>}
      </div>

      {error && <p className="errors">{error}</p>}

      <Button type="submit" className="button">
        {t("login")}
      </Button>
      <Link to="/signup" className="nav">
        {t("noprofile")}
      </Link>
    </FormSetUp>
  );
};
