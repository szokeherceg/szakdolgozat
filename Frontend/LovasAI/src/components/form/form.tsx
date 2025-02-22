import React, { ReactNode } from "react";
import "./form.css";

interface FormSetUpProps {
  children: ReactNode;
  height: string;
  width: string;
}

export const FormSetUp: React.FC<FormSetUpProps> = ({
  children,
  height,
  width,
}) => {
  return (
    <form className="container" style={{ height, width }}>
      {children}
    </form>
  );
};
