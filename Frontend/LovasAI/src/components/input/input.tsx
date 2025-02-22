interface InputProps {
  type: string;
  className?: string;
  id?: string;
  placeholder?: string;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  type,
  className,
  id,
  placeholder,
  required,
}) => {
  return (
    <input
      type={type}
      className={className}
      id={id}
      placeholder={placeholder}
      required={required}
    />
  );
};
