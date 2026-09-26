import type { NextConfig } from "next";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/apply/mentor", destination: "/apply?role=mentor", permanent: false },
      { source: "/apply/judge", destination: "/apply?role=judge", permanent: false },
      { source: "/apply/volunteer", destination: "/apply?role=volunteer", permanent: false },
    ];
  },
  turbopack: {
    root: dirname(fileURLToPath(import.meta.url)),
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
