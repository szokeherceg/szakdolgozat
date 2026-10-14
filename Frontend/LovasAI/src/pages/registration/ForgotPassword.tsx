import { useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { Input, Button, FormSetUp } from "../../components";
import { toast } from "react-toastify";
import "../pages.css";

const apiUrl = import.meta.env.VITE_BASE_URL;

type ForgotPasswordModalProps = {
  onClose: () => void;
};

export const ForgotPasswordModal = ({
  onClose,
}: ForgotPasswordModalProps) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) {
      toast.error(t("required_field"));
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${apiUrl}/password-reset/`,
        { email: email.trim() },
      );

      toast.success(
        response.data.message || t("password_reset_email_sent"),
      );
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
        <h2 className="settings-header">
          {t("forgot_password")}
        </h2>

        <label className="block text-sm font-medium text-gray-600">
          {t("email")}
        </label>

        <Input
          type="email"
          placeholder={t("email")}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />

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