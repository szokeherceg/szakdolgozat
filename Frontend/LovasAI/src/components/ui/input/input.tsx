import { useState } from "react";
import { InputProps } from "../../../models";
import { Image } from "../image/image";
import "./input.css";

export const Input = ({
  type,
  srcShow,
  srcHide,
  className = "",
  ...props
}: InputProps) => {
  const [inputType, setInputType] = useState(type);

  const togglePasswordVisibility = () => {
    setInputType((prevType) => (prevType === "password" ? "text" : "password"));
  };

  return (
    <div className="input-container">
      <input
        type={inputType}
        className={`w-full p-3 border rounded-lg shadow-sm focus:ring-2 ${className}`}
        {...props}
      />
      {type === "password" && srcShow && srcHide && (
        <Image
          src={inputType === "password" ? srcHide : srcShow}
          height="30px"
          width="25px"
          className="password-toggle"
          onClick={togglePasswordVisibility}
        />
      )}
    </div>
  );
};
