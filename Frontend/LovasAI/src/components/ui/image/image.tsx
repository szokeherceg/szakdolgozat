import classNames from "classnames";
import { ImageProps } from "../../../models";

export const Image = ({
  src,
  height = "auto",
  width = "40vh",
  className,
  onClick,
}: ImageProps) => {
  if (!src) return null;

  return (
    <img
      src={src}
      alt="image"
      className={classNames("image-component", className)}
      style={{ height, width }}
      onClick={onClick}
    />
  );
};
