import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Image } from "../image/image";
import "./input.css";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  srcShow?: string;
  srcHide?: string;
  isFileInput?: boolean;
}

export const Input: React.FC<InputProps> = ({
  type,
  srcShow,
  srcHide,
  isFileInput = false,
  className = "",
  ...props
}) => {
  const [inputType, setInputType] = useState(type);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const togglePasswordVisibility = () => {
    setInputType((prevType) => (prevType === "password" ? "text" : "password"));
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    multiple: false,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setSelectedFile(acceptedFiles[0]);
      }
    },
  });

  if (isFileInput) {
    return (
      <div
        {...getRootProps()}
        className={`border-2 border-dashed border-gray-300 p-4 rounded-lg text-center cursor-pointer hover:border-gray-500 transition ${className}`}
      >
        <input {...getInputProps()} />
        {selectedFile ? (
          <p className="text-green-600 font-semibold">{selectedFile.name}</p>
        ) : (
          <p className="text-gray-500">{props.placeholder}</p>
        )}
      </div>
    );
  }

  return (
    <div className="input-container">
      <input
        type={inputType}
        className={`w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 ${className}`}
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
