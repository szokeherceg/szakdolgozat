import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useForm } from "react-hook-form";
import { Input, Button, FormSetUp } from "../../components";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import Show from "../../assets/show-password.svg";
import Hide from "../../assets/hide-password.svg";

import "../pages.css";

const apiUrl = import.meta.env.VITE_BASE_URL;

type ResetPasswordFormData = {
  password: string;
  password2: string;
};

export const ResetPassword = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
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
      toast.error(t("invalid_reset_link"));
      return;
    }

    if (data.password.length < 15) {
      setError("password", {
        type: "manual",
        message: t("password_too_short"),
      });
      toast.error(t("password_too_short"));
      return;
    }

    const weakPasswords = ["jelszo", "password", "qwerty", "admin"];

    if (
      weakPasswords.some((weakPassword) =>
        data.password.toLowerCase().includes(weakPassword),
      )
    ) {
      setError("password", {
        type: "manual",
        message: t("weak_password"),
      });
      toast.error(t("weak_password"));
      return;
    }

    if (data.password !== data.password2) {
      setError("password2", {
        type: "manual",
        message: t("passwords_do_not_match"),
      });
      toast.error(t("passwords_do_not_match"));
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
      if (axios.isAxiosError(error)) {
        const responseError = error.response?.data?.error;

        if (
          responseError === "invalid-or-expired-token" ||
          responseError === "invalid-reset-request"
        ) {
          toast.error(t("invalid_reset_link"));
        } else if (Array.isArray(responseError)) {
          responseError.forEach((message: string) => {
            toast.error(String(message));
          });
        } else {
          toast.error(t("password_reset_failed"));
        }
      } else {
        toast.error(t("password_reset_failed"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormSetUp
      onSubmit={handleSubmit(onSubmit)}
      className="settings"
    >
      <h2 className="settings-header">
        {t("reset_password")}
      </h2>

      <label className="block text-sm font-medium text-gray-600">
        {t("new_password")}
      </label>
      <Input
        type="password"
        placeholder={t("new_password")}
        {...register("password", {
          required: t("required_field"),
          minLength: {
            value: 15,
            message: t("password_too_short"),
          },
          validate: (value) => {
            const weakPasswords = ["jelszo", "password", "qwerty", "admin"];

            return (
              !weakPasswords.some((weakPassword) =>
                value.toLowerCase().includes(weakPassword),
              ) || t("weak_password")
            );
          },
        })}
        srcShow={Show}
        srcHide={Hide}
      />
      {errors.password && (
            <p className="errors">{errors.password.message}</p>
          )}

      <label className="block text-sm font-medium text-gray-600">
        {t("password2")}
      </label>
      <Input
        type="password"
        placeholder={t("password2")}
        {...register("password2", {
          required: t("required_field"),
          validate: (value) =>
            value === watch("password") ||
            t("passwords_do_not_match"),
        })}
        srcShow={Show}
        srcHide={Hide}
      />
        {errors.password2 && (
            <p className="errors">{errors.password2.message}</p>
          )}

      <div className="settings-buttons">
        <Button
          type="button"
          onClick={() => navigate("/SignIn")}
        >
          {t("back")}
        </Button>
        <Button type="submit" disabled={loading}>
          {t("save")}
        </Button>
      </div>
    </FormSetUp>
  );
};