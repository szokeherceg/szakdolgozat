import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate, Link } from "react-router-dom";
import { FormSetUp } from "../../components";
import { Image, Input, Button } from "../../components";

import SZE from "./../../assets/SZE.png";
import Show from "./../../assets/show-password.svg";
import Hide from "./../../assets/hide-password.svg";

import "./registration.css";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export const SignUp: React.FC = () => {
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
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: { email: string; password: string }) => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    if (users.some((user: { email: string }) => user.email === data.email)) {
      alert(t("email_already_exists"));
      return;
    }

    users.push(data);
    localStorage.setItem("users", JSON.stringify(users));

    navigate("/");
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

      <Button type="submit" className="button">
        {t("signup")}
      </Button>

      <Link to="/" className="nav">
        {t("hasprofile")}
      </Link>
    </FormSetUp>
  );
};
