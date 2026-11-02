import { useTranslation } from "react-i18next";
import { FieldErrorProps } from "../../../models";

export const FieldError = ({ message }: FieldErrorProps) => {
  const { t } = useTranslation();

  if (!message) return null;

  return (
    <p className="errors" role="alert">
      {t(message)}
    </p>
  );
};
