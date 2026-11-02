import { FormFieldProps } from "../../../models";
import { FieldError } from "../field-error/field-error";

export const FormField = ({
  id,
  label,
  error,
  hint,
  children,
}: FormFieldProps) => {
  return (
    <div className="input-group">
      {hint}
      <label htmlFor={id}>{label}</label>
      {children}
      <FieldError message={error?.message} />
    </div>
  );
};
