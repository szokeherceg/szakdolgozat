import React from "react";
import SZE from "../../assets/SZE.png";

interface ImageProps {
  src?: string;
  height?: string;
  width?: string;
  className?: string;
  onClick?: () => void;
}

export const Image: React.FC<ImageProps> = ({
  src = SZE,
  height = "auto",
  width = "40vh",
  className = "",
  onClick,
}) => {
  return (
    <img
      src={src}
      alt="image"
      className={`image-component ${className}`}
      style={{ height, width, cursor: onClick ? "pointer" : "default" }}
      onClick={onClick}
    />
  );
};
