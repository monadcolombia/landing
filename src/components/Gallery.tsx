"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { GalleryImage } from "@/lib/types";

const EASING = [0.16, 1, 0.3, 1] as const;

/*
 * Gallery images from past MonadBlitz events.
 *
 * HOW TO ADD IMAGES:
 * 1. Download images from Monad's event feed (Twitter/X, Discord, etc.)
 * 2. Save them to /public/images/gallery/
 * 3. Add entries below with the correct path, alt text, and city
 * 4. Recommended dimensions: at least 800x600px, JPG or WebP
 *
 * Once images are added, remove USE_PLACEHOLDERS flag.
 */
const USE_PLACEHOLDERS = false;

const GALLERY_IMAGES: GalleryImage[] = [
  {
    src: "/images/gallery/medellin-v1-01.webp",
    alt: "Builders trabajando en MonadBlitz Medellín, 6 de junio de 2026",
    city: "Medellín",
  },
  {
    src: "/images/gallery/medellin-v1-02.webp",
    alt: "Equipos hackeando en Indie Universe durante MonadBlitz Medellín",
    city: "Medellín",
  },
  {
    src: "/images/gallery/medellin-v1-03.webp",
    alt: "Equipo revisando código en MonadBlitz Medellín",
    city: "Medellín",
  },
  {
    src: "/images/gallery/medellin-v1-04.webp",
    alt: "Equipo presentando su proyecto en MonadBlitz Medellín",
    city: "Medellín",
  },
  {
    src: "/images/gallery/medellin-v1-05.webp",
    alt: "Cierre de MonadBlitz Medellín con los hoodies del evento",
    city: "Medellín",
  },
  {
    src: "/images/gallery/medellin-v1-06.webp",
    alt: "Equipo de MonadBlitz Medellín frente al backdrop de la ciudad",
    city: "Medellín",
  },
];

const PLACEHOLDER_GRADIENTS = [
  "linear-gradient(135deg, #6E54FF 0%, #85E6FF 100%)",
  "linear-gradient(135deg, #85E6FF 0%, #DDD7FE 100%)",
  "linear-gradient(135deg, #FF8EE4 0%, #FFAE45 100%)",
  "linear-gradient(135deg, #FFAE45 0%, #6E54FF 100%)",
  "linear-gradient(135deg, #DDD7FE 0%, #FF8EE4 100%)",
  "linear-gradient(135deg, #6E54FF 0%, #FF8EE4 100%)",
];

export default function Gallery() {
  if (GALLERY_IMAGES.length === 0) return null;

  return (
    <section id="galeria" className="py-16 sm:py-20 px-6 bg-monad-dark overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASING }}
          className="mb-12"
        >
          <p className="text-[10px] sm:text-xs font-mono uppercase tracking-[3px] text-white/40 mb-4">
            {"// GALERÍA"}
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-white max-w-3xl">
            Así fue Medellín
          </h2>
          <p className="text-base sm:text-lg text-white/50 mt-4 max-w-xl leading-relaxed">
            La edición del 6 de junio de 2026. Ganaron Vertex, MonadRoad y Lorentz. Mención de honor
            para TrustLayer.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="https://www.instagram.com/medellinblock"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center rounded-full border border-white/20 px-4 text-xs font-mono uppercase tracking-wide text-white/80 hover:border-monad-primary/60 hover:text-white"
            >
              Ver en Instagram
            </a>
            <a
              href="https://x.com/MedellinBlock"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center rounded-full border border-white/20 px-4 text-xs font-mono uppercase tracking-wide text-white/80 hover:border-monad-primary/60 hover:text-white"
            >
              Ver en X
            </a>
          </div>
        </motion.div>

        {/* Image grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {GALLERY_IMAGES.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: EASING }}
              className="relative overflow-hidden rounded-lg group aspect-[4/3]"
            >
              {USE_PLACEHOLDERS ? (
                <>
                  {/* Placeholder gradient with dot pattern */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: PLACEHOLDER_GRADIENTS[i % PLACEHOLDER_GRADIENTS.length],
                      opacity: 0.6,
                    }}
                  />
                  <div
                    className="absolute inset-0 opacity-10"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle, rgba(255,255,255,0.4) 0.7px, transparent 0.7px)",
                      backgroundSize: "16px 16px",
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <svg
                        className="w-8 h-8 mx-auto text-white/30 mb-2"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="M21 15l-5-5L5 21" />
                      </svg>
                      <span className="text-[10px] font-mono uppercase tracking-[2px] text-white/40">
                        {img.city}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 sm:p-3">
                    {img.city && (
                      <span className="text-[10px] font-mono uppercase tracking-[2px] text-white/90">
                        {img.city}
                      </span>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
