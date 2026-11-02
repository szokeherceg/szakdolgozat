import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import { ForgotPasswordModal } from "./ForgotPassword";
import {
  FormSetUp,
  Image,
  Input,
  Button,
  FieldError,
  LanguageSelector,
} from "../../components";
import { DataNameModel, SignInFormData } from "../../models";
import { apiUrl } from "../../utils/api";

import SZE from "./../../assets/SZE.png";
import Show from "./../../assets/show-password.svg";
import Hide from "./../../assets/hide-password.svg";

import "./auth.css";

export const SignIn = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [lang, setLang] = useState(i18n.language);
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  const schema = yup.object().shape({
    email: yup.string().email(t("invalid_email")).required(t("required_field")),
    password: yup.string().required(t("required_field")),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  useEffect(() => {
    i18n.changeLanguage(lang);
  }, [lang, i18n]);

  const onSubmit = async (data: SignInFormData) => {
    try {
      const response = await axios.post(`${apiUrl}/login/`, data);
      const { access, refresh } = response.data;

      localStorage.setItem(DataNameModel.ACCESS_TOKEN, access);
      localStorage.setItem(DataNameModel.REFRESH_TOKEN, refresh);

      toast.success(t("login_successful"));
      navigate("/MainPage");
    } catch {
      toast.error(t("login_failed"));
    }
  };

  return (
    <>
      <div className="signin-container">
        <LanguageSelector value={lang} onChange={setLang} />
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
            <FieldError message={errors.email?.message} />

            <Input
              type="password"
              placeholder={t("password")}
              {...register("password")}
              srcShow={Show}
              srcHide={Hide}
            />
            <FieldError message={errors.password?.message} />
          </div>
          <Button type="submit" className="button">
            {t("login")}
          </Button>
          <div className="nav">
            <div>{t("noprofile")}</div>
            <div>
              <Link to="/">{t("signup")}</Link>
            </div>
            <div>{t("forgot_password_question")}</div>
            <div>
              <Link
                to="#"
                onClick={(event) => {
                  event.preventDefault();
                  setShowPasswordReset(true);
                }}
              >
                {t("forgot_password")}
              </Link>
            </div>
          </div>
        </FormSetUp>
      </div>

      {showPasswordReset && (
        <ForgotPasswordModal onClose={() => setShowPasswordReset(false)} />
      )}
    </>
  );
};
