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
      <form onSubmit={onSubmit} className={classNames(className)}>
        {children}
      </form>
    </>
  );
};
