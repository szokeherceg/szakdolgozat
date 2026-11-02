import NotFound from "../assets/notfound.png";

export const apiUrl = import.meta.env.VITE_BASE_URL;

export const getMediaUrl = (path?: string | null) => {
  if (!path) return NotFound;

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${apiUrl}${path.startsWith("/") ? path : `/${path}`}`;
};
