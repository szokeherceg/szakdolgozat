import { ChangeEventHandler, useState } from "react";
import { Image } from "../image/image";

import "./input.css";

interface InputProps {
  type: string;
  className?: string;
  id?: string;
  placeholder?: string;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  required?: boolean;
  srcShow?: string;
  srcHide?: string;
}

export const Input: React.FC<InputProps> = ({
  type,
  className = "",
  id,
  placeholder,
  required,
  value,
  onChange,
  srcShow,
  srcHide,
}) => {
  const [inputType, setInputType] = useState(type);

  const togglePasswordVisibility = () => {
    setInputType((prevType) => (prevType === "password" ? "text" : "password"));
  };

  return (
    <div className="input-container">
      <input
        type={inputType}
        className={`input-field ${className}`}
        id={id}
        value={value}
        placeholder={placeholder}
        required={required}
        onChange={onChange}
      />
      {type === "password" && srcShow && srcHide && (
        <Image
          src={inputType === "password" ? srcShow : srcHide}
          height="20px"
          width="20px"
          className="password-toggle"
          onClick={togglePasswordVisibility}
        />
      )}
    </div>
  );
};
