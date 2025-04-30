import axios from "axios";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate, Link } from "react-router-dom";

import { toast } from "react-toastify";

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
    name: yup.string().required(t("required_name")),
    password: yup
      .string()
      .min(6, t("password_too_short"))
      .required(t("required_field")),
    password2: yup
      .string()
      .oneOf([yup.ref("password")], t("passwords_do_not_match"))
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

  const onSubmit = async (data: { email: string; password: string }) => {
    try {
      await axios.post("http://127.0.0.1:8080/user/register/", data);
      toast.success(t("registration_successful"));
      navigate("/SignIn");
    } catch (error: any) {
      if (error.response && error.response.data === 400) {
        toast.error(error.response.data.error);
      } else {
        toast.error(t("registration_failed"));
      }
    }
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
        <Image src={SZE} />
      </div>
      <div className="page-name">LovasAI</div>
      <div className="registration-type">{t("signup")}</div>
      <div className="form-group">
        <Input type="email" placeholder={t("email")} {...register("email")} />
        {errors.email && <p className="errors">{errors.email.message}</p>}
        <Input type="text" placeholder={t("name")} {...register("name")} />
        <Input
          type="password"
          placeholder={t("password")}
          {...register("password")}
          srcShow={Show}
          srcHide={Hide}
        />
        {errors.password && <p className="errors">{errors.password.message}</p>}
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
  );
};
