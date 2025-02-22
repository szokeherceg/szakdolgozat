import React, { ReactEventHandler, ReactNode } from "react";
import "./form.css";

interface FormSetUpProps {
  children: ReactNode;
  height: string;
  width: string;
  onSubmit?: ReactEventHandler<HTMLElement>;
}

export const FormSetUp: React.FC<FormSetUpProps> = ({
  children,
  height,
  width,
  onSubmit,
}) => {
  return (
    <form className="container" style={{ height, width }} onSubmit={onSubmit}>
      {children}
    </form>
  );
};
