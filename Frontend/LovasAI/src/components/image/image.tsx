import React from "react";
import "./image.css";
import SZE from "../../assets/SZE.png";

interface ImageProps {
  src?: string;
  height?: string;
  width?: string;
}

export const Image: React.FC<ImageProps> = ({
  src = SZE,
  height = "auto",
  width = "40vh",
}) => {
  return <img src={src} alt="image" style={{ height, width }} />;
};
