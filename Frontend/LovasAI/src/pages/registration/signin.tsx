import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { FormSetUp, Image, Input, Button } from "../../components";

import SZE from "./../../assets/SZE.png";
import Show from "./../../assets/show-password.svg";
import Hide from "./../../assets/hide-password.svg";

import "./registration.css";
import { useTranslation } from "react-i18next";

const schema = yup.object().shape({
  email: yup
    .string()
    .email("Érvénytelen email formátum!")
    .required("Az email megadása kötelező!"),
  password: yup
    .string()
    .min(6, "Minimum 6 karakter!")
    .required("A jelszó megadása kötelező!"),
});

export const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const [error, setError] = useState("");

  const generateToken = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  };

  const onSubmit = (data: { email: string; password: string }) => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    const user = users.find(
      (user: { email: string; password: string }) =>
        user.email === data.email && user.password === data.password
    );

    if (!user) {
      setError("Hibás email vagy jelszó!");
      return;
    }

    const token = generateToken();
    localStorage.setItem("authToken", token);

    navigate("/MainPage");
  };

  const { t, i18n } = useTranslation();

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
