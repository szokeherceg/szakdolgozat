import React from "react";

interface ImageProps {
  src?: string;
  height?: string;
  width?: string;
  className?: string;
  onClick?: () => void;
}

export const Image: React.FC<ImageProps> = ({
  src,
  height = "auto",
  width = "40vh",
  className = "",
  onClick,
}) => {
  if (!src) return null;

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
