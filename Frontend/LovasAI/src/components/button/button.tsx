import React from "react";
import "./button.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  ...rest
}) => {
  return (
    <button onClick={onClick} {...rest}>
      {children}
    </button>
  );
};
