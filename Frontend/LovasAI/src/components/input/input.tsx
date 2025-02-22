import { ChangeEventHandler } from "react";

interface InputProps {
  type: string;
  className?: string;
  id?: string;
  placeholder?: string;
  value: string;
  onChange: ChangeEventHandler<HTMLElement>;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  type,
  className,
  id,
  placeholder,
  required,
  value,
  onChange,
}) => {
  return (
    <input
      type={type}
      className={className}
      id={id}
      value={value}
      placeholder={placeholder}
      required={required}
      onChange={onChange}
    />
  );
};
