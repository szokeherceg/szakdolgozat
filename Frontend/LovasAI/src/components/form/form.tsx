import { ReactEventHandler, ReactNode } from "react";
import classNames from "classnames";
import "./form.css";

interface FormSetUpProps {
  children: ReactNode;
  onSubmit?: ReactEventHandler<HTMLElement>;
  hasModal?: boolean;
  className?: string;
}

export const FormSetUp: React.FC<FormSetUpProps> = ({
  children,
  onSubmit,
  hasModal,
  className = "",
}) => {
  return (
    <>
      <form
        onSubmit={onSubmit}
        data-has-modal={hasModal}
        className={classNames(className)}
      >
        {children}
      </form>
    </>
  );
};
