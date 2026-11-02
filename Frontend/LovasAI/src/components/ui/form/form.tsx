import { FormSetUpProps } from "../../../models";
import "./form.css";

export const FormSetUp = ({
  children,
  onSubmit,
  className = "",
}: FormSetUpProps) => {
  return (
    <form noValidate onSubmit={onSubmit} className={className}>
      {children}
    </form>
  );
};
