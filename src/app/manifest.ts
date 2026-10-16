import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Monad Tour Colombia 2026 | MonadBlitz",
    short_name: "MonadBlitz",
    description:
      "MonadBlitz Medellín: un Blitz de un día para construir en Monad. 17 de octubre de 2026.",
    start_url: "/",
    display: "standalone",
    background_color: "#0E091C",
    theme_color: "#0E091C",
    lang: "es-CO",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
