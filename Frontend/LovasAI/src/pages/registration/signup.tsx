import { useEffect, useState } from "react";
import { setI18n, useTranslation } from "react-i18next";
import axios from "axios";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Button, FormSetUp, Input, Image } from "../../components";

import SZE from "./../../assets/SZE.png";
import Show from "./../../assets/show-password.svg";
import Hide from "./../../assets/hide-password.svg";

import "./registration.css";

const apiUrl = import.meta.env.VITE_BASE_URL;

export const SignUp: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [lang, setLang] = useState(i18n.language);

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

  const handleLanguageChange = (language: string) => {
    setLang(language);
    i18n.changeLanguage(language);
    setValue("lang", language);
  };

  return (
    <>
      <div className="registration-lang">
        <select
          {...register("lang")}
          value={lang}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="block w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-blue-200"
        >
          <option value="hu">{t("hungarian")}</option>
          <option value="en">{t("english")}</option>
          <option value="de">{t("german")}</option>
          <option value="ja">{t("japanese")}</option>
        </select>
        {errors.lang && <p className="errors">{errors.lang.message}</p>}
      </div>

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
    </>
  );
};
