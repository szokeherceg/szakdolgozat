import { FormEvent, useRef, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { Input, Button, FieldError, FormSetUp } from "../../components";
import { ForgotPasswordModalProps } from "../../models";
import { apiUrl } from "../../utils/api";
import { isValidEmail } from "../../utils/validation";
import "../../styles/pages.css";

export const ForgotPasswordModal = ({ onClose }: ForgotPasswordModalProps) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const emailInput = useRef<HTMLInputElement>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedEmail = email.trim();
    const error = !trimmedEmail
      ? "required_field"
      : !isValidEmail(trimmedEmail)
        ? "invalid_email"
        : undefined;

    setEmailError(error);

    if (error) {
      emailInput.current?.focus();
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${apiUrl}/password-reset/`, {
        email: trimmedEmail,
      });

      toast.success(t(response.data.message));
      onClose();
    } catch {
      toast.error(t("could_not_save"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <FormSetUp onSubmit={onSubmit} className="password-reset">
        <h2 className="settings-header">{t("forgot_password")}</h2>

        <label className="block text-sm font-medium text-gray-600">
          {t("email")}
        </label>

        <Input
          type="email"
          placeholder={t("email")}
          ref={emailInput}
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setEmailError(undefined);
          }}
          autoComplete="email"
        />
        <FieldError message={emailError} />

        <div className="settings-buttons">
          <Button type="button" onClick={onClose}>
            {t("back")}
          </Button>

          <Button type="submit" disabled={loading}>
            {t("send")}
          </Button>
        </div>
      </FormSetUp>
    </div>
  );
};
