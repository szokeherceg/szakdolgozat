import React from "react";
import "./image.css";
import SZE from "../../assets/SZE.png";

interface ImageProps {
  src?: string;
}

export const Image: React.FC<ImageProps> = ({ src = SZE }) => {
  return <img src={src} alt="image" />;
};
