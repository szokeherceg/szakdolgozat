import { useState } from "react";
import { Image } from "../image/image";
import "./input.css";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  srcShow?: string;
  srcHide?: string;
}

export const Input: React.FC<InputProps> = ({
  type,
  srcShow,
  srcHide,
  ...props
}) => {
  const [inputType, setInputType] = useState(type);

  const togglePasswordVisibility = () => {
    setInputType((prevType) => (prevType === "password" ? "text" : "password"));
  };

  return (
    <div className="input-container">
      <input
        type={inputType}
        className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
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
