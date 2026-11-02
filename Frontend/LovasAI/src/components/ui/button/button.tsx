import { ButtonProps } from "../../../models";
import "./button.css";

export const Button = ({ children, ...rest }: ButtonProps) => {
  return <button {...rest}>{children}</button>;
};
