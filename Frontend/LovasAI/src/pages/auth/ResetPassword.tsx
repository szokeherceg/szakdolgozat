import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { Input, Button, FieldError, FormSetUp } from "../../components";
import { ResetPasswordFormData } from "../../models";
import { apiUrl } from "../../utils/api";
import {
  isWeakPassword,
  MIN_PASSWORD_LENGTH,
  serverMessage,
} from "../../utils/validation";

import Show from "../../assets/show-password.svg";
import Hide from "../../assets/hide-password.svg";

import { ForgotPasswordModal } from "./ForgotPassword";

import "../../styles/pages.css";

export const ResetPassword = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const uid = searchParams.get("uid");
  const token = searchParams.get("token");
  const [linkInvalid, setLinkInvalid] = useState(!uid || !token);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const {
    register,
    handleSubmit,
    clearErrors,
    setError,
    setFocus,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    defaultValues: {
      password: "",
      password2: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    clearErrors();

    if (!uid || !token) {
      setLinkInvalid(true);
      toast.error(t("invalid_reset_link"));
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${apiUrl}/password-reset/confirm/`, {
        uid,
        token,
        password: data.password,
      });

      toast.success(t("password_reset_success"));
      navigate("/SignIn");
    } catch (error) {
      const responseError = axios.isAxiosError(error)
        ? error.response?.data?.error
        : undefined;

      if (
        responseError === "invalid-or-expired-token" ||
        responseError === "invalid-reset-request"
      ) {
        setLinkInvalid(true);
        toast.error(t("invalid_reset_link"));
      } else if (Array.isArray(responseError)) {
        setError("password", {
          type: "server",
          message: serverMessage(responseError),
        });
        setFocus("password");
      } else {
        toast.error(t("password_reset_failed"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FormSetUp onSubmit={handleSubmit(onSubmit)} className="settings">
        <h2 className="settings-header">{t("reset_password")}</h2>

        <label className="block text-sm font-medium text-gray-600">
          {t("new_password")}
        </label>
        <Input
          type="password"
          placeholder={t("new_password")}
          {...register("password", {
            required: t("required_field"),
            minLength: {
              value: MIN_PASSWORD_LENGTH,
              message: t("password_too_short"),
            },
            validate: (value) => !isWeakPassword(value) || t("weak_password"),
          })}
          srcShow={Show}
          srcHide={Hide}
        />
        <FieldError message={errors.password?.message} />

        <label className="block text-sm font-medium text-gray-600">
          {t("password2")}
        </label>
        <Input
          type="password"
          placeholder={t("password2")}
          {...register("password2", {
            required: t("required_field"),
            validate: (value) =>
              value === watch("password") || t("passwords_do_not_match"),
          })}
          srcShow={Show}
          srcHide={Hide}
        />
        <FieldError message={errors.password2?.message} />

        <div className="settings-buttons">
          <Button type="button" onClick={() => navigate("/SignIn")}>
            {t("back")}
          </Button>
          {linkInvalid ? (
            <Button type="button" onClick={() => setShowForgotPassword(true)}>
              {t("request_new_link")}
            </Button>
          ) : (
            <Button type="submit" disabled={loading}>
              {t("save")}
            </Button>
          )}
        </div>
      </FormSetUp>

      {showForgotPassword && (
        <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} />
      )}
    </>
  );
};
