import { useEffect, useState } from "react";
import fallback from "../assets/logos/fallback.jpg";

// Shows an image. If it fails to load, shows the fallback image instead.
export default function SafeImage({ src, alt = "", className = "", ...props }) {
  const [current, setCurrent] = useState(src || fallback);

  // if the src changes (for example when editing a product), reset it
  useEffect(() => {
    setCurrent(src || fallback);
  }, [src]);

  return (
    <img
      loading="lazy"
      {...props}
      src={current}
      alt={alt}
      className={className}
      onError={() => {
        if (current !== fallback) setCurrent(fallback);
      }}
    />
  );
}