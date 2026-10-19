import type { MetadataRoute } from "next";

const BASE_URL = "https://monadcolombia.xyz";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: BASE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/equipo`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/apply`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/privacidad`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/feedback`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE_URL}/terminos`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
}
