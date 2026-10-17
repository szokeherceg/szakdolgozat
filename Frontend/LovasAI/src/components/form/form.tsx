import { ReactEventHandler, ReactNode } from "react";
import classNames from "classnames";
import "./form.css";

interface FormSetUpProps {
  children: ReactNode;
  onSubmit?: ReactEventHandler<HTMLElement>;

  className?: string;
}

export const FormSetUp: React.FC<FormSetUpProps> = ({
  children,
  onSubmit,
  className = "",
}) => {
  return (
    <>
      <form noValidate onSubmit={onSubmit} className={className}>
        {children}
      </form>
    </>
  );
};
